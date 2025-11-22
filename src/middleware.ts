import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const allowedLocales = ["pt-br", "en", "es"] as const;

function detectLocaleFromHeader(
	req: NextRequest
): (typeof allowedLocales)[number] {
	const header = req.headers.get("accept-language") || "pt-BR";
	const lower = header.toLowerCase();
	if (lower.includes("pt")) {return "pt-br"};
	if (lower.includes("es")) {return "es"};
	return "en";
}

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const protectedPaths = ["/studio", "/checkout", "/profile"];
	if (protectedPaths.some((path) => pathname.startsWith(path))) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		if (!token) {
			const registroUrl = new URL("/registro", req.url);
			return NextResponse.redirect(registroUrl);
		}

		if (token.isBanned) {
			const banUrl = new URL("/acesso-negado", req.url);
			return NextResponse.redirect(banUrl);
		}

		if (token.status === "pending" || !token.onboardingCompleted) {
			const onboardingUrl = new URL("/onboarding", req.url);
			if (!pathname.startsWith("/onboarding")) {
				return NextResponse.redirect(onboardingUrl);
			}
		}
	}

	const res = NextResponse.next();
	const cookieLocale = req.cookies.get("locale")?.value as
		| (typeof allowedLocales)[number]
		| undefined;
	const effectiveLocale =
		cookieLocale && allowedLocales.includes(cookieLocale)
			? cookieLocale
			: detectLocaleFromHeader(req);
	if (!cookieLocale) {
		res.cookies.set("locale", effectiveLocale, { path: "/" });
	}
	res.headers.set("x-pathname", pathname);
	return res;
}

export const config = {
	matcher: [
		"/studio/:path*",
		"/checkout/:path*",
		"/onboarding/:path*",
		"/profile/:path*",
		"/((?!.*\\..*|_next).*)",
	],
};
