import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-b from-gray-50 to-gray-100",
				cardLink: "text-black border hover:scale-105 transition-all duration-200 bg-white",
				link: "text-gray-500",
				footer:
					"text-green-800",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
