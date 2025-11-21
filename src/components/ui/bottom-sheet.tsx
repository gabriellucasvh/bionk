"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function BottomSheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="bottom-sheet" {...props} />;
}

function BottomSheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in",
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
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  preventCloseOnInteractOutside?: boolean;
  preventCloseOnEscape?: boolean;
}) {
  return (
    <DialogPrimitive.Portal data-slot="bottom-sheet-portal">
      <BottomSheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom fixed bottom-0 left-0 right-0 z-50 w-screen rounded-t-3xl border-t bg-background p-6 shadow-lg sm:left-1/2 sm:top-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border",
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
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:bg-muted-foreground/20 hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { BottomSheet, BottomSheetContent };