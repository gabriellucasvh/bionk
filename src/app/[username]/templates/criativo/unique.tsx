import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white",
				name: "text-rose-500",
				bio: "text-yellow-400",
				cardLink:
					"bg-[#53354a] hover:bg-[#903749] border border-[#e94560] transition-all duration-200 shadow-md hover:shadow-xl",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
