"use client";

import { SquareArrowOutUpRight } from "lucide-react";

export default function ShareButton({ onClick }: { onClick: () => void }) {
	return (
		<div className="relative mb-4 flex w-full justify-end">
			<button
				aria-label="Compartilhar perfil"
				className="absolute z-50 flex items-center justify-center rounded-full border border-white/20 bg-white/80 p-2 shadow shadow-black/10 backdrop-blur-md transition-colors hover:bg-white/90"
				onClick={onClick}
				type="button"
			>
				<SquareArrowOutUpRight
					className="size-4.5 text-black"
					strokeWidth={1.5}
				/>
			</button>
		</div>
	);
}
