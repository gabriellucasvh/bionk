"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";

interface MobileBottomSheetProps {
	isOpen: boolean;
	isAnimating: boolean;
	isDragging: boolean;
	dragY: number;
	isClosing: boolean;
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
	isClosing,
	onClose,
	onMouseDown,
	onTouchStart,
	children,
}: MobileBottomSheetProps) => {
	useEffect(() => {
		if (isOpen || isClosing) {
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
			document.body.classList.add("bottom-sheet-open");
		} else {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.classList.remove("bottom-sheet-open");
		}

		return () => {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.classList.remove("bottom-sheet-open");
		};
	}, [isOpen, isClosing]);

	if (!(isOpen || isClosing)) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-[60]" style={{ margin: 0, padding: 0 }}>
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				onTouchMove={(e) => e.preventDefault()}
				onTouchStart={(e) => e.preventDefault()}
				role="none"
				style={{ touchAction: "none" }}
			/>
			<div
				className="absolute right-0 left-0 w-full bg-white shadow-2xl dark:bg-zinc-900"
				style={{
					bottom: "-1px",
					borderTopLeftRadius: "24px",
					borderTopRightRadius: "24px",
					transform: `translateY(${isClosing ? `${dragY}px` : isAnimating ? (isDragging ? `${dragY}px` : "0px") : "calc(100% + 30px)"})`,
					transition: isDragging
						? "none"
						: "transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
					touchAction: "auto",
					margin: "0px",
					padding: "0px",
					boxSizing: "border-box",
					willChange: "transform",
				}}
			>
				<div
					className="flex h-12 w-full items-center justify-end rounded-t-3xl px-4"
					onMouseDown={onMouseDown}
					onTouchStart={onTouchStart}
					role="none"
					style={{ touchAction: "none" }}
				>
					<button
						aria-label="Fechar"
						className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
						onClick={onClose}
						type="button"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div
					className="h-[80vh] overflow-y-auto px-6"
					onTouchMove={(e) => e.stopPropagation()}
					onTouchStart={(e) => e.stopPropagation()}
					style={{
						touchAction: "pan-y",
						WebkitOverflowScrolling: "touch",
						overscrollBehavior: "contain",
						paddingBottom: "env(safe-area-inset-bottom, 0px)",
					}}
				>
					{children}
				</div>
			</div>
		</div>
	);
};

export default MobileBottomSheet;
