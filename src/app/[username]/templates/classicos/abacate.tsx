import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VibrantGreenTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper: "bg-green-950 text-white",
				name: "text-lime-400 font-bold",
				bio: "text-lime-400",
				cardLink:
					"bg-lime-400 border border-lime-200 shadow-sm hover:bg-lime-300 hover:shadow-md transition-colors duration-300 text-black",
				footer: "text-lime-300",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
