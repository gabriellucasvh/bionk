import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-rose-600 text-white",
				name: "text-lime-300",
				bio: "text-lime-400",
				cardLink:
					"bg-lime-500 hover:bg-lime-600 border border-neutral-800 transition-colors duration-200",
				footer: "text-lime-300",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
