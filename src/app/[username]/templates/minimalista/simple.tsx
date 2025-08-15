import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-b from-neutral-950 to-neutral-900 py-8 px-4 text-white flex flex-col",
				header: "text-neutral-100",
				name: "text-2xl font-semibold text-neutral-100",
				bio: "mt-2 text-neutral-400",
				cardLink:
					"block w-full p-3 bg-neutral-800/70 backdrop-blur-sm rounded-lg border border-neutral-700 shadow hover:shadow-lg hover:bg-neutral-800 transition-all duration-200",
				link: "text-gray-300 transition-colors duration-200",
				image:
					"mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border border-neutral-700 shadow-md",
				footer:
					"max-w-md mx-auto mt-10 text-green-800 text-sm font-bold border-t border-green-600 pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
