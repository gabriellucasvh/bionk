import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

type SectionItem = { id: number } & { [key: string]: any };

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.user.banido) {
		return NextResponse.json(
			{
				error: "Conta suspensa",
				message: "Sua conta foi suspensa e não pode realizar esta ação.",
			},
			{ status: 403 }
		);
	}

	const sections: SectionItem[] = await prisma.section.findMany({
		where: { userId: session.user.id },
		orderBy: { order: "asc" },
		include: { links: true },
	});

	// Transformar para incluir dbId
	const transformedSections = sections.map((section: SectionItem) => ({
		...section,
		id: `section-${section.id}`,
		dbId: section.id,
	}));

	return NextResponse.json(transformedSections);
}

export async function POST(req: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (session.user.banido) {
		return NextResponse.json(
			{
				error: "Conta suspensa",
				message: "Sua conta foi suspensa e não pode realizar esta ação.",
			},
			{ status: 403 }
		);
	}

	const { title } = await req.json();
	const r = getRedis();
	const uid = session.user.id;
	const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
	const shard =
		Math.abs(Array.from(uid).reduce((a, c) => a + c.charCodeAt(0), 0)) %
		shardCount;
	const payload = { userId: uid, title: String(title).trim() };
	await r.lpush(`ingest:sections:${uid}:${shard}`, JSON.stringify(payload));
	return NextResponse.json({ accepted: true }, { status: 202 });
}
