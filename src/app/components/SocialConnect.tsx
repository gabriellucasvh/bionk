import { InstagramLogo, TiktokLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

export default function SocialConnect() {
	return (
		<section className="bg-violet-600 py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="inline-block rounded-full bg-[#d2f34c] px-4 py-1 font-bold text-black text-xs uppercase tracking-[4px]">
						Quer ter mais seguidores?
					</div>
					<h2 className="title mt-4 font-black text-4xl text-white sm:text-5xl">
						Conecte tudo o que importa, sem excessos
					</h2>
					<p className="mt-4 max-w-2xl font-medium text-lg text-white/90">
						Bionk reúne suas redes em uma narrativa clara e envolvente. Leve seu
						público direto ao que faz sentido.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="rounded-3xl bg-rose-400 p-6">
						<div className="flex items-center gap-2 text-black">
							<InstagramLogo weight="fill" className="text-black" size={24} />
							<span className="font-bold text-xs uppercase tracking-[3px]">
								Instagram
							</span>
						</div>
						<h3 className="mt-4 font-black text-2xl text-black">
							Transforme visitas em cliques reais
						</h3>
						<p className="mt-2 font-medium text-black/90">
							Converta o interesse do perfil em acessos diretos para seus
							produtos, conteúdos e parcerias.
						</p>
					</div>

					<div className="rounded-3xl bg-sky-400 p-6">
						<div className="flex items-center gap-2 text-black">
							<TiktokLogo weight="fill" className="text-black" size={24} />
							<span className="font-bold text-xs uppercase tracking-[3px]">
								TikTok
							</span>
						</div>
						<h3 className="mt-4 font-black text-2xl text-black">
							Do vídeo para o próximo passo
						</h3>
						<p className="mt-2 font-medium text-black/90">
							Leve seu público dos vídeos para campanhas, ofertas e páginas
							exclusivas sem perder engajamento.
						</p>
					</div>

					<div className="rounded-3xl bg-emerald-400 p-6">
						<div className="flex items-center gap-2 text-black">
							<YoutubeLogo weight="fill" className="text-black" size={24} />
							<span className="font-bold text-xs uppercase tracking-[3px]">
								YouTube
							</span>
						</div>
						<h3 className="mt-4 font-black text-2xl text-black">
							Links que mantêm a audiência com você
						</h3>
						<p className="mt-2 font-medium text-black/90">
							Agrupe episódios, cursos e comunidades em uma única página
							acessível com descrição e telas com previews.
						</p>
					</div>
				</div>

				<div className="mt-10 flex flex-wrap items-center gap-4">
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="WhatsApp"
							height={32}
							src="/images/whatsapp-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="X"
							className="brightness-0"
							height={32}
							src="/images/x-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Facebook"
							height={32}
							src="/images/facebook-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Telegram"
							height={32}
							src="/images/telegram-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Pinterest"
							height={32}
							src="/images/pinterest-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Snapchat"
							height={32}
							src="/images/snapchat-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Discord"
							height={32}
							src="/images/discord-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Threads"
							className="brightness-0"
							height={32}
							src="/images/threads-icon.svg"
							width={32}
						/>
					</div>
					<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white p-2">
						<Image
							alt="Twitch"
							height={32}
							src="/images/twitch-icon.svg"
							width={32}
						/>
					</div>
					<Link
						className="mx-4 flex items-center justify-center text-center font-bold text-white underline decoration-dotted underline-offset-4 hover:text-[#d2f34c]"
						href="/registro"
					>
						e muito mais!
					</Link>
				</div>
			</div>
		</section>
	);
}
