import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Esta função será chamada antes da requisição para qualquer rota
export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Checa se a rota é do studio
	if (pathname.startsWith("/studio")) {
		// Verifica se o token JWT está presente (autenticação com next-auth)
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		// Se não tiver token, redireciona para a página de login
		if (!token) {
			const loginUrl = new URL("/registro", req.url);
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next(); // Continua a requisição normalmente se o usuário estiver autenticado
}

export const config = {
	matcher: ["/studio/:path*"], // Protege todas as páginas dentro de /studio
};
