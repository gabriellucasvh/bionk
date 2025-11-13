import Image from "next/image";
import Link from "next/link";

export default function SocialConnect() {
	return (
		<section className="bg-bunker-950 py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mb-10">
					<div className="text-sky-300 text-sm uppercase tracking-[4px]">
						Quer ter mais seguidores?
					</div>
					<h2 className="title mt-3 text-3xl text-white sm:text-4xl">
						Conecte tudo o que importa, sem excessos
					</h2>
					<p className="mt-4 max-w-2xl text-bunker-300">
						Bionk reúne suas redes em uma narrativa clara e envolvente. Leve seu
						público direto ao que faz sentido.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="rounded-xl border border-neutral-800 bg-rose-900 p-6">
						<div className="flex items-center gap-2 text-bunker-100">
							<Image
								alt="Instagram"
								height={20}
								src="/images/instagram-icon.svg"
								width={20}
							/>
							<span className="text-xs uppercase tracking-[3px]">
								Instagram
							</span>
						</div>
						<h3 className="mt-2 font-semibold text-white text-xl">
							Transforme visitas em cliques reais
						</h3>
						<p className="mt-2 text-bunker-300">
							Converta o interesse do perfil em acessos diretos para seus
							produtos, conteúdos e parcerias.
						</p>
					</div>

					<div className="rounded-xl border border-neutral-800 bg-bunker-900 p-6">
						<div className="flex items-center gap-2 text-bunker-100">
							<Image
								alt="TikTok"
								height={20}
								src="/images/tiktok-icon.svg"
								width={20}
							/>
							<span className="text-xs uppercase tracking-[3px]">TikTok</span>
						</div>
						<h3 className="mt-2 font-semibold text-white text-xl">
							Do vídeo para o próximo passo
						</h3>
						<p className="mt-2 text-bunker-300">
							Leve seu público dos vídeos para campanhas, ofertas e páginas
							exclusivas sem perder engajamento.
						</p>
					</div>

					<div className="rounded-xl border border-neutral-800 bg-red-900 p-6">
						<div className="flex items-center gap-2 text-bunker-100">
							<Image
								alt="YouTube"
								height={20}
								src="/images/youtube-icon.svg"
								width={20}
							/>
							<span className="text-xs uppercase tracking-[3px]">YouTube</span>
						</div>
						<h3 className="mt-2 font-semibold text-white text-xl">
							Links que mantêm a audiência com você
						</h3>
						<p className="mt-2 text-bunker-300">
							Agrupe episódios, cursos e comunidades em uma única página
							acessível com descrição e telas com previews.
						</p>
					</div>
				</div>

				<div className="mt-10 flex flex-wrap items-center gap-3">
					<Image
						alt="WhatsApp"
						height={32}
						src="/images/whatsapp-icon.svg"
						width={32}
					/>
					<Image
						alt="X"
						className="brightness-0 invert"
						height={32}
						src="/images/x-icon.svg"
						width={32}
					/>
					<Image
						alt="Facebook"
						height={32}
						src="/images/facebook-icon.svg"
						width={32}
					/>
					<Image
						alt="Telegram"
						height={32}
						src="/images/telegram-icon.svg"
						width={32}
					/>
					<Image
						alt="Pinterest"
						height={32}
						src="/images/pinterest-icon.svg"
						width={32}
					/>
					<Image
						alt="Snapchat"
						height={32}
						src="/images/snapchat-icon.svg"
						width={32}
					/>
					<Image
						alt="Discord"
						height={32}
						src="/images/discord-icon.svg"
						width={32}
					/>
					<Image
						alt="Threads"
						height={32}
						src="/images/threads-icon.svg"
						width={32}
					/>
					<Image
						alt="Twitch"
						height={32}
						src="/images/twitch-icon.svg"
						width={32}
					/>
					<Link
						className="mx-4 flex items-center justify-center text-center text-white underline decoration-dotted underline-offset-2 hover:text-sky-300"
						href="/registro"
					>
						e muito mais!
					</Link>
				</div>
			</div>
		</section>
	);
}
