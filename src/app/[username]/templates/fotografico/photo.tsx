import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DarkGlassTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-neutral-900 text-neutral-100",
				header: "text-neutral-100",
				image:
					"border-4 border-white shadow-lg grayscale hover:grayscale-0 transition duration-500",
				name: "text-white",
				bio: "text-neutral-400",
				cardLink:
					"bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-md transition-all duration-200",
				link: "text-neutral-300",
				footer:
					"text-neutral-400",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
