"use client";

import { useEffect, useRef } from "react";
import type { CustomPresets } from "@/types/user-profile";

export default function FixedBackground({
	customPresets,
	// hasScrolled is kept for compatibility but no longer toggles top
}: {
	customPresets: CustomPresets | any;
	hasScrolled?: boolean;
}) {
	const type = customPresets?.customBackgroundMediaType;
	const imageUrl = customPresets?.customBackgroundImageUrl;
	const videoUrl = customPresets?.customBackgroundVideoUrl;

	// Single ref for image or video element
	const bgRef = useRef<HTMLDivElement | HTMLVideoElement | null>(null);

	// Follow scroll up to the inherited rounded top radius, then freeze
	useEffect(() => {
		let raf = 0;
		const el = bgRef.current as HTMLElement | null;
		if (!el) {
			return;
		}

		// Detect inherited top border radius (rounded-[inherit])
		const cs = getComputedStyle(el);
		const radius = Number.parseFloat(cs.borderTopLeftRadius || "24");
		const threshold = Number.isFinite(radius) && radius > 0 ? radius : 24;

		const update = () => {
			const y = Math.min(window.scrollY || 0, threshold);
			el.style.transform = `translateY(-${y}px)`;
			el.style.willChange = "transform";
		};

		const onScroll = () => {
			if (raf) {
				return;
			}
			raf = requestAnimationFrame(() => {
				raf = 0;
				update();
			});
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		update();
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (raf) {
				cancelAnimationFrame(raf);
			}
		};
	}, []);

	if (type === "image" && imageUrl) {
		return (
			<div
				aria-hidden
				className={
					"pointer-events-none fixed right-0 left-0 z-0 mx-auto w-full max-w-[575px] rounded-[inherit] sm:top-5"
				}
				ref={bgRef as any}
				style={{
					height: "100dvh",
					backgroundImage: `url("${imageUrl}")`,
					backgroundAttachment: "fixed",
					backgroundSize: "cover",
					backgroundPosition: "top",
				}}
			/>
		);
	}

	if (type === "video" && videoUrl) {
		return (
			<video
				aria-hidden
				autoPlay
				className={
					"pointer-events-none fixed top-5 right-0 left-0 z-0 mx-auto w-full max-w-[575px] rounded-[inherit] object-cover"
				}
				controls={false}
				key={videoUrl}
				loop
				muted
				playsInline
				ref={bgRef as any}
				src={videoUrl}
				style={{ height: "100dvh" }}
			/>
		);
	}

	return null;
}
