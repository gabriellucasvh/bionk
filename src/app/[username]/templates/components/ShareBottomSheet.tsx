"use client";

import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { BaseButton } from "@/components/buttons/BaseButton";
import ShareSheet from "@/components/ShareSheet";
import type { TemplateComponentProps } from "@/types/user-profile";

interface ShareBottomSheetProps {
	user: TemplateComponentProps["user"];
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

const ShareBottomSheet: FC<ShareBottomSheetProps> = ({
	user,
	isOpen,
	onOpenChange,
}) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [isClosing, setIsClosing] = useState(false);

	const startYRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);
	const dragYRef = useRef(0);
	const VELOCITY_CLOSE_THRESHOLD = 0.5; // px/ms (e.g., 50px em 100ms)
	const MIN_DELTA_FOR_SWIPE = 10; // px
	const contentRef = useRef<HTMLDivElement | null>(null);
	const sheetRef = useRef<HTMLDivElement | null>(null);
	const getCloseDistanceThreshold = () => {
		const h =
			sheetRef.current?.offsetHeight || Math.round(window.innerHeight * 0.8);
		return Math.max(140, Math.round(h * 0.55));
	};

	const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://bionk.me"}/${user.username}`;
	const shareText = `Confira meu perfil na Bionk: ${user.username || user.name}`;
	const logoUrl = "/images/bionk-icon-black.svg";

	useEffect(() => {
		if (isOpen) {
			// inicia animação de abrir
			setIsAnimating(true);
			setIsClosing(false);
		}
	}, [isOpen]);

	// Bloquear scroll do body enquanto aberto/fechando
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

	const handleClose = () => {
		setIsClosing(true);
		setIsAnimating(true);
		// fecha imediatamente no controlador externo
		onOpenChange(false);
		// aguarda animação e limpa estados internos
		window.setTimeout(() => {
			setIsClosing(false);
			setIsAnimating(false);
			setDragY(0);
			dragYRef.current = 0;
		}, 400);
	};

	const onMouseDown = (e: React.MouseEvent) => {
		const contentEl = contentRef.current;
		const target = e.target as Node;
		if (contentEl && contentEl.contains(target) && contentEl.scrollTop > 0) {
			return;
		}
		startYRef.current = e.clientY;
		startTimeRef.current = performance.now();
		setIsDragging(true);

		const onMouseMove = (ev: MouseEvent) => {
			if (startYRef.current !== null) {
				const delta = ev.clientY - startYRef.current;
				const clamped = Math.max(0, delta);
				setDragY(clamped);
				dragYRef.current = clamped;

				const now = performance.now();
				const duration = startTimeRef.current ? now - startTimeRef.current : 0;
				const velocity = duration > 0 ? clamped / duration : 0;
				// Fecha durante o arrasto apenas por velocidade (gesto rápido)
				if (
					clamped >= MIN_DELTA_FOR_SWIPE &&
					velocity >= VELOCITY_CLOSE_THRESHOLD
				) {
					document.removeEventListener("mousemove", onMouseMove);
					document.removeEventListener("mouseup", onMouseUp);
					setIsDragging(false);
					startYRef.current = null;
					startTimeRef.current = null;
					handleClose();
				}
			}
		};

		const onMouseUp = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
			setIsDragging(false);

			const endTime = performance.now();
			const duration = startTimeRef.current
				? endTime - startTimeRef.current
				: 0;
			const delta = dragYRef.current;
			const velocity = duration > 0 ? delta / duration : 0;

			// Fecha ao soltar se distância for grande o suficiente ou por velocidade de swipe
			if (
				delta >= getCloseDistanceThreshold() ||
				(delta >= MIN_DELTA_FOR_SWIPE && velocity >= VELOCITY_CLOSE_THRESHOLD)
			) {
				handleClose();
			} else {
				setDragY(0);
				dragYRef.current = 0;
			}
			startYRef.current = null;
			startTimeRef.current = null;
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
	};

	const onTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		const contentEl = contentRef.current;
		const target = e.target as Node;
		const touchingContent = !!contentEl && contentEl.contains(target);
		if (touchingContent && contentEl && contentEl.scrollTop > 0) {
			return;
		}
		startYRef.current = touch.clientY;
		startTimeRef.current = performance.now();
		setIsDragging(true);

		const onTouchMove = (ev: TouchEvent) => {
			if (startYRef.current !== null && ev.touches[0]) {
				const delta = ev.touches[0].clientY - startYRef.current;
				const clamped = Math.max(0, delta);
				setDragY(clamped);
				dragYRef.current = clamped;
				ev.preventDefault();

				const now = performance.now();
				const duration = startTimeRef.current ? now - startTimeRef.current : 0;
				const velocity = duration > 0 ? clamped / duration : 0;
				// Fecha durante o arrasto apenas por velocidade (gesto rápido)
				if (
					clamped >= MIN_DELTA_FOR_SWIPE &&
					velocity >= VELOCITY_CLOSE_THRESHOLD
				) {
					document.removeEventListener("touchmove", onTouchMove, {
						passive: false,
					} as any);
					document.removeEventListener("touchend", onTouchEnd);
					setIsDragging(false);
					startYRef.current = null;
					startTimeRef.current = null;
					handleClose();
				}
			}
		};

		const onTouchEnd = () => {
			document.removeEventListener("touchmove", onTouchMove, {
				passive: false,
			} as any);
			document.removeEventListener("touchend", onTouchEnd);
			setIsDragging(false);

			const endTime = performance.now();
			const duration = startTimeRef.current
				? endTime - startTimeRef.current
				: 0;
			const delta = dragYRef.current;
			const velocity = duration > 0 ? delta / duration : 0;

			// Fecha ao soltar se distância for grande o suficiente ou por velocidade de swipe
			if (
				delta >= getCloseDistanceThreshold() ||
				(delta >= MIN_DELTA_FOR_SWIPE && velocity >= VELOCITY_CLOSE_THRESHOLD)
			) {
				handleClose();
			} else {
				setDragY(0);
				dragYRef.current = 0;
			}
			startYRef.current = null;
			startTimeRef.current = null;
		};

		document.addEventListener("touchmove", onTouchMove, {
			passive: false,
		} as any);
		document.addEventListener("touchend", onTouchEnd);
	};

	if (!(isOpen || isClosing)) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[60] sm:hidden"
			style={{ margin: 0, padding: 0 }}
		>
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={handleClose}
				onTouchMove={(e) => e.preventDefault()}
				onTouchStart={(e) => e.preventDefault()}
				role="none"
				style={{ touchAction: "none" }}
			/>
			<div
				className="absolute right-0 left-0 w-full bg-zinc-100 shadow-2xl dark:bg-zinc-800"
				onMouseDown={onMouseDown}
				onTouchStart={onTouchStart}
				ref={sheetRef}
				role="none"
				style={{
					bottom: "-1px",
					borderTopLeftRadius: "24px",
					borderTopRightRadius: "24px",
					transform: `translateY(${isDragging ? `${dragY}px` : isClosing ? "calc(100% + 30px)" : isAnimating ? "0px" : "calc(100% + 30px)"})`,
					transition: isDragging
						? "none"
						: "transform 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
					touchAction: "none",
					userSelect: "none",
					margin: "0px",
					padding: "0px",
					boxSizing: "border-box",
					willChange: "transform",
				}}
			>
				<div
					className="flex h-6 w-full cursor-grab items-center justify-center rounded-t-3xl active:cursor-grabbing"
					role="none"
					style={{ touchAction: "none" }}
				>
					<div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
				</div>
				<div
					className="h-[80vh] overflow-y-auto p-6"
					ref={contentRef}
					style={{
						touchAction: "pan-y",
						WebkitOverflowScrolling: "touch",
						overscrollBehavior: "contain",
						paddingBottom: "env(safe-area-inset-bottom, 0px)",
					}}
				>
					<div className="flex justify-center pb-2">
						<Image
							alt="Bionk Logo"
							className="mx-auto h-auto w-20"
							height={40}
							src="/images/bionk-name-logo.svg"
							width={80}
						/>
					</div>

					<div className="text-center">
						<h2 className="font-bold text-2xl text-black">
							Compartilhar Perfil
						</h2>
						<p className="pt-2 text-muted-foreground text-sm">
							Divulgue seu perfil Bionk usando link, QR code ou redes sociais.
						</p>
					</div>

					<div className="mt-4 flex min-w-0 flex-col gap-4">
						{isOpen && user.username && (
							<div className="flex flex-col items-center justify-center rounded-lg bg-gray-100 p-2">
								<QRCode
									logoImage={logoUrl}
									logoPadding={5}
									logoWidth={30}
									qrStyle="dots"
									size={192}
									value={profileUrl}
								/>
								<span className="mt-px break-all text-xs">
									bionk.me/{user.username}
								</span>
							</div>
						)}

						<ShareSheet title={shareText} url={profileUrl} />

						<div className="mt-4 mb-6 flex w-full flex-col gap-3">
							<BaseButton asChild className="w-full">
								<Link
									href="/registro"
									rel="noopener noreferrer"
									target="_blank"
								>
									Crie sua conta na Bionk
								</Link>
							</BaseButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShareBottomSheet;
