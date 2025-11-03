import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        if (!token || typeof token !== "string") {
            return NextResponse.json({ error: "Token inválido" }, { status: 400 });
        }
        const cookieStore = await cookies();
        const csrfCookie = cookieStore.get("reg_csrf");
        if (!(csrfCookie && csrfCookie.value)) {
            return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
        }
        const user = await prisma.user.findFirst({
            where: { otpToken: token },
            select: {
                registrationCsrfState: true,
                registrationCsrfExpiry: true,
                otpTokenExpiry: true,
                emailVerified: true
            }
        });
        if (!user) {
            return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
        }
        if (!user.registrationCsrfState || user.registrationCsrfState !== csrfCookie.value) {
            return NextResponse.json({ error: "CSRF inválido." }, { status: 400 });
        }
        if (!user.registrationCsrfExpiry || user.registrationCsrfExpiry < new Date()) {
            return NextResponse.json({ error: "CSRF expirado." }, { status: 410 });
        }
        if (!user.otpTokenExpiry || user.otpTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
        }
        if (user.emailVerified) {
            return NextResponse.json({ error: "E-mail já verificado." }, { status: 409 });
        }
        const remaining = Math.max(
            0,
            Math.ceil((user.otpTokenExpiry.getTime() - Date.now()) / 1000)
        );
        return NextResponse.json({ message: "Token válido", otpExpiry: remaining }, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
    }
}
