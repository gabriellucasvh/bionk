import { type NextRequest, NextResponse } from "next/server";
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
import prisma from "@/lib/prisma";
import { getAuthRateLimiter } from "@/lib/rate-limiter";

const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;
// Função para limpar usernames reservados expirados
async function cleanupExpiredUsernameReservations() {
	try {
		const now = new Date();
		// Deletar usuários não verificados com reserva de username expirada
		await prisma.user.deleteMany({
			where: {
				emailVerified: null,
				usernameReservationExpiry: {
					lt: now,
				},
			},
		});
	} catch {
		//
	}
}

export async function GET(request: NextRequest) {
	try {
		// Executar limpeza de reservas expiradas
		await cleanupExpiredUsernameReservations();

		// Rate limiting
		const ip =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"127.0.0.1";
		const rateLimitResult = await getAuthRateLimiter().limit(ip);

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{ error: "Muitas tentativas. Tente novamente em alguns segundos." },
				{ status: 429 }
			);
		}

		const { searchParams } = new URL(request.url);
		const username = searchParams.get("username");

		if (!username) {
			return NextResponse.json(
				{ error: "Username é obrigatório" },
				{ status: 400 }
			);
		}

		// Normalizar username para lowercase
		const normalizedUsername = username.toLowerCase().trim();

		// Validar formato do username
		if (!USERNAME_REGEX.test(normalizedUsername)) {
			return NextResponse.json(
				{
					available: false,
					error:
						"Username deve ter entre 3-30 caracteres e conter apenas letras minúsculas, números, pontos, hífens e underscores",
				},
				{ status: 400 }
			);
		}

		// Verificar se username está na blacklist
		if (BLACKLISTED_USERNAMES.includes(normalizedUsername)) {
			return NextResponse.json({
				available: false,
				username: normalizedUsername,
				message: "Username não está disponível",
			});
		}

		// Verificar se username já existe ou está reservado
		const existingUser = await prisma.user.findUnique({
			where: { username: normalizedUsername },
			select: {
				id: true,
				emailVerified: true,
				usernameReservationExpiry: true,
				email: true,
			},
		});

		let available = true;
		let message = "Username disponível";

		if (existingUser) {
			// Se o usuário está verificado, username não está disponível
			if (existingUser.emailVerified) {
				available = false;
				message = "Username indisponível";
			}
			// Se há reserva ativa, username não está disponível temporariamente
			else if (
				existingUser.usernameReservationExpiry &&
				existingUser.usernameReservationExpiry > new Date()
			) {
				available = false;
				message = "Username temporariamente reservado";
			}
			// Se a reserva expirou, o username fica disponível novamente
			// (a limpeza automática removerá o registro posteriormente)
		}

		return NextResponse.json({
			available,
			username: normalizedUsername,
			message,
		});
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
