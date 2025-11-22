import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function SocialConnect({ locale = "pt-br" }: { locale?: "pt-br" | "en" | "es" }) {
    const dict = useMemo(() => {
        if (locale === "en") {
            return {
                badge: "Want more followers?",
                title: "Connect everything that matters, without excess",
                description:
                    "Bionk brings your networks together in a clear, engaging narrative. Lead your audience straight to what matters.",
                instagramTitle: "Turn visits into real clicks",
                instagramDesc:
                    "Convert profile interest into direct access to your products, content and partnerships.",
                tiktokTitle: "From the video to the next step",
                tiktokDesc:
                    "Take your audience from videos to campaigns, offers and exclusive pages without losing engagement.",
                youtubeTitle: "Links that keep your audience with you",
                youtubeDesc:
                    "Group episodes, courses and communities on a single accessible page with descriptions and preview screens.",
                more: "and much more!",
            };
        }
        if (locale === "es") {
            return {
                badge: "¿Quieres más seguidores?",
                title: "Conecta todo lo que importa, sin excesos",
                description:
                    "Bionk reúne tus redes en una narrativa clara y atractiva. Lleva a tu audiencia directo a lo que importa.",
                instagramTitle: "Transforma visitas en clics reales",
                instagramDesc:
                    "Convierte el interés del perfil en accesos directos a tus productos, contenidos y alianzas.",
                tiktokTitle: "Del video al siguiente paso",
                tiktokDesc:
                    "Lleva a tu audiencia de los videos a campañas, ofertas y páginas exclusivas sin perder engagement.",
                youtubeTitle: "Enlaces que mantienen a la audiencia contigo",
                youtubeDesc:
                    "Agrupa episodios, cursos y comunidades en una única página accesible con descripciones y vistas previas.",
                more: "¡y mucho más!",
            };
        }
        return {
            badge: "Quer ter mais seguidores?",
            title: "Conecte tudo o que importa, sem excessos",
            description:
                "Bionk reúne suas redes em uma narrativa clara e envolvente. Leve seu público direto ao que faz sentido.",
            instagramTitle: "Transforme visitas em cliques reais",
            instagramDesc:
                "Converta o interesse do perfil em acessos diretos para seus produtos, conteúdos e parcerias.",
            tiktokTitle: "Do vídeo para o próximo passo",
            tiktokDesc:
                "Leve seu público dos vídeos para campanhas, ofertas e páginas exclusivas sem perder engajamento.",
            youtubeTitle: "Links que mantêm a audiência com você",
            youtubeDesc:
                "Agrupe episódios, cursos e comunidades em uma única página acessível com descrição e telas com previews.",
            more: "e muito mais!",
        };
    }, [locale]);
    return (
        <section className="bg-bunker-950 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <div className="text-sky-300 text-sm uppercase tracking-[4px]">
                        {dict.badge}
                    </div>
                    <h2 className="title mt-3 text-3xl text-white sm:text-4xl">
                        {dict.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-bunker-300">
                        {dict.description}
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
                            {dict.instagramTitle}
                        </h3>
                        <p className="mt-2 text-bunker-300">
                            {dict.instagramDesc}
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
                            {dict.tiktokTitle}
                        </h3>
                        <p className="mt-2 text-bunker-300">
                            {dict.tiktokDesc}
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
                            {dict.youtubeTitle}
                        </h3>
                        <p className="mt-2 text-bunker-300">
                            {dict.youtubeDesc}
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
                        {dict.more}
                    </Link>
                </div>
            </div>
        </section>
    );
}
