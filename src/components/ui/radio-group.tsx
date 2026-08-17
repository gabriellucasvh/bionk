"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as React from "react";

import { cn } from "@/lib/utils";

function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			className={cn("grid gap-2", className)}
			data-slot="radio-group"
			{...props}
		/>
	);
}

function RadioGroupItem({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			className={cn(
				// Center the indicator inside the radio circle
				"peer flex h-4 w-4 items-center justify-center rounded-full bg-muted/50 border-2 border-border text-foreground outline-hidden focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			data-slot="radio-group-item"
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="block size-2 rounded-full bg-green-600" />
		</RadioGroupPrimitive.Item>
	);
}

export { RadioGroup, RadioGroupItem };
