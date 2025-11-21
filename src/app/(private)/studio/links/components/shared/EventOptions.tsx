"use client";

import { ClockFading, Ticket } from "lucide-react";

interface EventOptionsProps {
	onOptionSelect: (option: "event_tickets" | "event_countdown") => void;
}

type Option = {
	value: "event_tickets" | "event_countdown";
	title: string;
	description: string;
	icon: "ticket" | "countdown";
	bg: string;
};

const OptionItem = ({
	opt,
	onSelect,
}: {
	opt: Option;
	onSelect: (v: Option["value"]) => void;
}) => {
	return (
		<button
			className="relative flex w-full max-w-full items-center justify-between gap-4 overflow-hidden py-2 transition-colors"
			onClick={() => onSelect(opt.value)}
			type="button"
		>
			<div className="flex items-center gap-4">
				<div
					className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}
				>
					{opt.icon === "ticket" ? (
						<Ticket className="h-6 w-6 text-white" strokeWidth={1.5} />
					) : (
						<ClockFading className="h-6 w-6 text-white" strokeWidth={1.5} />
					)}
				</div>
				<div className="flex min-w-0 max-w-md flex-1 flex-col">
					<span className="text-left font-medium">{opt.title}</span>
					<span className="max-w-md truncate break-words text-left font-normal text-gray-500 text-sm dark:text-gray-300">
						{opt.description}
					</span>
				</div>
			</div>
			<div
				className={
					"-translate-y-1/2 absolute top-1/2 right-0 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background dark:from-transparent dark:via-zinc-900 dark:to-zinc-900"
				}
			>
				<svg
					aria-hidden="true"
					className="text-black dark:text-white"
					fill="none"
					height="20"
					viewBox="0 0 24 24"
					width="20"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Seta para a direita</title>
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
					/>
				</svg>
			</div>
		</button>
	);
};

const EventOptions = ({ onOptionSelect }: EventOptionsProps) => {
	const options: Option[] = [
		{
			value: "event_tickets",
			title: "Ingressos",
			description: "Adicione um botão de compra de ingressos.",
			icon: "ticket",
			bg: "bg-purple-700",
		},
		{
			value: "event_countdown",
			title: "Contagem Regressiva",
			description: "Mostre um contador até o evento.",
			icon: "countdown",
			bg: "bg-blue-400",
		},
	];

	return (
		<div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
			{options.map((opt) => (
				<OptionItem
					key={opt.value}
					onSelect={(v) => onOptionSelect(v)}
					opt={opt}
				/>
			))}
		</div>
	);
};

export default EventOptions;
