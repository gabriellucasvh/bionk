import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function PurpleMintTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-purple-700 text-white",
				name: "text-emerald-300",
				bio: "text-emerald-400",
				cardLink:
					"bg-emerald-500 hover:bg-emerald-600 border border-neutral-800 transition-colors duration-200",
				footer: "text-emerald-300",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
