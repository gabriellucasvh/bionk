"use client";

import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

interface ContactOptionsProps {
	onOptionSelect: (option: "contact_form") => void;
}

const ContactOptions = ({ onOptionSelect }: ContactOptionsProps) => {
	return (
		<div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
			<button
				className="relative flex w-full max-w-full items-center justify-between gap-4 overflow-hidden py-2"
				onClick={() => onOptionSelect("contact_form")}
				type="button"
			>
				<div className="flex items-center gap-4">
					<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-purple-600 dark:bg-purple-500">
						<EnvelopeSimple
							weight="regular"
							className="h-5 w-5 text-white"
						/>
					</div>
					<div className="flex min-w-0 max-w-md flex-1 flex-col">
						<span className="text-left font-medium text-black dark:text-white">Formulário de Contato</span>
						<span className="max-w-md truncate break-words text-left font-normal text-gray-500 text-sm dark:text-gray-300">
							Colete informações dos visitantes na sua página.
						</span>
					</div>
				</div>
				<div className="-translate-y-1/2 absolute top-1/2 right-0 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
					<svg
						className="text-black dark:text-white"
						fill="none"
						height="18"
						viewBox="0 0 16 16"
						width="18"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5.5 3.5L10.5 8.5L5.5 13.5"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.5"
						></path>
					</svg>
				</div>
			</button>
		</div>
	);
};

export default ContactOptions;
