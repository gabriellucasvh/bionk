import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean;
	loading?: boolean;
	variant?: "default" | "white" | "green" | "outline" | "link";
	children: ReactNode;
	fullWidth?: boolean;
	size?: "default" | "sm" | "lg" | "icon";
}

export function BaseButton({
	asChild = false,
	loading,
	children,
	className,
	disabled,
	variant = "default",
	fullWidth,
	size = "default",
	...props
}: ButtonProps) {
	const Component = asChild ? Slot : "button";

	const variantClasses = {
		default: "bg-purple-400 hover:bg-purple-500 text-black",
		white: "bg-white hover:bg-zinc-200 text-black border border-gray-200",
		green: "bg-green-500 hover:bg-green-600 text-white border border-green-500",
		outline:
			"bg-transparent hover:bg-gray-100 border border-black text-black dark:border-white dark:text-white",
		link: "bg-transparent hover:underline text-black dark:text-white",
	};
	const sizeClasses = {
		default: "h-12 px-4 py-2 has-[>svg]:px-3 md:px-6 md:py-3 lg:px-8",
		sm: "h-10 px-3 py-1.5 has-[>svg]:px-2.5",
		lg: "h-14 px-6 py-3 has-[>svg]:px-4",
		icon: "size-9",
	};

	const disabledClasses = "opacity-50 cursor-not-allowed hover:bg-none";

	return (
		<Component
			className={cn(
				fullWidth ? "w-full" : "w-fit",
				"max-w-full overflow-hidden",
				"relative inline-flex items-center justify-center",
				"rounded-full",
				"text-sm md:text-base",
				"font-medium transition-colors duration-300",
				variantClasses[variant],
				sizeClasses[size],
				(disabled || loading) && disabledClasses,
				className
			)}
			disabled={asChild ? undefined : disabled || loading}
			{...props}
		>
			{children}
		</Component>
	);
}
