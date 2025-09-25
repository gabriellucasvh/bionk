import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-neutral-950 text-white",
				header: "text-neutral-100",
				name: "text-neutral-100",
				bio: "text-neutral-400",
				cardLink:
					"bg-neutral-800/70 backdrop-blur-sm border border-neutral-700 hover:bg-neutral-800 transition-all duration-200",
				link: "text-gray-300 transition-colors duration-200",
				footer:
					"text-white/80",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
