import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper: "bg-neutral-950 text-white",
				image: "rounded-2xl border border-neutral-800 shadow-sm",
				name: "text-white",
				bio: "text-neutral-400",
				cardLink:
					"block w-full p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl transition-colors duration-200 shadow-sm hover:shadow-md",
				link: "text-blue-400",
				footer:
					"text-blue-500 text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
		/>
	);
}
