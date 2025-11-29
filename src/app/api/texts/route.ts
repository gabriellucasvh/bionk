import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
export const runtime = "nodejs";

export async function POST(request: Request) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
	}

	try {
		const {
			title,
			description,
			position,
			hasBackground,
			isCompact,
			sectionId,
		} = await request.json();

		if (!title) {
			return NextResponse.json(
				{ error: "Título é obrigatório" },
				{ status: 400 }
			);
		}

		if (description && description.length > 1500) {
			return NextResponse.json(
				{ error: "Descrição deve ter no máximo 1500 caracteres" },
				{ status: 400 }
			);
		}

		const r = getRedis();
		const uid = session.user.id;
		const shardCount = Math.max(1, Number(process.env.INGEST_SHARDS || 8));
		const shard =
			Math.abs(Array.from(uid).reduce((a, c) => a + c.charCodeAt(0), 0)) %
			shardCount;
		const payload = {
			userId: uid,
			title: title.trim(),
			description: (description || "").trim(),
			position,
			hasBackground,
			isCompact,
			sectionId: sectionId || null,
		};
		await r.lpush(`ingest:texts:${uid}:${shard}`, JSON.stringify(payload));
		return NextResponse.json({ accepted: true }, { status: 202 });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");

		const texts = await prisma.text.findMany({
			where: {
				userId: session.user.id,
				archived: status === "archived",
			},
			orderBy: { order: "asc" },
		});

		return NextResponse.json({ texts });
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
