import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VibrantTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-fuchsia-600 via-violet-600 to-blue-600 py-8 px-4 flex flex-col",
				image:
					"mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:shadow-[0_0_25px_rgba(250,204,21,0.7)] transition-all duration-300",
				header: "",
				name: "text-2xl font-bold text-white drop-shadow-md",
				bio: "mt-2 text-yellow-200 drop-shadow-sm",
				cardLink:
					"block text-white w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg border-2 border-cyan-300 shadow-[0_4px_0_rgb(34,211,238)] hover:shadow-[0_6px_0_rgb(34,211,238)] active:shadow-[0_2px_0_rgb(34,211,238)] active:translate-y-1 transition-all",
				link: "font-bold text-gray-300",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t pt-4 w-full text-center",
			}}
		/>
	);
}
