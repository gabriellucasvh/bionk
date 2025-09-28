"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TextItem {
	id: number;
	title: string;
	description: string;
	position: "left" | "center" | "right";
	hasBackground: boolean;
	active: boolean;
	order: number;
	userId: number;
	isCompact: boolean;
}

interface TextCardProps {
	text: TextItem;
	textStyle?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;
	customPresets?: {
		customBackgroundColor: string;
		customBackgroundGradient: string;
		customTextColor: string;
		customFont: string;
		customButton: string;
		customButtonFill: string;
		customButtonCorners: string;
		customButtonColor: string;
		customButtonTextColor: string;
		customButtonStyle: string;
	};
	classNames?: {
		textCard?: string;
		textClasses?: string;
		cardClasses?: string;
		cardTextClasses?: string;
	};
}

export default function TextCard({
	text,
	textStyle,
	buttonStyle,
	customPresets,
	classNames,
}: TextCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	if (!text.active) {
		return null;
	}

	const textAlignClass = {
		left: "text-left",
		center: "text-center",
		right: "text-right",
	}[text.position];

	const displayText = text.description;

	const getTextClasses = () => {
		if (customPresets?.customTextColor) {
			return "";
		}

		if (text.hasBackground && classNames?.cardTextClasses) {
			return classNames.cardTextClasses;
		}

		return classNames?.textClasses || "";
	};

	const getCompactButtonStyle = () => {
		if (!customPresets) {
			return buttonStyle;
		}

		const cornerValue = customPresets.customButtonCorners || "12";
		const borderRadiusValue = `${cornerValue}px`;
		const buttonColor = customPresets.customButtonColor || "#ffffff";
		const textColor = customPresets.customButtonTextColor || "#000000";

		const baseStyle: React.CSSProperties = {
			borderRadius: borderRadiusValue,
			...buttonStyle,
		};

		switch (customPresets.customButtonStyle) {
			case "solid":
				return {
					...baseStyle,
					backgroundColor: buttonColor,
					border: "none",
					color: textColor,
				};
			case "outline":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px solid ${buttonColor}`,
					color: textColor,
				};
			case "soft":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}20`,
					border: `1px solid ${buttonColor}40`,
					color: textColor,
				};
			case "shadow":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}30`,
					border: `1px solid ${buttonColor}50`,
					color: textColor,
					boxShadow:
						"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				};
			case "neon":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px solid ${buttonColor}`,
					color: textColor,
					boxShadow: `0 0 8px ${buttonColor}40`,
				};
			case "dashed":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `2px dashed ${buttonColor}`,
					color: textColor,
				};
			case "double":
				return {
					...baseStyle,
					backgroundColor: "transparent",
					border: `4px double ${buttonColor}`,
					color: textColor,
				};
			case "raised":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}40`,
					borderTop: `2px solid ${buttonColor}`,
					borderLeft: `2px solid ${buttonColor}`,
					borderRight: `1px solid ${buttonColor}80`,
					borderBottom: `1px solid ${buttonColor}80`,
					color: textColor,
					boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.2)",
				};
			case "inset":
				return {
					...baseStyle,
					backgroundColor: `${buttonColor}40`,
					borderBottom: `2px solid ${buttonColor}`,
					borderRight: `2px solid ${buttonColor}`,
					borderTop: `1px solid ${buttonColor}80`,
					borderLeft: `1px solid ${buttonColor}80`,
					color: textColor,
					boxShadow: "inset 2px 2px 4px rgba(0, 0, 0, 0.2)",
				};
			default:
				switch (customPresets.customButtonFill) {
					case "filled":
						return {
							...baseStyle,
							backgroundColor: buttonColor,
							border: "none",
							color: textColor,
						};
					case "outlined":
						return {
							...baseStyle,
							backgroundColor: "transparent",
							border: "2px solid currentColor",
							color: textColor,
						};
					case "gradient":
						return {
							...baseStyle,
							backgroundColor: "transparent",
							backgroundImage:
								customPresets.customBackgroundGradient ||
								"linear-gradient(135deg, #c026d3 0%, #7c3aed 50%, #2563eb 100%)",
							border: "none",
							color: textColor,
						};
					default:
						return {
							...baseStyle,
							backgroundColor: buttonColor,
							border: "none",
							color: textColor,
						};
				}
		}
	};

	const textContent = text.isCompact ? (
		<div className="w-full">
			<button
				className="flex min-h-[3.5rem] w-full items-center rounded-lg border px-1 py-3 text-left transition-all duration-200 hover:scale-[1.02]"
				onClick={() => setIsModalOpen(true)}
				style={getCompactButtonStyle()}
				type="button"
			>
				{/* Espaço reservado para imagem (mesmo que os links) */}
				<div className="w-10 flex-shrink-0" />

				{/* Título centralizado com mesmo comportamento dos links */}
				<div className="flex flex-1 justify-center">
					<h3 className="line-clamp-2 px-2 font-medium leading-tight">
						{text.title}
					</h3>
				</div>

				{/* Espaço reservado para o botão de opções (mesmo que os links) */}
				<div className="w-10 flex-shrink-0" />
			</button>
		</div>
	) : (
		<div className={cn("w-full p-4", textAlignClass)}>
			<h3
				className={cn("mb-2 font-extrabold text-lg", getTextClasses())}
				style={textStyle}
			>
				{text.title}
			</h3>
			<p
				className={cn(
					"whitespace-pre-wrap text-md leading-relaxed",
					getTextClasses()
				)}
				style={textStyle}
			>
				{displayText}
			</p>
		</div>
	);

	const getCardClasses = () => {
		const baseClasses = "border transition-all";
		const cornerClasses = customPresets?.customButtonCorners || "rounded-xl";
		const backgroundClasses = customPresets?.customButtonFill
			? ""
			: classNames?.cardClasses || "";
		return cn(
			baseClasses,
			cornerClasses,
			backgroundClasses,
			classNames?.textCard
		);
	};

	const getCardStyle = () => {
		if (!(text.hasBackground && customPresets)) {
			return buttonStyle;
		}

		return getCompactButtonStyle();
	};

	return (
		<div className="mb-3 w-full" key={text.id}>
			{text.hasBackground ? (
				<div className={getCardClasses()} style={getCardStyle()}>
					{textContent}
				</div>
			) : (
				<div className={cn("py-2", textAlignClass)}>{textContent}</div>
			)}

			{text.isCompact && (
				<Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
					<DialogContent className="max-h-[80vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
						<DialogHeader>
							<DialogTitle>{text.title}</DialogTitle>
						</DialogHeader>
						<div className="mt-4">
							<p className="whitespace-pre-wrap text-sm leading-relaxed">
								{text.description}
							</p>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
