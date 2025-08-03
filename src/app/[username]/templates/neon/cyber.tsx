import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-black text-white py-10 px-4 font-mono flex flex-col",
				image:
					"mx-auto mb-4 relative w-24 h-24 overflow-hidden border-2 border-[#ff00f7] shadow-[0_0_10px_#ff00f777]",
				header: "w-full text-center mb-10",
				name: "text-2xl font-bold text-[#00fff7] uppercase tracking-widest",
				bio: "mt-2 text-[#ff00f7] text-sm",
				cardLink:
					"block w-full p-4 bg-[#111] hover:bg-[#1e1e1e] border border-[#00fff7] text-[#00fff7] shadow-[0_0_10px_#00fff733] transition duration-300 font-semibold",
				link: "block text-base text-[#ff00f7]",
				footer:
					"max-w-md mx-auto mt-10 text-[#ff00f7] text-sm font-bold border-t border-[#ff00f7] pt-4 w-full text-center",
			}}
		/>
	);
}
