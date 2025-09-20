import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-black text-white",
				image:
					"border-2 border-[#ff00f7] shadow-[0_0_10px_#ff00f777]",
				header: "",
				name: "text-[#00fff7]",
				bio: "text-[#ff00f7]",
				cardLink:
					"bg-[#111] hover:bg-[#1e1e1e] border border-[#00fff7] text-[#00fff7] shadow-[0_0_10px_#00fff733] transition duration-300",
				link: "text-[#ff00f7]",
				footer:
					"text-[#ff00f7]",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}