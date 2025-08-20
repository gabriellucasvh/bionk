import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const protectedPaths = ["/studio","/checkout"]

	if (protectedPaths.some(path => pathname.startsWith(path))) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		if (!token) {
			const registroUrl = new URL("/registro", req.url);
			return NextResponse.redirect(registroUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/studio/:path*", "/checkout/:path*"],
};
