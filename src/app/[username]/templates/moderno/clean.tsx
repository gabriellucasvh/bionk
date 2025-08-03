import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function CleanTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "light",
				wrapper:
					"bg-white text-gray-900 py-12 px-6 flex items-center justify-center flex-col",
				image: "rounded-full border border-gray-300 shadow-md",
				name: "text-gray-900 text-3xl font-semibold mt-4",
				bio: "mt-2 text-gray-500 max-w-sm mx-auto text-base",
				cardLink:
					"block w-full max-w-md p-4 bg-gray-100 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300",
				link: "text-gray-500",
				footer:
					"max-w-md mx-auto mt-10 text-black text-sm font-bold border-t pt-4 w-full text-center",
			}}
		/>
	);
}
