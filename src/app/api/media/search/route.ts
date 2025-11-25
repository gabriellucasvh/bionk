import { NextResponse } from "next/server";
export const runtime = "nodejs";

type MediaItem = {
	id: string;
	type: "image" | "video";
	provider: "pexels" | "coverr";
	previewUrl: string;
	url: string; // direct/media URL suitable for import
	width?: number;
	height?: number;
	authorName?: string;
	authorLink?: string;
	sourceLink?: string;
	// Optional tracking endpoints required by providers
	coverrDownloadUrl?: string; // Coverr mp4_download
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q")?.trim() || "";
	const type = (searchParams.get("type") || "image") as "image" | "video";
	const perPage = Number.parseInt(searchParams.get("per_page") || "20", 10);
	const page = Number.parseInt(searchParams.get("page") || "1", 10);

	try {
		if (type === "image") {
			const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
			if (!PEXELS_API_KEY) {
				return NextResponse.json(
					{ error: "PEXELS_API_KEY não configurado" },
					{ status: 500 }
				);
			}

			const url = new URL("https://api.pexels.com/v1/search");
			url.searchParams.set("query", q || "wallpaper");
			url.searchParams.set("orientation", "portrait");
			url.searchParams.set("per_page", String(perPage));
			url.searchParams.set("page", String(page));

			const resp = await fetch(url, {
				headers: { Authorization: PEXELS_API_KEY },
			});
			if (!resp.ok) {
				const text = await resp.text();
				return NextResponse.json(
					{ error: `Falha na busca do Pexels: ${text}` },
					{ status: 502 }
				);
			}
			const json = (await resp.json()) as {
				photos: any[];
				total_results: number;
				page: number;
				per_page: number;
			};

			const items: MediaItem[] = (json.photos || []).map((r) => {
				const previewUrl = r.src?.portrait || r.src?.medium || r.src?.small;
				const directUrl = r.src?.original || r.src?.large2x || r.src?.large;
				const authorName = r.photographer || undefined;
				const authorLink = r.photographer_url || undefined;
				const sourceLink = r.url || undefined;

				return {
					id: String(r.id),
					type: "image",
					provider: "pexels",
					previewUrl,
					url: directUrl,
					width: r.width,
					height: r.height,
					authorName,
					authorLink,
					sourceLink,
				} satisfies MediaItem;
			});

			return NextResponse.json({ items, provider: "pexels" });
		}

		// Videos (Coverr)
		const coverrUrl = new URL("https://api.coverr.co/videos");
		const COVERR_API_KEY = process.env.COVERR_API_KEY;
		if (!COVERR_API_KEY) {
			return NextResponse.json(
				{ error: "COVERR_API_KEY não configurado" },
				{ status: 500 }
			);
		}
		// Ensure vertical orientation is included in search terms so we actually get vertical hits
		const userQuery = q || "";
		const effectiveQuery = userQuery ? `${userQuery} vertical` : "vertical";
		coverrUrl.searchParams.set("query", effectiveQuery);
		coverrUrl.searchParams.set("page", String(page - 1)); // Coverr is 0-based
		coverrUrl.searchParams.set("page_size", String(perPage));
		coverrUrl.searchParams.set("urls", "true");

		const coverrResp = await fetch(coverrUrl, {
			headers: {
				Authorization: `Bearer ${COVERR_API_KEY}`,
			},
		});
		if (!coverrResp.ok) {
			const text = await coverrResp.text();
			return NextResponse.json(
				{ error: `Falha na busca do Coverr: ${text}` },
				{ status: 502 }
			);
		}
		const coverrJson = (await coverrResp.json()) as {
			page: number;
			pages: number;
			page_size: number;
			total: number;
			hits: any[];
		};

		const items: MediaItem[] = coverrJson.hits
			.filter((v) => v.is_vertical === true)
			.map((v) => {
				// Prefer low-res mp4 preview for consistent <video> thumbnails; fallback to image poster/thumbnail
				const previewUrl = v.urls?.mp4_preview || v.thumbnail || v.poster;
				const mp4Url = v.urls?.mp4 || v.urls?.mp4_preview;
				// Author info is not always present; fall back to source (Coverr)
				const authorName = v.credit?.author || v.credit?.source || "Coverr";
				const authorLink =
					v.credit?.author_url || v.credit?.source_url || undefined;
				const sourceLink =
					v.link || (v.id ? `https://coverr.co/videos/${v.id}` : undefined);
				const coverrDownloadUrl = v.urls?.mp4_download;

				return {
					id: String(v.id || v._id || v.slug || v.title),
					type: "video",
					provider: "coverr",
					previewUrl,
					url: mp4Url,
					authorName,
					authorLink,
					sourceLink,
					coverrDownloadUrl,
				} satisfies MediaItem;
			});

		return NextResponse.json({ items, provider: "coverr" });
	} catch (error) {
		console.error("Erro na busca de mídias:", error);
		return NextResponse.json(
			{ error: "Erro interno na busca" },
			{ status: 500 }
		);
	}
}
