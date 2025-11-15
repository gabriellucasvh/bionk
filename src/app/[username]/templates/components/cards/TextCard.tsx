"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    buildCompactButtonStyle,
    buildBorderRadiusStyle,
    resolveTextClasses,
    composeCardClasses,
} from "./utils/style";

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
    return resolveTextClasses(customPresets, text.hasBackground, {
        cardTextClasses: classNames?.cardTextClasses,
        textClasses: classNames?.textClasses,
    });
};

const getCompactButtonStyle = () => {
    if (!customPresets) {
        return buttonStyle;
    }
    return buildCompactButtonStyle(customPresets, buttonStyle);
};

const getCompactButtonStyleWithoutBackground = () => {
    return buildBorderRadiusStyle(customPresets?.customButtonCorners);
};

	const textContent = text.isCompact ? (
		<div className="w-full">
			<button
				className={`flex min-h-[3.5rem] w-full items-center px-1 py-3 text-left transition-all duration-200 hover:brightness-110 ${
					text.hasBackground
						? "rounded-lg border"
						: "bg-white/3 hover:bg-white/5"
				}`}
				onClick={() => setIsModalOpen(true)}
				style={
					text.hasBackground
						? getCompactButtonStyle()
						: getCompactButtonStyleWithoutBackground()
				}
				type="button"
			>
				{/* Espaço reservado para imagem (mesmo que os links) */}
				<div className="w-10 flex-shrink-0" />

				{/* Título centralizado com mesmo comportamento dos links */}
				<div className="flex flex-1 justify-center">
					<h3
						className={cn(
							"line-clamp-2 px-2 font-medium leading-tight",
							getTextClasses()
						)}
						style={textStyle}
					>
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
    return composeCardClasses(customPresets, {
        cardClasses: classNames?.cardClasses,
        textCard: classNames?.textCard,
    });
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
