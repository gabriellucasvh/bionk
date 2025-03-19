// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Esta função será chamada antes da requisição para qualquer rota
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Checa se a rota é do dashboard
  if (pathname.startsWith('/dashboard')) {
    // Verifica se o token JWT está presente (autenticação com next-auth)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Se não tiver token, redireciona para a página de login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next(); // Continua a requisição normalmente se o usuário estiver autenticado
}

export const config = {
  matcher: ['/dashboard/:path*'], // Protege todas as páginas dentro de /dashboard
};
