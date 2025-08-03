import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function NeonTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			user={user}
			classNames={{
        theme: "dark",
        wrapper:
        "bg-gradient-to-br from-indigo-950 via-purple-800 to-pink-900 text-white relative overflow-hidden",
        name: "text-white",
        bio: "text-white",
				header:
					"text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-none",
				cardLink: "block w-full p-4 bg-transparent rounded-lg border-2 border-pink-400 shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:shadow-[0_0_25px_rgba(255,0,255,1)] active:translate-y-1 transition-all relative overflow-hidden",
        link: "text-gray-300 hover:text-pink-400 transition-colors duration-200",
				footer:
					"animate-pulse inline-block px-3 py-1 bg-pink-500 rounded-full text-white shadow-lg shadow-pink-400 drop-shadow-[0_0_20px_rgba(255,0,255,1)]",
			}}
		>
			{/* Overlay neon como children extra */}
			<div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,0,255,0.2)_0%,rgba(0,0,0,0)_80%)] pointer-events-none z-0" />
		</BaseTemplate>
	);
}
