import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function SoftNeutralTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-[#f9f9f7] text-neutral-900",
				header: "",
				image:
					"border-[3px] border-white shadow-lg",
				name: "text-black",
				bio: "text-neutral-600",
				cardLink:
					"bg-white border border-neutral-300 shadow-sm hover:shadow-md transition duration-200",
				link: "text-neutral-500",
				footer:
					"text-neutral-600",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
