import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function ElegantTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "light",
				wrapper:
					"min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] text-neutral-800 py-12 px-4 flex flex-col",
				image:
					"mx-auto mb-6 relative w-28 h-28 overflow-hidden rounded-full border-4 border-neutral-300 shadow-[0_5px_30px_rgba(0,0,0,0.1)] bg-white",
				name: "text-3xl font-serif font-semibold text-neutral-900",
				bio: "mt-2 text-sm text-neutral-600 max-w-sm mx-auto italic",
				cardLink:
					"block w-full p-4 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-300 shadow-sm transition-all duration-300",
				link: "block text-xs text-neutral-500 mt-1",
				footer:
					"max-w-md mx-auto mt-14 text-center w-full inline-block px-6 py-2 border border-neutral-300 text-neutral-700 bg-white/70 backdrop-blur-md rounded-md font-serif text-sm shadow-md",
			}}
		/>
	);
}
