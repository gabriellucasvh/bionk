import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function BusinessTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-red-950 text-white",
				name: "text-white",
				bio: "text-neutral-100",
				cardLink:
					"text-white bg-red-700 border border-red-500 shadow-md hover:shadow-xl transition-shadow",
				footer: "text-red-200",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
