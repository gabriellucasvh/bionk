import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VintageTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-gradient-to-br from-amber-200 to-rose-300 text-amber-900",
				image:
					"border-amber-600",
				name: "text-amber-900",
				bio: "text-amber-800",
				cardLink:
					"bg-amber-100 border border-amber-600 hover:bg-amber-200 transition-all transform hover:-translate-y-1",
				link: "text-amber-900",
				footer:
					"text-amber-800",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
