"use client";

import { PencilSimple, Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LoadingPage from "@/components/layout/LoadingPage";
import UserPagePreview from "./design/components/UserPagePreview";
import { useCustomizations } from "./design/hooks/useCustomizations";
import { useProfileData } from "./design/hooks/useProfileData";

export default function Studio() {
	const { data: session, status } = useSession();

	const { userData, isProfileLoading } = useProfileData(
		session?.user?.id || undefined,
		session?.user?.image || undefined
	);

	const { userCustomizations } = useCustomizations();

	if (status === "loading" || isProfileLoading) {
		return <LoadingPage />;
	}

	return (
		<div className="min-h-screen p-8 md:p-12">
			<div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Minhas Páginas</h1>
					<p className="mt-2 text-zinc-500">Gerencie seus perfis e links.</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Card da página principal */}
				<div className="group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
					{/* Área da miniatura com CSS Scale Trick */}
					<div className="relative h-56 w-full overflow-hidden border-b bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
						<div className="pointer-events-none absolute top-0 left-0 h-[200%] w-[200%] origin-top-left scale-50 select-none">
							<UserPagePreview
								customizations={userCustomizations}
								userData={userData}
							/>
						</div>
					</div>

					{/* Rodapé do card */}
					<div className="flex items-center justify-between p-5">
						<div>
							<h3 className="font-bold text-lg leading-tight">
								{userData.name || "Sem Nome"}
							</h3>
							<p className="mt-1 text-sm text-zinc-500">
								bionk.me/{userData.username}
							</p>
						</div>
						<Link
							className="flex items-center justify-center rounded-xl bg-zinc-100 p-3 text-black transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
							href="/studio/design"
							title="Editar Página"
						>
							<PencilSimple className="size-5" weight="bold" />
						</Link>
					</div>
				</div>

				{/* Placeholder para futuras páginas */}
				<div className="group flex h-full min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-zinc-200 border-dashed text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-300">
					<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 transition-transform group-hover:scale-110 dark:bg-zinc-800">
						<Plus className="size-6" weight="bold" />
					</div>
					<span className="font-semibold">Criar nova página</span>
					<span className="mt-2 text-xs opacity-60">
						1 de 10 páginas grátis
					</span>
				</div>
			</div>
		</div>
	);
}
