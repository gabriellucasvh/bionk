import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function BusinessTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900",
				image: "border-blue-300 shadow-lg",
				name: "text-blue-900 tracking-wide",
				bio: "text-blue-800 text-sm",
				cardLink:
					"block text-black			 w-full p-4 bg-white rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow",
				link: "text-blue-600",
				footer:
					"text-blue-800 text-sm font-bold border-t border-blue-800 pt-4 w-full text-center",
			}}
		/>
	);
}
