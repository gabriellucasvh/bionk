import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-700",
				className
			)}
			data-slot="skeleton"
			{...props}
		/>
	);
}

export { Skeleton };
