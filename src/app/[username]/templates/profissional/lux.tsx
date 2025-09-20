import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function LuxuryTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white",
				image:
					"border-[3px] border-yellow-400 shadow-[0_0_30px_rgba(212,175,55,0.5)]",
				name: "text-white",
				bio: "text-gray-300",
				cardLink:
					"text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-400/10 border-2 border-yellow-400/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-transform duration-300 backdrop-blur-sm",
				link: "block text-xs text-gray-300 mt-1",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}