import { Prisma, ReactionType } from "@prisma/client";
import { NextRequest } from "next/server";

import { resolveDeviceHash } from "@/lib/device";
import { internalError, json, notFound, validationError } from "@/lib/http";
import { GmailNotificationService } from "@/lib/gmail-smtp-service";
import prisma from "@/lib/prisma";
import { reactionInput } from "@/lib/validation";

interface RouteContext {
	params: {
		slug: string; // may actually be a grave id
	};
}

function looksLikeUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const counterFieldByType: Record<ReactionType, keyof Prisma.GraveUncheckedUpdateInput> = {
	HEART: "heartCount",
	CANDLE: "candleCount",
	ROSE: "roseCount",
	LOL: "lolCount",
};

export async function POST(req: NextRequest, context: RouteContext) {
	const raw = await req.json().catch(() => null);
	const parsed = reactionInput.safeParse(raw);

	if (!parsed.success) {
		return validationError(parsed.error);
	}

	const { slug } = await context.params;
	if (!slug) {
		return notFound("Missing identifier");
	}

	const deviceHash = resolveDeviceHash();

	// Find grave by id (uuid) or slug
	const grave = await prisma.grave.findFirst({
		where: looksLikeUuid(slug) ? { id: slug } : { slug },
	});

	if (!grave || grave.status === "HIDDEN") {
		return notFound("Grave not found");
	}

	const field = counterFieldByType[parsed.data.type];

	try {
		if (parsed.data.action === "ADD") {
			let isNewReaction = false;
			try {
				await prisma.$transaction([
					prisma.reactionEvent.create({
						data: {
							graveId: grave.id,
							deviceHash,
							type: parsed.data.type,
						},
					}),
					prisma.grave.update({
						where: { id: grave.id },
						data: {
							[field]: { increment: 1 },
						},
					}),
				]);
				isNewReaction = true;
			} catch (error) {
				if (
					error instanceof Prisma.PrismaClientKnownRequestError &&
					error.code === "P2002"
				) {
					// Duplicate reaction — ignore and return current counts
				} else {
					throw error;
				}
			}

			// Trigger reaction notification
			if (isNewReaction) {
				try {
					// Get grave owner info for notification
					const graveWithOwner = await prisma.grave.findUnique({
						where: { id: grave.id },
						select: {
							title: true,
							slug: true,
							creatorDeviceHash: true
						}
					});

					if (graveWithOwner?.creatorDeviceHash) {
						// Find the user who created this grave
						const graveOwner = await prisma.user.findFirst({
							where: { deviceHash: graveWithOwner.creatorDeviceHash },
							select: { id: true, email: true }
						});

						if (graveOwner?.email) {
							// Get reactor info for notification
							let reactorName = "Anonymous Mourner";
							const reactor = await prisma.user.findFirst({
								where: { deviceHash },
								select: { name: true }
							});
							if (reactor?.name) {
								reactorName = reactor.name;
							}

							// Send automated reaction notification
							await GmailNotificationService.sendFirstReactionNotification(
								graveOwner.id,
								graveOwner.email,
								grave.id,
								{
									graveName: graveWithOwner.title,
									graveSlug: graveWithOwner.slug,
									reactorName,
									reactionType: parsed.data.type.toLowerCase(),
									graveUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ripstuff.net'}/grave/${graveWithOwner.slug}`
								}
							);
						}
					}
				} catch (notificationError) {
					// Don't fail the reaction if notification fails
					console.error('Failed to queue reaction notification:', notificationError);
				}
			}
		} else {
			// REMOVE
			const del = await prisma.reactionEvent.deleteMany({
				where: { graveId: grave.id, deviceHash, type: parsed.data.type },
			});
			if (del.count > 0) {
				await prisma.grave.update({
					where: { id: grave.id },
					data: {
						[field]: { decrement: 1 },
					},
				});
			}
		}

		const fresh = await prisma.grave.findUnique({
			where: { id: grave.id },
			select: {
				heartCount: true,
				candleCount: true,
				roseCount: true,
				lolCount: true,
			},
		});

		if (!fresh) {
			return internalError();
		}

		return json(
			{
				reactions: {
					heart: fresh.heartCount,
					candle: fresh.candleCount,
					rose: fresh.roseCount,
					lol: fresh.lolCount,
				},
			},
			200,
		);
	} catch (error) {
		return internalError();
	}
}