import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
	variant?: "default" | "white";
	children: React.ReactNode;
	fullWidth?: boolean;
}

export function BaseButton({
	loading,
	children,
	className,
	disabled,
	variant = "default",
	fullWidth,
	...props
}: ButtonProps) {
	const variantClasses = {
		default: "bg-lime-400 hover:bg-lime-500 text-black",
		white: "bg-white hover:bg-neutral-200 text-black border border-gray-200",
	};

	const disabledClasses = "opacity-50 cursor-not-allowed hover:bg-none";

	return (
		<button
			disabled={disabled || loading}
			className={cn(
				fullWidth ? "w-full" : "w-fit",
				"max-w-full overflow-hidden",
				"relative inline-flex items-center justify-center",
				"rounded-xl",
				"text-sm md:text-base",
				"h-12 px-4 md:px-6 lg:px-8 py-2 md:py-3 has-[>svg]:px-3",
				"font-medium transition-colors duration-300",
				variantClasses[variant],
				(disabled || loading) && disabledClasses,
				className,
			)}
			{...props}
		>
			<span className="truncate">{children}</span>
		</button>
	);
}
