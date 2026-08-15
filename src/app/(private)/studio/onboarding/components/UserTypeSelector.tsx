"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";

export default function UserTypeSelector({
	selected,
	onSelect,
}: {
	selected: string;
	onSelect: (value: string) => void;
}) {
	const options = [
		{
			key: "creator",
			title: "Criador",
			description:
				"Mostre seu trabalho, compartilhe conteúdo e conecte-se com seu público.",
			image: "/images/criador.png",
		},
		{
			key: "enterprise",
			title: "Empresa",
			description:
				"Divulgue sua marca, apresente produtos e destaque suas campanhas.",
			image: "/images/empresa.png",
		},
		{
			key: "personal",
			title: "Pessoal",
			description:
				"Crie um espaço só seu para reunir links, projetos e redes sociais.",
			image: "/images/pessoal.png",
		},
	];
	return (
		<div>
			<div className="flex flex-col gap-3">
				{options.map((opt) => {
					const active = selected === opt.key;
					return (
						<button
							className={`flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition ${
								active
									? "ring ring-black"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							}`}
							key={opt.key}
							onClick={() => onSelect(opt.key)}
							type="button"
						>
							<div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
								<Image
									alt={opt.title}
									className="h-full w-full object-cover"
									height={80}
									src={opt.image}
									width={80}
								/>
							</div>
							<div className="flex flex-col justify-center">
								<h3 className="mb-1 font-semibold text-gray-900 text-lg dark:text-white">
									{opt.title}
								</h3>
								<p className="text-gray-500 text-sm leading-snug dark:text-gray-400">
									{opt.description}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
