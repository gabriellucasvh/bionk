import InteractiveLink from "@/components/InteractiveLink";
import BaseTemplate from "../components/BaseTemplate";
import type { TemplateComponentProps } from "@/types/user-profile";

export default function GradientTemplate({ user }: TemplateComponentProps) {
	const gradientDirections = [
		"bg-gradient-to-r from-green-300 to-purple-400",
		"bg-gradient-to-r from-pink-300 to-amber-400",
		"bg-gradient-to-r from-blue-300 to-emerald-400",
		"bg-gradient-to-r from-violet-300 to-rose-400",
	];

	return (
		<BaseTemplate
			user={user}
			classNames={{
				theme: "dark",
				wrapper:
					"min-h-screen bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400 py-8 px-4 flex flex-col",
				image:
					"mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full p-1 bg-gradient-to-r from-amber-400 via-violet-500 to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300",
				header: "",
				name: "text-2xl font-bold text-white",
				bio: "mt-2 bg-gradient-to-r from-purple-100 to-cyan-200 text-transparent bg-clip-text font-medium",
				cardLink:
					"",
				link: "font-bold text-white drop-shadow-sm",
				footer:
					"max-w-md mx-auto mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center",
			}}
		>
			{/* Customização dos links com gradientes dinâmicos */}
			<section className="w-full">
				<ul className="space-y-4">
					{user.Link.map((link, index) => {
						const gradient =
							gradientDirections[index % gradientDirections.length];
						return (
							<li
								key={link.id}
								className="w-full transform transition-all duration-300 hover:translate-x-1"
							>
								<InteractiveLink
									href={link.url}
									linkId={link.id}
									sensitive={link.sensitive}
									className={`${gradient} block w-full p-4 rounded-lg shadow-md hover:shadow-lg border border-white border-opacity-20 backdrop-blur-sm transition-all duration-300`}
								>
									<span className="font-bold text-white drop-shadow-sm">
										{link.title}
									</span>
									<span className="block text-sm text-white text-opacity-80">
										{link.url}
									</span>
								</InteractiveLink>
							</li>
						);
					})}
				</ul>
			</section>
		</BaseTemplate>
	);
}
