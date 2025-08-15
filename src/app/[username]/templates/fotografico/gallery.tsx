import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function SoftNeutralTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-[#f9f9f7] text-neutral-900 py-12 px-4 font-sans flex flex-col",
				header: "text-center mb-10",
				image:
					"mx-auto mb-6 relative w-28 h-28 border-[6px] border-white shadow-lg",
				name: "text-3xl font-bold tracking-tight",
				bio: "mt-2 text-neutral-600",
				cardLink:
					"block w-full p-5 bg-white border border-neutral-300 shadow-sm hover:shadow-md transition duration-200",
				link: "block text-sm text-neutral-500",
				footer:
					"max-w-md mx-auto mt-10 text-neutral-600 text-sm font-bold border-t border-neutral-300 pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
