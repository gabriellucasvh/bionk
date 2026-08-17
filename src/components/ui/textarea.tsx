import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"field-sizing-content flex min-h-16 w-full rounded-lg border-2 border-transparent bg-muted/50 px-3 py-2 text-base outline-none transition-[color,border-color] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
				className
			)}
			data-slot="textarea"
			{...props}
		/>
	);
}

export { Textarea };
