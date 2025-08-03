import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function SoftRetroTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "light",
				wrapper:
					"min-h-screen bg-[#f4f1de] text-[#3d405b] py-10 px-4 font-[Courier_New,courier,monospace] flex flex-col",
				image:
					"mx-auto mb-4 relative w-24 h-24 overflow-hidden border-4 border-[#e07a5f] shadow-[4px_4px_0_#3d405b]",
				header: "w-full text-center mb-10",
				name: "text-2xl font-bold text-[#81b29a]",
				bio: "mt-2 text-[#3d405b] italic",
				cardLink:
					"block w-full p-4 bg-[#f2cc8f] text-[#3d405b] border-2 border-[#e07a5f] shadow-[4px_4px_0_#3d405b] hover:bg-[#ffe8b6] transition-all duration-200 font-bold",
				link: "block text-xs text-[#3d405b] underline",
				footer:
					"max-w-md mx-auto mt-10 text-[#3d405b] text-sm font-bold border-t border-[#3d405b] pt-4 w-full text-center",
			}}
		/>
	);
}
