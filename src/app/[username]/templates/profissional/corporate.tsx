import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function CorporateTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900",
				image: "border-gray-400 shadow-md",
				name: "text-gray-900 tracking-wide",
				bio: "text-gray-700 text-sm",
				cardLink:
					"block w-full p-4 bg-white rounded-lg border border-gray-400 shadow-sm hover:shadow-md transition-shadow hover:bg-gray-200",
				link: "text-gray-600",
				footer:
					"text-black text-sm font-bold border-t border-black pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
