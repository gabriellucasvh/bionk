import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper: "bg-gradient-to-b from-neutral-50 to-neutral-100",
				cardLink: "text-black border bg-white",
				link: "text-neutral-500",
				footer: "text-green-800",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
