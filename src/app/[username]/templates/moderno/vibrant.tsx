import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VibrantTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"bg-gradient-to-br from-fuchsia-600 via-violet-600 to-blue-600 text-white",
				name: "text-white drop-shadow-md",
				bio: "text-yellow-200 drop-shadow-sm",
				cardLink:
					"text-white bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-cyan-300 shadow-[0_4px_0_rgb(34,211,238)] hover:shadow-[0_6px_0_rgb(34,211,238)] active:shadow-[0_2px_0_rgb(34,211,238)] active:translate-y-1 transition-all",
				footer:
					"text-white",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
