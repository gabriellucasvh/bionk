import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DarkGlassTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"bg-neutral-900 text-neutral-100 py-10 px-4 font-sans flex flex-col",
				header: "text-center mb-10 text-neutral-100",
				image:
					"mx-auto mb-4 relative w-28 h-28 overflow-hidden border-4 border-white shadow-lg grayscale hover:grayscale-0 transition duration-500",
				name: "text-2xl font-semibold text-white",
				bio: "mt-2 text-neutral-400 text-sm",
				cardLink:
					"block w-full p-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-md transition-all duration-200",
				link: "text-xs text-neutral-300",
				footer:
					"max-w-md mx-auto mt-10 text-neutral-400 text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
		/>
	);
}
