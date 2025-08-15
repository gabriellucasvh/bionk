import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VintageTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"min-h-screen bg-gradient-to-br from-amber-200 to-rose-300 py-8 px-4 text-amber-900 font-serif flex flex-col",
				image:
					"mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-amber-600 shadow-xl",
				name: "text-3xl font-bold text-amber-900 tracking-wide drop-shadow-md",
				bio: "mt-2 text-amber-800 text-sm italic max-w-sm mx-auto leading-relaxed",
				cardLink:
					"block w-full p-4 bg-amber-100 rounded-lg border border-amber-600 shadow-md hover:shadow-lg hover:bg-amber-200 transition-all transform hover:-translate-y-1",
				link: "font-bold text-amber-900",
				footer:
					"max-w-md mx-auto mt-10 text-amber-800 text-sm font-bold border-t border-amber-600 pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
