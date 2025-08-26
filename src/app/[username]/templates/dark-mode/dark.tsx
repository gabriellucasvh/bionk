import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-black text-white",
				image: "border border-neutral-700",
				name: "text-white",
				bio: "text-neutral-400",
				cardLink:
					"bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors duration-200",
				link: "text-neutral-400",
				footer:
					"text-whit",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
