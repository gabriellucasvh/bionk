"use client";

import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
    type: string;
    url: string;
    title?: string;
    className?: string;
    customButtonCorners?: string;
    onPlayClick?: () => void;
    thumbnailUrl?: string;
}

export default function VideoPlayer({
    type,
    url,
    title,
    className = "",
    customButtonCorners,
    onPlayClick,
    thumbnailUrl,
}: VideoPlayerProps) {
	const getBorderRadius = () => {
		if (customButtonCorners && customButtonCorners !== "") {
			return `${customButtonCorners}px`;
		}
		return;
	};

	const borderRadius = getBorderRadius();
	const aspectRatio = type === "tiktok" ? "aspect-[9/16]" : "aspect-video";
	const baseClasses = `w-full ${aspectRatio} ${borderRadius ? "" : ""} ${className}`;
	const inlineStyle = borderRadius ? { borderRadius } : undefined;
	const [currentSrc, setCurrentSrc] = useState(url);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const getParentHost = () => {
		try {
			return window.location.hostname || "localhost";
		} catch {
			return "localhost";
		}
	};
	const getTwitchClipSlug = (u: string) => {
		try {
			const base = u.startsWith("http") ? u : `https://${u}`;
			const urlObj = new URL(base);
			const host = urlObj.hostname.replace("www.", "");
			if (host === "clips.twitch.tv") {
				const clipParam = urlObj.searchParams.get("clip");
				if (clipParam) {
					return clipParam;
				}
				const p = urlObj.pathname.split("/").filter(Boolean);
				return p[0] || "";
			}
			if (host === "twitch.tv") {
				const p = urlObj.pathname.split("/").filter(Boolean);
				if (p.length >= 3 && p[1] === "clip" && p[2]) {
					return p[2];
				}
			}
		} catch {}
		return "";
	};

	const getYouTubeId = (u: string) => {
		try {
			const y = new URL(u);
			const host = y.hostname.replace("www.", "");
			if (host === "youtu.be") {
				const p = y.pathname.split("/").filter(Boolean);
				return p[0] || "";
			}
			if (host === "youtube.com") {
				if (y.pathname.startsWith("/embed/")) {
					const p = y.pathname.split("/").filter(Boolean);
					return p[1] || "";
				}
				const v = y.searchParams.get("v");
				if (v) {
					return v;
				}
			}
		} catch {}
		return "";
	};

	const buildAutoplaySrc = (u: string) => {
		const hasQuery = u.includes("?");
		if (type === "youtube") {
			const id = getYouTubeId(u);
			if (id) {
				return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
			}
			return `${u}${hasQuery ? "&" : "?"}autoplay=1`;
		}
		if (type === "vimeo") {
			return `${u}${hasQuery ? "&" : "?"}autoplay=1`;
		}
		if (type === "tiktok") {
			return u;
		}
		if (type === "twitch") {
			const slug = getTwitchClipSlug(u);
			if (slug) {
				const parent = getParentHost();
				const parentsParam =
					parent === "localhost"
						? "parent=localhost"
						: `parent=${encodeURIComponent(parent)}&parent=localhost`;
				return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&${parentsParam}&autoplay=true&muted=true`;
			}
			return u;
		}
		return u;
	};


	const handlePlay = () => {
		if (onPlayClick) {
			onPlayClick();
		}
		if (type === "direct") {
			if (videoRef.current) {
				videoRef.current.play();
			}
			setIsPlaying(true);
			return;
		}
		const next = buildAutoplaySrc(url);
		setCurrentSrc(next);
		setIsPlaying(true);
	};

	if (type === "direct") {
		return (
			<div className="relative">
				<video
					className={baseClasses}
					controls
					playsInline
					preload="metadata"
					ref={videoRef}
					src={currentSrc}
					style={inlineStyle}
					title={title}
				>
					<track
						default
						kind="captions"
						label="Português"
						src="/captions/sample.vtt"
						srcLang="pt"
					/>
				</video>
				{!isPlaying && (
					<>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
						<button
							aria-label="Reproduzir"
							className="absolute inset-0 z-20 flex items-center justify-center"
							onClick={handlePlay}
							type="button"
						>
							<span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/60 shadow-lg backdrop-blur-md transition-all hover:bg-white/90 active:scale-[0.98]">
								<Play className="h-7 w-7 fill-current text-black/90" />
							</span>
						</button>
					</>
				)}
			</div>
		);
	}

    if (type === "youtube") {
        const ytId = getYouTubeId(url);
        const thumb = thumbnailUrl && thumbnailUrl.trim().length > 0
            ? thumbnailUrl
            : ytId
            ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
            : "";
        return (
            <div className="relative">
                {isPlaying ? (
					<iframe
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						className={baseClasses}
						src={currentSrc}
						style={inlineStyle}
						title={title || "Vídeo do YouTube"}
					/>
				) : (
					<div
						className={baseClasses}
						style={{
							...inlineStyle,
							backgroundImage: thumb ? `url(${thumb})` : undefined,
							backgroundSize: "cover",
							backgroundPosition: "center",
							backgroundColor: "black",
						}}
					/>
				)}
				{!isPlaying && (
					<>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
						<button
							aria-label="Reproduzir"
							className="absolute inset-0 z-20 flex items-center justify-center"
							onClick={handlePlay}
							type="button"
						>
							<span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/60 shadow-lg backdrop-blur-md transition-all hover:bg-white/90 active:scale-[0.98]">
								<Play className="h-7 w-7 fill-current text-black/90" />
							</span>
						</button>
					</>
				)}
			</div>
		);
	}

    if (type === "vimeo") {
        return (
            <div className="relative">
                {isPlaying ? (
					<iframe
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
						className={baseClasses}
						src={currentSrc}
						style={inlineStyle}
						title={title || "Vídeo do Vimeo"}
					/>
                ) : (
                    <div
                        className={baseClasses}
                        style={{
                            ...inlineStyle,
                            backgroundImage:
                                thumbnailUrl && thumbnailUrl.trim().length > 0
                                    ? `url(${thumbnailUrl})`
                                    : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundColor: "black",
                        }}
                    />
                )}
				{!isPlaying && (
					<>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
						<button
							aria-label="Reproduzir"
							className="absolute inset-0 z-20 flex items-center justify-center"
							onClick={handlePlay}
							type="button"
						>
							<span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/60 shadow-lg backdrop-blur-md transition-all hover:bg-white/90 active:scale-[0.98]">
								<Play className="h-7 w-7 fill-current text-black/90" />
							</span>
						</button>
					</>
				)}
			</div>
		);
	}

	if (type === "tiktok") {
		return (
			<iframe
				allow="encrypted-media"
				allowFullScreen
				className={baseClasses}
				src={url}
				style={inlineStyle}
				title={title || "Vídeo do TikTok"}
			/>
		);
	}

	if (type === "twitch") {
		const slug = getTwitchClipSlug(url);
		if (!slug) {
			return (
				<div
					className={`${baseClasses} flex items-center justify-center bg-black`}
					style={inlineStyle}
				>
					<p className="text-white/80">Vídeo do Twitch não suportado</p>
				</div>
			);
		}
		return (
			<div className="relative">
				{isPlaying ? (
					<iframe
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
						className={baseClasses}
						referrerPolicy="no-referrer-when-downgrade"
						src={currentSrc}
						style={inlineStyle}
						title={title || "Vídeo do Twitch"}
					/>
				) : (
					<div
						className={baseClasses}
						style={{
							...inlineStyle,
							backgroundColor: "black",
						}}
					/>
				)}
				{!isPlaying && (
					<>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
						<button
							aria-label="Reproduzir"
							className="absolute inset-0 z-20 flex items-center justify-center"
							onClick={handlePlay}
							type="button"
						>
							<span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/60 shadow-lg backdrop-blur-md transition-all hover:bg-white/90 active:scale-[0.98]">
								<Play className="h-7 w-7 fill-current text-black/90" />
							</span>
						</button>
					</>
				)}
			</div>
		);
	}

	return (
		<div
			className={`${baseClasses} flex items-center justify-center bg-gray-100`}
			style={inlineStyle}
		>
			<p className="text-gray-500">Tipo de vídeo não suportado</p>
		</div>
	);
}
