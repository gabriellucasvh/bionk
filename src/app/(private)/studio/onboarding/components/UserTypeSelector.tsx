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
			<Label className="mb-2 block">Selecione o tipo de usuário</Label>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{options.map((opt) => {
					const active = selected === opt.key;
					return (
						<button
							className={`rounded-3xl border p-0 text-left transition ${
								active
									? "ring-3 ring-black"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							}`}
							key={opt.key}
							onClick={() => onSelect(opt.key)}
							type="button"
						>
							<div className="aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-gray-100 dark:bg-gray-800">
								<Image
									alt={opt.title}
									className="h-full w-full object-cover"
									height={240}
									src={opt.image}
									width={320}
								/>
							</div>
							<div className="p-4">
								<p className="font-semibold">{opt.title}</p>
								<p className="text-muted-foreground text-sm">
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
