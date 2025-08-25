import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-b from-gray-50 to-gray-100",
				cardLink: "text-black hover:scale-105 transition-all duration-200 bg-white rounded-xl shadow-md",
				link: "text-gray-500",
				footer:
					"max-w-md mx-auto mt-10 text-green-800 text-sm font-bold border-t border-green-600 pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
