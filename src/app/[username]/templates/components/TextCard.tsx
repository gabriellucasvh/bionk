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

	const textContent = (
		<div className={cn("w-full p-4", textAlignClass)}>
			<h3 className="mb-2 font-semibold text-lg" style={textStyle}>
				{text.title}
			</h3>
			<p
				className="whitespace-pre-wrap text-md leading-relaxed"
				style={textStyle}
			>
				{displayText}
			</p>
			{shouldTruncate && (
				<Button
					className="mt-2 h-auto p-0 text-sm"
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
		return cn(baseClasses, cornerClasses, classNames?.textCard);
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
				<div
					className={getCardClasses()}
					style={getCardStyle()}
				>
					{textContent}
				</div>
			) : (
				<div className={cn("py-2", textAlignClass)}>{textContent}</div>
			)}

			{shouldTruncate && (
				<Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
					<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
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
