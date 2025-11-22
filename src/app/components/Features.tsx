import {
    BarChart3,
    Compass,
    Link as LinkIcon,
    ListChecks,
    Palette,
    Rocket,
} from "lucide-react";
import { useMemo } from "react";

export default function Features({ locale = "pt-br" }: { locale?: "pt-br" | "en" | "es" }) {
    const dict = useMemo(() => {
        if (locale === "en") {
            return {
                badge: "Features that matter",
                title: "Everything you need, without the fuss",
                description:
                    "Organize your links, highlight content and guide your audience with a clear, lightweight experience.",
                items: [
                    {
                        icon: LinkIcon,
                        title: "Link in bio",
                        description:
                            "Group socials, content, products and contact in one clear place.",
                        bg: "bg-sky-950",
                        accent: "text-sky-500",
                    },
                    {
                        icon: ListChecks,
                        title: "Simple organization",
                        description:
                            "Drag and drop, reorder and edit titles and URLs without friction.",
                        bg: "bg-emerald-950",
                        accent: "text-emerald-500",
                    },
                    {
                        icon: BarChart3,
                        title: "Metrics",
                        description:
                            "Views and clicks per link. Decide based on data.",
                        bg: "bg-indigo-950",
                        accent: "text-indigo-500",
                    },
                    {
                        icon: Palette,
                        title: "Customization",
                        description:
                            "Consistent look with fonts, colors and layouts designed for clarity.",
                        bg: "bg-amber-950",
                        accent: "text-amber-500",
                    },
                    {
                        icon: Rocket,
                        title: "Performance & SEO",
                        description:
                            "Lightweight structure optimized for search. Fast, straight loading.",
                        bg: "bg-violet-950",
                        accent: "text-violet-500",
                    },
                    {
                        icon: Compass,
                        title: "Discovery",
                        description:
                            "Showcase different formats and lead your audience to the right actions.",
                        bg: "bg-rose-950",
                        accent: "text-rose-500",
                    },
                ],
            };
        }
        if (locale === "es") {
            return {
                badge: "Recursos que importan",
                title: "Todo lo que necesitas, sin complicación",
                description:
                    "Organiza tus enlaces, destaca contenidos y guía a tu audiencia con una experiencia clara y ligera.",
                items: [
                    {
                        icon: LinkIcon,
                        title: "Link en la bio",
                        description:
                            "Agrupa redes, contenidos, productos y contacto en un solo lugar, con claridad.",
                        bg: "bg-sky-950",
                        accent: "text-sky-500",
                    },
                    {
                        icon: ListChecks,
                        title: "Organización simple",
                        description:
                            "Arrastra y suelta, ordena y edita títulos y URLs sin fricción.",
                        bg: "bg-emerald-950",
                        accent: "text-emerald-500",
                    },
                    {
                        icon: BarChart3,
                        title: "Métricas",
                        description:
                            "Vistas y clics por enlace. Decide con base en datos.",
                        bg: "bg-indigo-950",
                        accent: "text-indigo-500",
                    },
                    {
                        icon: Palette,
                        title: "Personalización",
                        description:
                            "Visual consistente con fuentes, colores y diseños pensados para claridad.",
                        bg: "bg-amber-950",
                        accent: "text-amber-500",
                    },
                    {
                        icon: Rocket,
                        title: "Performance y SEO",
                        description:
                            "Estructura ligera y optimizada para búsqueda. Carga ágil y directa.",
                        bg: "bg-violet-950",
                        accent: "text-violet-500",
                    },
                    {
                        icon: Compass,
                        title: "Descubrimiento",
                        description:
                            "Presenta formatos variados y lleva a tu público a las acciones correctas.",
                        bg: "bg-rose-950",
                        accent: "text-rose-500",
                    },
                ],
            };
        }
        return {
            badge: "Recursos que fazem diferença",
            title: "Tudo o que você precisa, sem complicação",
            description:
                "Organize seus links, destaque conteúdos e conduza seu público com uma experiência direta e leve.",
            items: [
                {
                    icon: LinkIcon,
                    title: "Link in bio",
                    description:
                        "Agrupe redes, conteúdos, produtos e contato em um só lugar, com clareza.",
                    bg: "bg-sky-950",
                    accent: "text-sky-500",
                },
                {
                    icon: ListChecks,
                    title: "Organização simples",
                    description:
                        "Arraste e solte, ordene e edite títulos e URLs sem fricção.",
                    bg: "bg-emerald-950",
                    accent: "text-emerald-500",
                },
                {
                    icon: BarChart3,
                    title: "Métricas",
                    description:
                        "Visualizações e cliques por link. Decida com base em dados.",
                    bg: "bg-indigo-950",
                    accent: "text-indigo-500",
                },
                {
                    icon: Palette,
                    title: "Personalização",
                    description:
                        "Visual consistente com fontes, cores e layouts pensados para clareza.",
                    bg: "bg-amber-950",
                    accent: "text-amber-500",
                },
                {
                    icon: Rocket,
                    title: "Performance & SEO",
                    description:
                        "Estrutura leve e otimizada para busca. Carregamento ágil e direto.",
                    bg: "bg-violet-950",
                    accent: "text-violet-500",
                },
                {
                    icon: Compass,
                    title: "Descoberta",
                    description:
                        "Apresente formatos variados e leve seu público às ações certas.",
                    bg: "bg-rose-950",
                    accent: "text-rose-500",
                },
            ],
        };
    }, [locale]);

    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <div className="text-sky-400 text-sm uppercase tracking-[4px]">
                        {dict.badge}
                    </div>
                    <h2 className="title mt-3 text-3xl text-bunker-950 sm:text-4xl">
                        {dict.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-bunker-700">
                        {dict.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    {dict.items.map((item, idx) => {
                        const Icon = item.icon as React.ComponentType<{ className?: string }>;
                        return (
                            <div
                                className={`group relative overflow-hidden rounded-3xl p-6 md:col-span-4 ${item.bg}`}
                                key={idx}
                            >
                                <div className="mb-4 flex items-center justify-start">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white ">
                                        <Icon className={`h-8 w-8 ${item.accent}`} />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-bunker-50 text-xl">{item.title}</h3>
                                <p className="mt-2 text-bunker-50">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
