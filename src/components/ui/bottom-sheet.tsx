"use client";

import {
	Close as RadixDialogClose,
	Content as RadixDialogContent,
	Overlay as RadixDialogOverlay,
	Portal as RadixDialogPortal,
	Root as RadixDialogRoot,
} from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function BottomSheet({
	...props
}: React.ComponentProps<typeof RadixDialogRoot>) {
	return <RadixDialogRoot data-slot="bottom-sheet" {...props} />;
}

function BottomSheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof RadixDialogOverlay>) {
	return (
		<RadixDialogOverlay
			className={cn(
				"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
				className
			)}
			data-slot="bottom-sheet-overlay"
			{...props}
		/>
	);
}

function BottomSheetContent({
	className,
	children,
	showCloseButton = true,
	preventCloseOnInteractOutside = false,
	preventCloseOnEscape = false,
	onOpenAutoFocus,
	...props
}: React.ComponentProps<typeof RadixDialogContent> & {
	showCloseButton?: boolean;
	preventCloseOnInteractOutside?: boolean;
	preventCloseOnEscape?: boolean;
}) {
	return (
		<RadixDialogPortal data-slot="bottom-sheet-portal">
			<BottomSheetOverlay />
			<RadixDialogContent
				className={cn(
					"data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:-translate-x-1/2 sm:-translate-y-1/2 fixed right-0 bottom-0 left-0 z-50 w-screen rounded-t-3xl border-t bg-background p-6 shadow-lg duration-300 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in sm:top-1/2 sm:right-auto sm:left-1/2 sm:w-full sm:max-w-lg sm:rounded-3xl sm:border",
					className
				)}
				data-slot="bottom-sheet-content"
				onEscapeKeyDown={
					preventCloseOnEscape ? (e) => e.preventDefault() : undefined
				}
				onInteractOutside={
					preventCloseOnInteractOutside ? (e) => e.preventDefault() : undefined
				}
				onOpenAutoFocus={onOpenAutoFocus}
				{...props}
			>
				{children}
				{showCloseButton && (
					<RadixDialogClose className="absolute top-4 right-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:bg-muted-foreground/20 hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
						<XIcon />
						<span className="sr-only">Close</span>
					</RadixDialogClose>
				)}
			</RadixDialogContent>
		</RadixDialogPortal>
	);
}

export { BottomSheet, BottomSheetContent };
