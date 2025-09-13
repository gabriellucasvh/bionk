"use client";

import { Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArchivingLoaderProps {
	className?: string;
	size?: "sm" | "md" | "lg";
	showText?: boolean;
}

const ArchivingLoader = ({
	className,
	size = "md",
	showText = true,
}: ArchivingLoaderProps) => {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
	};

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3",
				className
			)}
		>
			{/* Container da animação */}
			<div className="relative">
				{/* Caixa de arquivo */}
				<div
					className={cn(
						"relative flex items-center justify-center rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-100 to-green-200 shadow-lg dark:border-green-700 dark:from-green-900/30 dark:to-green-800/30",
						sizeClasses[size]
					)}
				>
					{/* Ícone de arquivo com animação */}
					<Archive
						className={cn(
							"animate-pulse text-green-700 dark:text-green-300",
							{
								"h-4 w-4": size === "sm",
								"h-6 w-6": size === "md",
								"h-8 w-8": size === "lg",
							}
						)}
					/>

					{/* Documentos voando para dentro da caixa */}
					<div className="-top-2 -right-2 absolute">
						<div className="h-4 w-3 animate-[flyIn_1.5s_ease-in-out_infinite] rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700" />
					</div>
					<div className="-top-1 -right-3 absolute">
						<div className="h-4 w-3 animate-[flyIn_1.5s_ease-in-out_infinite_0.3s] rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700" />
					</div>
					<div className="-top-3 -right-1 absolute">
						<div className="h-4 w-3 animate-[flyIn_1.5s_ease-in-out_infinite_0.6s] rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700" />
					</div>
				</div>

				{/* Partículas de poeira/brilho */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-1 left-1 h-1 w-1 animate-[sparkle_2s_ease-in-out_infinite] rounded-full bg-green-400 dark:bg-green-300" />
					<div className="absolute right-1 bottom-2 h-1 w-1 animate-[sparkle_2s_ease-in-out_infinite_0.7s] rounded-full bg-green-400 dark:bg-green-300" />
					<div className="absolute top-2 right-2 h-1 w-1 animate-[sparkle_2s_ease-in-out_infinite_1.4s] rounded-full bg-green-400 dark:bg-green-300" />
				</div>
			</div>

			{/* Texto de loading */}
			{showText && (
				<div className="text-center">
					<p className="animate-pulse font-medium text-green-700 text-sm dark:text-green-300">
						Arquivando link...
					</p>
					<div className="mt-1 flex justify-center space-x-1">
						<div className="h-1 w-1 animate-[bounce_1.4s_ease-in-out_infinite] rounded-full bg-green-500 dark:bg-green-400" />
						<div className="h-1 w-1 animate-[bounce_1.4s_ease-in-out_infinite_0.2s] rounded-full bg-green-500 dark:bg-green-400" />
						<div className="h-1 w-1 animate-[bounce_1.4s_ease-in-out_infinite_0.4s] rounded-full bg-green-500 dark:bg-green-400" />
					</div>
				</div>
			)}
		</div>
	);
};

export default ArchivingLoader;
