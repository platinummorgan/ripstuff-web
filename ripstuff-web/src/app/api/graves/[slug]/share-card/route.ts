import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	return new Response(JSON.stringify({ message: "OK" }), { status: 200 });
}