import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET(_request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const socialLinks = await prisma.socialLink.findMany({
            where: { userId: session.user.id },
            orderBy: { order: "asc" },
        });
        return NextResponse.json({ socialLinks });
    } catch {
        return NextResponse.json(
            { error: "Erro ao buscar links sociais" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const session = await getServerSession(authOptions);
    if (!(session?.user?.id)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { platform, username, url, active } = body;

        if (!(platform && username && url)) {
            return NextResponse.json(
                { error: "Campos platform, username e url são obrigatórios" },
                { status: 400 }
            );
        }

        const lastLink = await prisma.socialLink.findFirst({
            where: { userId: session.user.id },
            orderBy: { order: "desc" },
        });
        const newOrder = lastLink ? lastLink.order + 1 : 0;

        const newSocialLink = await prisma.socialLink.create({
            data: {
                userId: session.user.id,
                platform,
                username,
                url,
                active: active !== undefined ? active : true,
                order: newOrder,
            },
        });

        // Busca o username do usuário para revalidar sua página
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { username: true },
        });
        if (user?.username) {
            revalidatePath(`/${user.username}`);
        }

        return NextResponse.json(newSocialLink, { status: 201 });
    } catch (error) {
        // @ts-expect-error
        if (error.code === "P2002" && error.meta?.target?.includes("platform")) {
            return NextResponse.json(
                { error: "Já existe um link para esta plataforma." },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: "Erro ao criar link social" },
            { status: 500 }
        );
    }
}
