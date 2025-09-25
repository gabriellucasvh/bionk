import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function SoftRetroTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-[#f4f1de] text-[#3d405b]",
				header: "",
				name: "text-[#81b29a]",
				bio: "text-[#3d405b]",
				cardLink:
					"bg-[#f2cc8f] text-[#3d405b] border-2 border-[#e07a5f] shadow-[4px_4px_0_#3d405b] hover:bg-[#ffe8b6] transition-all duration-200",
				footer:
					"text-[#3d405b]",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
