import type { Metadata } from "next";
import AudienceClient from "./AudienceClient";

export const metadata: Metadata = {
	title: "Audiência | Bionk",
	description: "Gerencie e visualize os contatos captados pela sua página",
};

export default function AudiencePage() {
	return (
		<div className="flex w-full flex-col p-4 md:p-8">
			<div className="mb-8 max-w-4xl">
				<h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-100">
					Audiência
				</h1>
				<p className="mt-2 text-zinc-500 dark:text-zinc-400">
					Acompanhe os contatos captados através dos seus formulários e analise
					o engajamento da sua audiência.
				</p>
			</div>

			<AudienceClient />
		</div>
	);
}
