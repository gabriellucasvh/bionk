import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "min-h-screen bg-black text-white py-10 px-4 flex flex-col",
				image: "rounded-full border border-neutral-700 shadow-md",
				name: "text-white text-2xl font-bold",
				bio: "mt-2 text-neutral-400",
				cardLink:
					"block w-full p-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors duration-200 shadow-sm hover:shadow-lg",
				link: "text-neutral-400 text-sm",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
