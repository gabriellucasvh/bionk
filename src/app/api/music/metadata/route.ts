import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	ensureHttps,
	fetchMetadataFromProvider,
	parseMusicUrl,
	resolveDeezerShortUrl,
} from "@/utils/music";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const inputUrl = (searchParams.get("url") || "").trim();
		if (!inputUrl) {
			return NextResponse.json(
				{ error: "Parâmetro 'url' é obrigatório" },
				{ status: 400 }
			);
		}

		// Resolver short link do Deezer, se necessário
		const maybeResolved = inputUrl.toLowerCase().includes("link.deezer.com")
			? await resolveDeezerShortUrl(inputUrl)
			: inputUrl;

		const normalized = ensureHttps(maybeResolved);
		const parsed = parseMusicUrl(normalized);

		if (
			!parsed.id ||
			parsed.type === "unknown" ||
			parsed.platform === "unknown"
		) {
			return NextResponse.json(
				{ error: "URL de música inválida" },
				{ status: 400 }
			);
		}

		try {
			const meta = await fetchMetadataFromProvider(parsed);
			return NextResponse.json({ metadata: meta });
		} catch {
			return NextResponse.json(
				{ error: "Falha ao obter metadados" },
				{ status: 502 }
			);
		}
	} catch {
		return NextResponse.json(
			{ error: "Erro interno do servidor" },
			{ status: 500 }
		);
	}
}
