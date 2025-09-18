import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const protectedPaths = ["/studio", "/checkout", "/profile"];

	if (protectedPaths.some((path) => pathname.startsWith(path))) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		if (!token) {
			const registroUrl = new URL("/registro", req.url);
			return NextResponse.redirect(registroUrl);
		}

		// Verificar se usuário está banido
		if (token.isBanned) {
			const banUrl = new URL("/acesso-negado", req.url);
			return NextResponse.redirect(banUrl);
		}

		// Verificar se usuário tem status pending
		if (token.status === "pending") {
			// Permitir acesso apenas à página de onboarding
			const onboardingUrl = new URL("/onboarding", req.url);
			if (!pathname.startsWith("/onboarding")) {
				return NextResponse.redirect(onboardingUrl);
			}
		}
	}

	// Adicionar pathname nos headers para o layout
	const response = NextResponse.next();
	response.headers.set("x-pathname", pathname);
	return response;
}

export const config = {
	matcher: [
		"/studio/:path*",
		"/checkout/:path*",
		"/onboarding/:path*",
		"/profile/:path*",
	],
};
