import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function NeonTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-indigo-950 via-purple-800 to-pink-900 text-white",
				name: "text-white",
				bio: "text-white",
				header:
					"text-white drop-shadow-[0_0_15px_rgba(255,0,255,1)]",
				cardLink:
					"bg-transparent border-2 border-pink-400 shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:shadow-[0_0_25px_rgba(255,0,255,1)] transition-all ring-1",
				link: "text-gray-300",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		>
		</BaseTemplate>
	);
}
