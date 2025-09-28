import { NextRequest } from "next/server";

import { requireNotBanned, handleBanError } from "@/lib/ban-enforcement";
import { resolveDeviceHash } from "@/lib/device";
import { forbidden, internalError, json, notFound, rateLimitError, validationError } from "@/lib/http";
import prisma from "@/lib/prisma";
import { checkRateLimit, rateLimitRetrySeconds } from "@/lib/rate-limit";
import { sympathyInput } from "@/lib/validation";

interface RouteContext {
	params: { slug: string };
}

const WINDOW_SECONDS = Number.parseInt(process.env.SYMPATHY_WINDOW ?? "60", 10);
const LIMIT_PER_WINDOW = Number.parseInt(process.env.SYMPATHY_LIMIT ?? "1", 10);

function looksLikeUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(req: NextRequest, context: RouteContext) {
	const raw = await req.json().catch(() => null);
	const parsed = sympathyInput.safeParse(raw);
	if (!parsed.success) {
		return validationError(parsed.error);
	}

	const { slug } = await context.params;
	const deviceHash = resolveDeviceHash();

	// Check if user or device is banned
	try {
		await requireNotBanned(undefined, deviceHash);
	} catch (error) {
		if (error instanceof Error) {
			return handleBanError(error);
		}
		throw error;
	}

	// Find grave by id (uuid) or slug
	const grave = await prisma.grave.findFirst({
		where: looksLikeUuid(slug) ? { id: slug } : { slug },
		select: { id: true, status: true },
	});
	if (!grave || grave.status === "HIDDEN") {
		return notFound("Grave not found");
	}

	const rate = await checkRateLimit({
		scope: `sympathy:create:${grave.id}`,
		identifier: deviceHash,
		limit: LIMIT_PER_WINDOW,
		windowSeconds: WINDOW_SECONDS,
	});
	if (!rate.ok) {
		return rateLimitError(rateLimitRetrySeconds(rate));
	}

	try {
		const created = await prisma.sympathy.create({
			data: {
				graveId: grave.id,
				deviceHash,
				body: parsed.data.body,
			},
			select: { id: true, body: true, createdAt: true, deviceHash: true },
		});

		// Get creator info for the current user
		let creatorInfo = null;
		if (deviceHash) {
			const user = await prisma.user.findFirst({
				where: { deviceHash },
				select: { name: true, picture: true },
			});
			if (user) {
				creatorInfo = {
					name: user.name,
					picture: user.picture,
				};
			}
		}

		return json(
			{
				id: created.id,
				body: created.body,
				createdAt: created.createdAt.toISOString(),
				creatorInfo,
			},
			201,
		);
	} catch (error) {
		return internalError();
	}
}