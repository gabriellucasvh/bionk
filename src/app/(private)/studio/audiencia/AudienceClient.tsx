"use client";

import {
	AddressBook,
	PlusCircle,
	TrendDown,
	TrendUp,
	Users,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AudienceDataTable from "./AudienceDataTable";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AudienceClient() {
	const { data, error, isLoading } = useSWR("/api/audience", fetcher);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-32 w-full rounded-xl" />
					<Skeleton className="h-32 w-full rounded-xl" />
				</div>
				<Skeleton className="h-96 w-full rounded-xl" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/20">
				<p className="text-red-600 dark:text-red-400">
					Erro ao carregar a audiência. Tente novamente mais tarde.
				</p>
			</div>
		);
	}

	const submissions = data?.data || [];
	const totalContacts = data?.totalContacts || 0;
	const growthRate = data?.growthRate || 0;

	if (submissions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-300 border-dashed bg-zinc-50 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200/50 dark:bg-zinc-800/50">
					<AddressBook className="h-10 w-10 text-zinc-400" weight="duotone" />
				</div>
				<h2 className="mt-6 font-bold text-xl text-zinc-900 dark:text-zinc-100">
					Nenhum contato ainda
				</h2>
				<p className="mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
					Sua audiência começa aqui. Adicione um Formulário de Contato à sua
					página para começar a captar e-mails, telefones e informações de seus
					visitantes.
				</p>
				<Button asChild className="mt-8" size="lg">
					<Link href="/studio/links">
						<PlusCircle className="mr-2 h-5 w-5" weight="bold" />
						Adicionar Formulário
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="font-medium text-sm text-zinc-500 tracking-tight dark:text-zinc-400">
							Total de Contatos
						</h3>
						<Users className="h-4 w-4 text-zinc-400" />
					</div>
					<div className="mt-1">
						<div className="font-bold text-2xl">{totalContacts}</div>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							Desde o início
						</p>
					</div>
				</div>

				<div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900">
					<div className="flex flex-row items-center justify-between space-y-0 pb-2">
						<h3 className="font-medium text-sm text-zinc-500 tracking-tight dark:text-zinc-400">
							Crescimento Semanal
						</h3>
						{growthRate >= 0 ? (
							<TrendUp className="h-4 w-4 text-emerald-500" />
						) : (
							<TrendDown className="h-4 w-4 text-red-500" />
						)}
					</div>
					<div className="mt-1">
						<div className="font-bold text-2xl">
							{growthRate > 0 ? "+" : ""}
							{growthRate}%
						</div>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							Em relação aos últimos 7 dias
						</p>
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-900">
				<AudienceDataTable data={submissions} />
			</div>
		</div>
	);
}
