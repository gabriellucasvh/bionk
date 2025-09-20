import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function ElegantTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] text-neutral-800",
				image:
					"border-4 border-neutral-300 shadow-[0_5px_30px_rgba(0,0,0,0.1)]",
				name: "text-neutral-900",
				bio: "text-neutral-600",
				cardLink:
					"bg-white hover:bg-neutral-100 border border-neutral-300 shadow-sm transition-all duration-300",
				link: "text-neutral-500",
				footer:
					"text-neutral-700",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
