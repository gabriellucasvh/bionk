import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function ElegantTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-slate-900 text-green-400",
				name: "text-green-400",
				bio: "text-green-500",
				cardLink:
					"bg-teal-950 hover:bg-teal-900 border border-neutral-300 transition-colors duration-300",
				footer: "text-green-400",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
