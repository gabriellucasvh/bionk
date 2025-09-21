"use client";

import type { ReactNode } from "react";

interface MobileBottomSheetProps {
	isOpen: boolean;
	isAnimating: boolean;
	isDragging: boolean;
	dragY: number;
	onClose: () => void;
	onMouseDown: (e: React.MouseEvent) => void;
	onTouchStart: (e: React.TouchEvent) => void;
	children: ReactNode;
}

const MobileBottomSheet = ({
	isOpen,
	isAnimating,
	isDragging,
	dragY,
	onClose,
	onMouseDown,
	onTouchStart,
	children,
}: MobileBottomSheetProps) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed z-50 flex items-end"
			style={{
				inset: "0px",
				bottom: "0px",
				paddingBottom: "0px",
				marginBottom: "0px",
			}}
		>
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				role="none"
			/>
			<div
				className="relative w-full rounded-t-3xl bg-background shadow-2xl transition-transform duration-300 ease-out"
				style={{
					transform: `translateY(${isAnimating ? (isDragging ? `${dragY}px` : "0px") : "100%"})`,
					transition: isDragging ? "none" : "transform 300ms ease-out",
					marginBottom: "0px",
					paddingBottom: "0px",
				}}
			>
				<div
					className="flex h-6 w-full cursor-grab items-center justify-center rounded-t-3xl active:cursor-grabbing"
					onMouseDown={onMouseDown}
					onTouchStart={onTouchStart}
					role="none"
				>
					<div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
				</div>
				<div className="h-[80vh] overflow-y-auto px-6 pb-6">{children}</div>
			</div>
		</div>
	);
};

export default MobileBottomSheet;
