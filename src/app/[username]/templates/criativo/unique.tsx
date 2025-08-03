import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-10 px-4 flex flex-col",
				image:
					"relative w-24 h-24 overflow-hidden rounded-3xl border-4 border-[#e94560] shadow-[0_0_15px_#e9456055] transition-transform duration-300 hover:scale-105",
				name: "text-3xl font-extrabold text-rose-500 tracking-tight",
				bio: "mt-2 text-yellow-400 text-base",
				cardLink:
					"block w-full p-4 bg-[#53354a] hover:bg-[#903749] border border-[#e94560] transition-all duration-200 shadow-md hover:shadow-xl",
				link: "block text-sm text-yellow-400",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
		/>
	);
}
