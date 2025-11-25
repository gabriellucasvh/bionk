import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 2; // tentativa principal + 1 retentativa
const BACKOFF_MINUTES = [5]; // 02:05 como janela de retry
const REJEX_VERCEL_USERAGENT = /vercel-cron/i;

function computeNextRetryAt(now: Date, nextAttempt: number): Date | null {
	const delayMinutes = BACKOFF_MINUTES[nextAttempt - 1];
	if (!delayMinutes) {
		return null;
	}
	return new Date(now.getTime() + delayMinutes * 60 * 1000);
}

function errorToString(err: unknown): string {
	if (err instanceof Error) {
		return `${err.name}: ${err.message}`;
	}
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
}

function startOfMonthUTC(date: Date) {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0)
	);
}
function startOfDayUTC(date: Date) {
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			0,
			0,
			0,
			0
		)
	);
}
function endOfDayUTC(date: Date) {
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			23,
			59,
			59,
			999
		)
	);
}

export async function GET(request: Request) {
	const url = new URL(request.url);
	const token = url.searchParams.get("token") || "";
	const secret = process.env.CRON_SECRET || "";
	const vercelCronHeader = request.headers.get("x-vercel-cron");
	const userAgent = request.headers.get("user-agent") || "";
	const isVercelCron = vercelCronHeader === "1" || vercelCronHeader === "true";
	const isVercelUserAgent = REJEX_VERCEL_USERAGENT.test(userAgent);

	// Autoriza se for chamada de Cron da Vercel (header presente) OU se o token bater com o segredo
	if (!(isVercelCron || isVercelUserAgent || (secret && token === secret))) {
		console.warn("[cron/rollups] Não autorizado", {
			hasVercelHeader: !!vercelCronHeader,
			vercelCronHeader,
			userAgent,
			hasToken: !!token,
			tokenMatches: !!secret && token === secret,
		});
		return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
	}

	// Intervalo padrão: ontem (UTC)
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setUTCDate(now.getUTCDate() - 1);

	// Permitir override de data em desenvolvimento quando autenticado via token
	const dateParam = url.searchParams.get("date"); // formato YYYY-MM-DD
	const useCustomDate =
		!!dateParam &&
		secret &&
		token === secret &&
		process.env.NODE_ENV !== "production";

	const targetDate = (() => {
		if (!useCustomDate) {
			return yesterday;
		}
		try {
			// Interpretar como data UTC do dia informado
			const d = new Date(`${dateParam}T00:00:00.000Z`);
			return d;
		} catch {
			return yesterday;
		}
	})();

	// Bloquear datas futuras
	if (useCustomDate && startOfDayUTC(targetDate) > now) {
		return NextResponse.json(
			{ error: "Data no futuro não permitida" },
			{ status: 400 }
		);
	}

	const startOfTarget = startOfDayUTC(targetDate);
	const endOfTarget = endOfDayUTC(targetDate);
	const monthStart = startOfMonthUTC(targetDate);

	// Proteção de idempotência via ledger (uma execução por dia UTC)
	const source = isVercelCron ? "vercel" : "manual";
	const existingLedger = await prisma.dailyRollup.findUnique({
		where: { dayStart: startOfTarget },
	});
	if (existingLedger && existingLedger.status === "completed") {
		const response = NextResponse.json({
			ok: true,
			alreadyProcessed: true,
			range: {
				start: startOfTarget.toISOString(),
				end: endOfTarget.toISOString(),
				monthStart: monthStart.toISOString(),
			},
			updatedLinkRollups: 0,
			updatedUserRollups: 0,
		});
		response.headers.set("Cache-Control", "no-store");
		return response;
	}
	if (!existingLedger) {
		// Marca como pendente antes de consolidar para evitar paralelismo duplicado
		await prisma.dailyRollup.create({
			data: { dayStart: startOfTarget, status: "pending", source },
		});
	} else if (existingLedger.status === "pending") {
		// Já existe uma execução em andamento; evita duplicar
		const response = NextResponse.json({
			ok: true,
			inProgress: true,
			range: {
				start: startOfTarget.toISOString(),
				end: endOfTarget.toISOString(),
				monthStart: monthStart.toISOString(),
			},
			updatedLinkRollups: 0,
			updatedUserRollups: 0,
		});
		response.headers.set("Cache-Control", "no-store");
		return response;
	} else if (existingLedger.status === "failed") {
		// Se falhou, verificar se deve reexecutar ou aguardar próximo retry
		const attempts = existingLedger.attempts ?? 0;
		if (attempts >= MAX_ATTEMPTS) {
			const response = NextResponse.json({
				ok: false,
				exhausted: true,
				attempts,
				range: {
					start: startOfTarget.toISOString(),
					end: endOfTarget.toISOString(),
					monthStart: monthStart.toISOString(),
				},
			});
			response.headers.set("Cache-Control", "no-store");
			return response;
		}
		const nextRetryAt = existingLedger.nextRetryAt;
		if (nextRetryAt && nextRetryAt > now) {
			const response = NextResponse.json({
				ok: true,
				retryScheduled: true,
				attempts,
				nextRetryAt: nextRetryAt.toISOString(),
				range: {
					start: startOfTarget.toISOString(),
					end: endOfTarget.toISOString(),
					monthStart: monthStart.toISOString(),
				},
			});
			response.headers.set("Cache-Control", "no-store");
			return response;
		}
		// Pronto para tentar novamente
		await prisma.dailyRollup.update({
			where: { dayStart: startOfTarget },
			data: { status: "pending" },
		});
	}

	try {
		// Agregar cliques por userId/linkId para o dia alvo
		const clicksByLink: Array<{
			userId: string;
			linkId: number;
			clicks: number;
		}> = await prisma.$queryRaw<
			Array<{ userId: string; linkId: number; clicks: number }>
		>`
            SELECT l."userId" as "userId", lc."linkId" as "linkId", COUNT(lc.id)::int as clicks
            FROM "public"."LinkClick" lc
            JOIN "public"."Link" l ON l.id = lc."linkId"
            WHERE lc."createdAt" BETWEEN ${startOfTarget} AND ${endOfTarget}
            GROUP BY l."userId", lc."linkId";
        `;

		// Agregar views por userId para o dia alvo
		const viewsByUser: Array<{ userId: string; views: number }> =
			await prisma.$queryRaw<Array<{ userId: string; views: number }>>`
    SELECT pv."userId" as "userId", COUNT(pv.id)::int as views
    FROM "public"."ProfileView" pv
    WHERE pv."createdAt" BETWEEN ${startOfTarget} AND ${endOfTarget}
    GROUP BY pv."userId";
  `;

		// Agregar cliques por userId para o dia alvo
		const clicksByUser: Array<{ userId: string; clicks: number }> =
			await prisma.$queryRaw<Array<{ userId: string; clicks: number }>>`
    SELECT l."userId" as "userId", COUNT(lc.id)::int as clicks
    FROM "public"."LinkClick" lc
    JOIN "public"."Link" l ON l.id = lc."linkId"
    WHERE lc."createdAt" BETWEEN ${startOfTarget} AND ${endOfTarget}
    GROUP BY l."userId";
  `;

		// Upserts em paralelo para cliques por link
		let updatedLinkRollups = 0;
		const linkUpserts = clicksByLink.map((row) =>
			prisma.monthlyLinkAnalytics.upsert({
				where: {
					userId_linkId_monthStart: {
						userId: row.userId,
						linkId: row.linkId,
						monthStart,
					},
				},
				update: { clicks: { increment: row.clicks } },
				create: {
					userId: row.userId,
					linkId: row.linkId,
					monthStart,
					clicks: row.clicks,
				},
			})
		);
		await Promise.all(linkUpserts);
		updatedLinkRollups = clicksByLink.length;

		// Upserts em paralelo para views por usuário
		let updatedUserRollups = 0;
		const userViewUpserts = viewsByUser.map(
			(row: { userId: string; views: number }) =>
				prisma.monthlyUserAnalytics.upsert({
					where: {
						userId_monthStart: {
							userId: row.userId,
							monthStart,
						},
					},
					update: { views: { increment: row.views } },
					create: {
						userId: row.userId,
						monthStart,
						views: row.views,
						clicks: 0,
					},
				})
		);
		// Upserts em paralelo para cliques por usuário
		const userClickUpserts = clicksByUser.map(
			(row: { userId: string; clicks: number }) =>
				prisma.monthlyUserAnalytics.upsert({
					where: {
						userId_monthStart: {
							userId: row.userId,
							monthStart,
						},
					},
					update: { clicks: { increment: row.clicks } },
					create: {
						userId: row.userId,
						monthStart,
						clicks: row.clicks,
						views: 0,
					},
				})
		);
		await Promise.all([...userViewUpserts, ...userClickUpserts]);
		updatedUserRollups = viewsByUser.length + clicksByUser.length;

		const response = NextResponse.json({
			ok: true,
			range: {
				start: startOfTarget.toISOString(),
				end: endOfTarget.toISOString(),
				monthStart: monthStart.toISOString(),
			},
			updatedLinkRollups,
			updatedUserRollups,
		});
		response.headers.set("Cache-Control", "no-store");
		// Marcar ledger como concluído após sucesso
		await prisma.dailyRollup.update({
			where: { dayStart: startOfTarget },
			data: { status: "completed", nextRetryAt: null, lastError: null },
		});
		return response;
	} catch (error) {
		const errText = errorToString(error);
		// Incrementar tentativas e agendar próximo retry
		const ledger = await prisma.dailyRollup.findUnique({
			where: { dayStart: startOfTarget },
		});
		const attemptsSoFar = ledger?.attempts ?? 0;
		const nextAttempt = attemptsSoFar + 1;
		const nextRetryAt =
			nextAttempt >= MAX_ATTEMPTS ? null : computeNextRetryAt(now, nextAttempt);

		// Atualizar status para failed com backoff
		await prisma.dailyRollup.update({
			where: { dayStart: startOfTarget },
			data: {
				status: "failed",
				attempts: { increment: 1 },
				nextRetryAt,
				lastError: errText,
			},
		});

		// Enviar alerta imediato no primeiro erro (falha inicial às 02:00)
		if (nextAttempt === 1) {
			try {
				const resendApiKey = process.env.RESEND_API_KEY;
				if (resendApiKey) {
					const { Resend } = await import("resend");
					const resend = new Resend(resendApiKey);
					await resend.emails.send({
						from: process.env.RESEND_FROM_EMAIL || "contato@bionk.me",
						to: ["contato@bionk.me"],
						subject: "Falha inicial na consolidação diária de rollups",
						html: `
              <h2>Falha inicial ao consolidar rollups diários</h2>
              <p><strong>Dia:</strong> ${startOfTarget.toISOString()}</p>
              <p><strong>Tentativas:</strong> ${nextAttempt}</p>
              <p><strong>Erro:</strong> ${errText}</p>
              <p><strong>Próximo retry:</strong> ${nextRetryAt ? nextRetryAt.toISOString() : "n/a"}</p>
              <p>Fonte: ${source}</p>
            `,
					});
				}
			} catch {
				// Não bloquear resposta se alerta falhar
			}
		}

		const response = NextResponse.json({
			ok: false,
			error: "Falha ao consolidar rollups",
			attempts: nextAttempt,
			nextRetryAt: nextRetryAt ? nextRetryAt.toISOString() : null,
			range: {
				start: startOfTarget.toISOString(),
				end: endOfTarget.toISOString(),
				monthStart: monthStart.toISOString(),
			},
		});
		response.headers.set("Cache-Control", "no-store");
		return response;
	}
}
