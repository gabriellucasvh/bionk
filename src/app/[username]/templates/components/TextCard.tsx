"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

	const shouldTruncate = text.description.length > 200;
	const displayText = shouldTruncate
		? `${text.description.slice(0, 200)}...`
		: text.description;

	const getTextClasses = () => {
		if (customPresets?.customTextColor) {
			return "";
		}

		if (text.hasBackground && classNames?.cardTextClasses) {
			return classNames.cardTextClasses;
		}

		return classNames?.textClasses || "";
	};

	const textContent = text.isCompact ? (
		<div className={cn("w-full p-4", textAlignClass)}>
			<Button
				className={cn("h-auto p-0 font-semibold text-lg", getTextClasses())}
				onClick={() => setIsModalOpen(true)}
				style={textStyle}
				variant="link"
			>
				{text.title}
			</Button>
		</div>
	) : (
		<div className={cn("w-full p-4", textAlignClass)}>
			<h3
				className={cn("mb-2 font-semibold text-lg", getTextClasses())}
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
			{shouldTruncate && (
				<Button
					className={cn("mt-2 h-auto p-0 text-sm", getTextClasses())}
					onClick={() => setIsModalOpen(true)}
					style={{ color: textStyle?.color }}
					variant="link"
				>
					Ler mais
				</Button>
			)}
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
		const style = { ...buttonStyle };
		if (customPresets?.customButtonFill && text.hasBackground) {
			style.backgroundColor = customPresets.customButtonFill;
		}
		return style;
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

			{(shouldTruncate || text.isCompact) && (
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
