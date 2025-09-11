import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Esta rota deve ser chamada por um cron job para limpar usuários pending antigos
export async function POST(request: Request) {
	try {
		// Verificar se a requisição tem a chave de autorização correta
		const authHeader = request.headers.get("authorization");
		const expectedToken = process.env.CLEANUP_API_TOKEN;
		
		if (!expectedToken) {
			return NextResponse.json(
				{ error: "Token de limpeza não configurado" },
				{ status: 500 }
			);
		}
		
		if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 }
			);
		}

		// Calcular data de 7 dias atrás
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Buscar usuários com status pending criados há mais de 7 dias
		const pendingUsers = await prisma.user.findMany({
			where: {
				status: "pending",
				createdAt: {
					lt: sevenDaysAgo,
				},
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
			},
		});

		if (pendingUsers.length === 0) {
			return NextResponse.json({
				message: "Nenhum usuário pending antigo encontrado",
				cleanedCount: 0,
			});
		}

		// Remover usuários pending antigos
		const deleteResult = await prisma.user.deleteMany({
			where: {
				id: {
					in: pendingUsers.map(user => user.id),
				},
			},
		});

		console.log(`Limpeza automática: ${deleteResult.count} usuários pending removidos`, {
			userIds: pendingUsers.map(u => u.id),
			emails: pendingUsers.map(u => u.email),
			createdDates: pendingUsers.map(u => u.createdAt),
		});

		return NextResponse.json({
			message: `Limpeza concluída: ${deleteResult.count} usuários removidos`,
			cleanedCount: deleteResult.count,
			cleanedUsers: pendingUsers.map(u => ({
				id: u.id,
				email: u.email,
				createdAt: u.createdAt,
			})),
		});
	} catch (error) {
		console.error("Erro na limpeza de usuários pending:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}

// Método GET para verificar quantos usuários seriam removidos (para testes)
export async function GET(request: Request) {
	try {
		// Verificar autorização
		const authHeader = request.headers.get("authorization");
		const expectedToken = process.env.CLEANUP_API_TOKEN;
		
		if (!expectedToken) {
			return NextResponse.json(
				{ error: "Token de limpeza não configurado" },
				{ status: 500 }
			);
		}
		
		if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
			return NextResponse.json(
				{ error: "Não autorizado" },
				{ status: 401 }
			);
		}

		// Calcular data de 7 dias atrás
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Contar usuários que seriam removidos
		const count = await prisma.user.count({
			where: {
				status: "pending",
				createdAt: {
					lt: sevenDaysAgo,
				},
			},
		});

		// Buscar alguns exemplos
		const examples = await prisma.user.findMany({
			where: {
				status: "pending",
				createdAt: {
					lt: sevenDaysAgo,
				},
			},
			select: {
				id: true,
				email: true,
				createdAt: true,
			},
			take: 5,
		});

		return NextResponse.json({
			message: "Prévia da limpeza",
			pendingUsersToClean: count,
			cutoffDate: sevenDaysAgo,
			examples,
		});
	} catch (error) {
		console.error("Erro na prévia de limpeza:", error);
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}