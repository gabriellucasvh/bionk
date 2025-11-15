"use client"

import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { detectTrafficSource } from "@/utils/traffic-source";
import { CardImage } from "./utils/media";

const REJECTED_URLS = /^(https?:\/\/|mailto:|tel:|\/\/)/i;
interface ImageCardProps {
	image: any;
	customPresets?: any;
	buttonStyle?: React.CSSProperties;
	textStyle?: React.CSSProperties;
}

function normalizeExternalUrl(url?: string | null): string | null {
	if (!url) {
		return null;
	}
	const trimmed = url.trim();
	if (!trimmed) {
		return null;
	}
	if (REJECTED_URLS.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

export default function ImageCard({
	image,
	customPresets,
	buttonStyle,
	textStyle,
}: ImageCardProps) {
	const widthPercent = Math.max(
		10,
		Math.min(100, Number(image?.sizePercent) || 100)
	);
	const wrapperStyle: React.CSSProperties = {
		width: `${widthPercent}%`,
		marginLeft: "auto",
		marginRight: "auto",
	};
	const cornerValue = customPresets?.customButtonCorners || "12";

	const [canLeft, setCanLeft] = useState(false);
	const [canRight, setCanRight] = useState(false);
	const [isOverflowing, setIsOverflowing] = useState(false);

	const updateState = (el: HTMLElement | null) => {
		if (!el) {
			setCanLeft(false);
			setCanRight(false);
			setIsOverflowing(false);
			return;
		}
		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		const left = el.scrollLeft;
		setCanLeft(left > 0);
		setCanRight(Math.ceil(left) < maxScrollLeft);
		setIsOverflowing(el.scrollWidth > el.clientWidth);
	};

	useEffect(() => {
		const el = document.getElementById(`carousel-${image?.id}`);
		updateState(el as HTMLElement | null);
		const onResize = () => updateState(el as HTMLElement | null);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [image?.id]);

	const header = (
		<div className="mb-2 text-center" style={textStyle}>
			{image?.title ? (
				<h3 className="font-semibold text-lg">{image.title}</h3>
			) : null}
			{image?.description ? (
				<p className="text-sm opacity-80">{image.description}</p>
			) : null}
		</div>
	);

	const sendImageClickData = (imageId: number, itemIndex: number) => {
		try {
			const payload = JSON.stringify({
				imageId,
				itemIndex,
				trafficSource: detectTrafficSource(),
			});
			if ("sendBeacon" in navigator) {
				const blob = new Blob([payload], { type: "application/json" });
				navigator.sendBeacon("/api/image-click", blob);
			} else {
				fetch("/api/image-click", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: payload,
					keepalive: true,
				}).catch(() => {});
			}
		} catch {}
	};

	const renderImageItem = (img: any, idx: number, ratio?: string) => {
		const src = img?.previewUrl || img?.url;
		if (!src) {
			return null;
		}
		const content = (
			<CardImage alt={img?.authorName || "Imagem"} ratio={ratio} src={src} />
		);
		const href = normalizeExternalUrl(img?.linkUrl);
		if (href) {
			return (
				<a
					href={href}
					onClick={() => sendImageClickData(image?.id, idx)}
					rel="noopener noreferrer"
					target="_blank"
				>
					{content}
				</a>
			);
		}
		return content;
	};

	switch (image?.layout) {
		case "single":
			return (
				<div className="w-full" style={wrapperStyle}>
					{header}
					<div className="overflow-hidden" style={buttonStyle}>
						{renderImageItem(image?.items?.[0], 0, image?.ratio)}
					</div>
				</div>
			);
		case "column":
			return (
				<div
					className="w-full"
					style={{ marginLeft: "auto", marginRight: "auto" }}
				>
					<details>
						<summary className="list-none">
							<div
								className={cn(
									"group relative w-full rounded-xl p-1 shadow transition-all duration-200 hover:cursor-pointer hover:brightness-110"
								)}
								style={buttonStyle}
							>
								<div className="relative z-10 flex h-full w-full items-center">
									<div className="flex-shrink-0">
										<div className="ml-1 size-13" />
									</div>
									<div className="flex flex-1 justify-center">
										<h3 className="line-clamp-2 select-none px-2 font-medium leading-tight">
											{image?.title || "Imagens"}
										</h3>
									</div>
									<div className="w-10 flex-shrink-0" />
								</div>
								<div
									aria-hidden
									className="-translate-y-1/2 absolute top-1/2 right-3 z-20 rounded-full p-2 text-current opacity-70 transition-colors hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
								>
									<Images className="size-5" />
								</div>
							</div>
						</summary>
						<div style={wrapperStyle}>
							{image?.description ? (
								<p
									className="my-4 text-center text-sm opacity-80"
									style={textStyle}
								>
									{image.description}
								</p>
							) : null}
							<div className="mt-2 space-y-3">
								{(image?.items || []).map((img: any, idx: number) => (
									<div
										className="overflow-hidden"
										key={`img-${image?.id}-${idx}`}
										style={{ borderRadius: `${cornerValue}px` }}
									>
										{renderImageItem(img, idx, image?.ratio)}
									</div>
								))}
							</div>
						</div>
					</details>
				</div>
			);
		case "carousel":
			return (
				<div className="w-full" style={wrapperStyle}>
					{header}
					<div className="relative">
						<div
							className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-3"
							id={`carousel-${image?.id}`}
							onScroll={(e) => updateState(e.currentTarget as HTMLElement)}
						>
							{(image?.items || []).map((img: any, idx: number) => (
								<div
									className="w-64 flex-shrink-0 snap-center overflow-hidden"
									key={`img-${image?.id}-${idx}`}
									style={{ borderRadius: `${cornerValue}px` }}
								>
									{renderImageItem(img, idx, image?.ratio)}
								</div>
							))}
						</div>
						{isOverflowing && canLeft && (
							<button
								aria-label="Voltar"
								className="-translate-y-1/2 absolute top-1/2 left-2 rounded-full bg-black/50 p-2 shadow"
								onClick={() => {
									const el = document.getElementById(`carousel-${image?.id}`);
									el?.scrollBy({ left: -240, behavior: "smooth" });
								}}
								type="button"
							>
								<ChevronLeft className="h-5 w-5 text-white" />
							</button>
						)}
						{isOverflowing && canRight && (
							<button
								aria-label="Avançar"
								className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full bg-black/50 p-2 shadow"
								onClick={() => {
									const el = document.getElementById(`carousel-${image?.id}`);
									el?.scrollBy({ left: 240, behavior: "smooth" });
								}}
								type="button"
							>
								<ChevronRight className="h-5 w-5 text-white" />
							</button>
						)}
					</div>
				</div>
			);
		default:
			return (
				<div className="w-full" style={wrapperStyle}>
					{header}
				</div>
			);
	}
}
