import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DarkIndigoTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white",
				image: "border border-indigo-500 shadow-md",
				name: "text-white",
				bio: "text-indigo-200",
				cardLink:
					"bg-[#1e1b3a] hover:bg-[#2a2650] border border-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md",
				link: "text-indigo-300",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
