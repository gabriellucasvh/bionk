import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DarkIndigoTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] py-10 px-4 text-white flex flex-col",
				image: "rounded-full border border-indigo-500 shadow-md",
				name: "text-white text-2xl font-bold",
				bio: "mt-2 text-indigo-200",
				cardLink:
					"block w-full p-4 bg-[#1e1b3a] hover:bg-[#2a2650] border border-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md",
				link: "text-indigo-300 text-sm",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
