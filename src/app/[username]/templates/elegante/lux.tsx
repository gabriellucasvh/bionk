import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function LuxuryTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white py-12 px-4 flex flex-col",
				image:
					"mx-auto mb-6 relative w-28 h-28 overflow-hidden rounded-full border-[3px] border-yellow-400 shadow-[0_0_30px_rgba(212,175,55,0.5)]",
				name: "text-3xl font-semibold tracking-wide text-white drop-shadow-md",
				bio: "mt-2 text-sm text-gray-300 max-w-sm mx-auto italic",
				cardLink:
					"block w-full p-4 text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-400/10 rounded-xl border border-yellow-400/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-transform duration-300 backdrop-blur-sm",
				link: "block text-xs text-gray-300 mt-1",
				footer:
					"max-w-md mx-auto mt-14 text-center w-full inline-block px-6 py-2 border border-yellow-400 text-white bg-yellow-400/10 backdrop-blur-xl rounded-lg font-medium tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)]",
			}}
		/>
	);
}
