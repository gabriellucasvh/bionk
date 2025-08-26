import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function BusinessTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800",
				image: "border-blue-300 shadow-lg",
				name: "text-blue-900 tracking-wide",
				bio: "text-blue-800 text-sm",
				cardLink:
					"text-black bg-white border border-blue-300 shadow-sm hover:shadow-md transition-shadow",
				link: "text-blue-600",
				footer:
					"text-blue-800",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
