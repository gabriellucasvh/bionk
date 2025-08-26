import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function GradientTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400 text-white",
				image:
					"shadow-lg",
				header: "",
				name: "text-white",
				bio: "bg-gradient-to-r from-purple-100 to-cyan-200 text-transparent bg-clip-text",
				cardLink:
					"border border-white border-opacity-20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg bg-white/10",
				link: "text-white drop-shadow-sm",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
