import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function CorporateTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-orange-950 text-white",
				name: "text-yellow-400",
				bio: "text-yellow-500",
				cardLink:
					"bg-yellow-600 border shadow hover:shadow-md transition-all hover:bg-yellow-700 duration-300",
				footer: "text-yellow-500",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
