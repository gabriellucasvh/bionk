import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function CleanTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-white text-gray-900",
				image: "border border-gray-300 shadow-md",
				name: "text-gray-900",
				bio: "text-gray-500",
				cardLink:
					"bg-gray-100 border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300",
				link: "text-gray-500",
				footer:
					"text-black",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
