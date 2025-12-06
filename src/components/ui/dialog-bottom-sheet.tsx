"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function DialogBottomSheetContent({
	className,
	children,
	showCloseButton = true,
	preventCloseOnInteractOutside = false,
	preventCloseOnEscape = false,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	preventCloseOnInteractOutside?: boolean;
	preventCloseOnEscape?: boolean;
}) {
	return (
		<DialogPrimitive.Portal data-slot="dialog-portal">
			<DialogPrimitive.Overlay
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in"
				)}
				data-slot="dialog-overlay"
			/>
			<DialogPrimitive.Content
				className={cn(
					"data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 fixed inset-x-0 bottom-0 z-50 grid w-full translate-x-0 translate-y-0 gap-4 rounded-t-3xl border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:inset-x-auto sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl",
					className
				)}
				data-slot="dialog-content"
				onEscapeKeyDown={
					preventCloseOnEscape ? (e) => e.preventDefault() : undefined
				}
				onInteractOutside={
					preventCloseOnInteractOutside ? (e) => e.preventDefault() : undefined
				}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:bg-muted-foreground/20 hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
						<XIcon />
						<span className="sr-only">Close</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
}

export { DialogBottomSheetContent };
