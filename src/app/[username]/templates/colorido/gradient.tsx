import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function GradientTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400 py-8 px-4 flex flex-col",
				image:
					"mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full p-1 bg-gradient-to-r from-amber-400 via-violet-500 to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300",
				header: "",
				name: "text-2xl font-bold text-white",
				bio: "mt-2 bg-gradient-to-r from-purple-100 to-cyan-200 text-transparent bg-clip-text font-medium",
				// A estilização do link agora será feita no InteractiveLink através do BaseTemplate
				cardLink:
					"block w-full rounded-lg border border-white border-opacity-20 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg bg-white/10",
				link: "font-bold text-white drop-shadow-sm",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}
