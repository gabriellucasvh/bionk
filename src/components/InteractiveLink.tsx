"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface InteractiveLinkProps {
	href: string;
	linkId: number;
	children: React.ReactNode;
	sensitive?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({
	href,
	linkId,
	children,
	sensitive,
	className = "",
	style = {},
}) => {
	const [unblurred, setUnblurred] = useState(false);
	const [isTouch, setIsTouch] = useState(false);

	useEffect(() => {
		const handleTouchStart = () => setIsTouch(true);
		window.addEventListener("touchstart", handleTouchStart, { once: true });
		return () => window.removeEventListener("touchstart", handleTouchStart);
	}, []);

	const handleClick = (e: React.MouseEvent) => {
		if (sensitive && isTouch && !unblurred) {
			e.preventDefault();
			setUnblurred(true);
			return;
		}

		const url = "/api/link-click";
		const data = JSON.stringify({ linkId });

		if (navigator.sendBeacon) {
			navigator.sendBeacon(url, data);
		} else {
			fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: data,
			});
		}
	};

	return (
		<Link
			className={twMerge(
				`relative flex w-full items-center justify-center text-start ${
					sensitive ? "group overflow-hidden border-red-200" : ""
				} ${className}`
			)}
			href={href}
			onClick={handleClick}
			rel="noopener noreferrer"
			style={style}
			target="_blank"
		>
			{sensitive && (
				<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-all duration-300">
					<div
						className={twMerge(
							"absolute inset-0 rounded-lg bg-black/20 backdrop-blur-md transition-all duration-300",
							(!isTouch &&
								"group-hover:bg-transparent group-hover:backdrop-blur-none") ||
								(isTouch && unblurred && "bg-transparent backdrop-blur-none")
						)}
					/>
					<span
						className={twMerge(
							"z-30 flex items-center gap-2 rounded-md bg-black/60 px-3 py-1 font-semibold text-sm text-white transition-opacity duration-300",
							(!isTouch && "group-hover:opacity-0") ||
								(isTouch && unblurred && "opacity-0")
						)}
					>
						<Eye size={16} />
						Conteúdo sensível
					</span>
				</div>
			)}

			<span className="relative z-10 w-full whitespace-pre-wrap break-words">
				{children}
			</span>
		</Link>
	);
};

export default InteractiveLink;
