"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface InteractiveLinkProps {
	href: string;
	linkId: number;
	children: React.ReactNode;
	sensitive?: boolean;
	className?: string;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({
	href,
	linkId,
	children,
	sensitive,
	className = "",
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
			}).catch((error) => console.error("Erro ao registrar clique:", error));
		}
	};

	return (
		<Link
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
			className={twMerge(
				`relative flex items-center justify-center w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-start font-medium border border-gray-100 ${
					sensitive ? "border-red-200 group overflow-hidden" : ""
				} ${className}`,
			)}
		>
			{sensitive && (
				<div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-300">
					<div
						className={twMerge(
							"absolute inset-0 rounded-lg backdrop-blur-md bg-black/20 transition-all duration-300",
							(!isTouch &&
								"group-hover:backdrop-blur-none group-hover:bg-transparent") ||
								(isTouch && unblurred && "backdrop-blur-none bg-transparent"),
						)}
					/>
					<span
						className={twMerge(
							"z-30 flex items-center gap-2 text-sm font-semibold text-white bg-black/60 px-3 py-1 rounded-md transition-opacity duration-300",
							(!isTouch && "group-hover:opacity-0") ||
								(isTouch && unblurred && "opacity-0"),
						)}
					>
						<Eye size={16} />
						Conteúdo sensível
					</span>
				</div>
			)}

			<span className="relative z-10 break-words whitespace-pre-wrap w-full">
				{children}
			</span>
		</Link>
	);
};

export default InteractiveLink;
