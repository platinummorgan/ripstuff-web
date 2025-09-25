import { Prisma, ReactionType } from "@prisma/client";
import { NextRequest } from "next/server";

import { resolveDeviceHash } from "@/lib/device";
import { internalError, json, notFound, validationError } from "@/lib/http";
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