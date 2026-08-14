"use client";

import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import LoadingPage from "@/components/layout/LoadingPage";
import UserPagePreview from "./design/components/UserPagePreview";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Studio() {
	const router = useRouter();

	const { data, isLoading } = useSWR("/api/profile/all", fetcher);

	if (isLoading) {
		return <LoadingPage />;
	}

	const profiles = data?.profiles || [];
	const maxProfiles = 10;
	const canCreateMore = profiles.length < maxProfiles;

	const handleEditProfile = (profileId: string) => {
		// Set the active profile cookie before navigating
		document.cookie = `bionk_active_profile_id=${profileId}; path=/; max-age=2592000; SameSite=Lax`;
		router.push("/studio/design");
	};

	return (
		<div className="min-h-screen p-8 md:p-12">
			<div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Minhas Páginas</h1>
					<p className="mt-2 text-zinc-500">Gerencie seus perfis e links.</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{profiles.map((profile: any) => {
					const userCustomizations = profile.CustomPresets || {};
					return (
						<div
							key={profile.id}
							className="group relative flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
						>
							{/* Área da miniatura simulando um celular */}
							<div
								className="relative flex h-64 w-full justify-center overflow-hidden border-zinc-100 border-b pt-8 dark:border-zinc-800"
								style={{
									background:
										userCustomizations.customBackgroundGradient ||
										userCustomizations.customBackgroundColor ||
										"#f4f4f5",
								}}
							>
								{/* Phone mockup scaled down */}
								<div
									className="relative z-10 origin-top rounded-[40px] shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
									style={{ transform: "scale(0.6)" }}
								>
									<div className="pointer-events-none h-[812px] w-[375px] select-none overflow-hidden rounded-[40px] bg-white dark:bg-zinc-950">
										<UserPagePreview
											customizations={userCustomizations}
											userData={profile}
										/>
									</div>
								</div>
							</div>

							{/* Rodapé do card */}
							<div className="flex items-center justify-between p-5">
								<div>
									<h3 className="font-bold text-lg leading-tight">
										{profile.name || "Sem Nome"}
									</h3>
									<p className="mt-1 text-sm text-zinc-500">
										bionk.me/{profile.username}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										className="flex items-center justify-center rounded-full bg-zinc-100 p-3 text-black transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
										onClick={() => navigator.clipboard.writeText(`https://bionk.me/${profile.username}`)}
										title="Copiar Link"
										type="button"
									>
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M222.14,105.85l-80,80a8,8,0,0,1-11.31-11.31L193.37,112H136a88.09,88.09,0,0,0-88,88,8,8,0,0,1-16,0,104.11,104.11,0,0,1,104-104h57.37L130.83,33.46a8,8,0,0,1,11.31-11.31l80,80A8,8,0,0,1,222.14,105.85Z"></path></svg>
									</button>
									<button
										className="flex items-center justify-center rounded-full bg-zinc-100 px-5 py-2.5 font-semibold text-black transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
										onClick={() => handleEditProfile(profile.id)}
										title="Editar Página"
										type="button"
									>
										Editar
									</button>
								</div>
							</div>
						</div>
					);
				})}

				{/* Placeholder para futuras páginas */}
				{canCreateMore && (
					<Link
						href="/studio/new"
						className="group flex h-full min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-zinc-200 border-dashed text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
					>
						<div className="mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 transition-transform group-hover:scale-110 dark:bg-zinc-800">
							<Plus className="size-6" weight="bold" />
						</div>
						<span className="font-semibold">Criar nova página</span>
						<span className="mt-2 text-xs opacity-60">
							{profiles.length} de {maxProfiles} páginas grátis
						</span>
					</Link>
				)}
			</div>
		</div>
	);
}
