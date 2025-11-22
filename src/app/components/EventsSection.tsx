import Image from "next/image";
import { useMemo } from "react";

export default function EventsSection({ locale = "pt-br" }: { locale?: "pt-br" | "en" | "es" }) {
    const dict = useMemo(() => {
        if (locale === "en") {
            return {
                badge: "For those with events",
                title: "Tickets, schedule and links that convert",
                description:
                    "Create a simple flow for your audience to buy and join. Integrate links from platforms like Sympla and others with no fuss.",
                nextEvent: "Next event",
                eventTitle: "Launch Night",
                city: "São Paulo",
                platform: "• Sympla",
                buy: "Buy",
                paragraph:
                    "If you run events, your Bionk page can turn curiosity into presence. Clear links, easy decisions and a light experience.",
                formats: "Formats",
                noLimits: "No limits.",
                formatsDesc:
                    "Structure a clear list with different offers. Each item with description, price and a simple action.",
                chips: [
                    "Show",
                    "Workshop",
                    "Tour",
                    "Live",
                    "Lecture",
                    "Congress",
                    "Festival",
                    "Exhibition",
                    "Training",
                    "Conference",
                    "...",
                ],
                closing:
                    "Create your event your way, with freedom to define each detail. Customize, promote and offer a unique experience to your audience.",
            };
        }
        if (locale === "es") {
            return {
                badge: "Para quienes tienen eventos",
                title: "Entradas, agenda y enlaces que convierten",
                description:
                    "Crea un flujo simple para que tu público compre y participe. Integra enlaces de plataformas como Sympla y otras, sin complicación.",
                nextEvent: "Próximo evento",
                eventTitle: "Noche de Lanzamiento",
                city: "São Paulo",
                platform: "• Sympla",
                buy: "Comprar",
                paragraph:
                    "Si organizas eventos, tu página en Bionk puede ser el lugar donde la curiosidad se convierte en presencia. Enlaces claros, decisiones fáciles y una experiencia ligera.",
                formats: "Formatos",
                noLimits: "Sin límites.",
                formatsDesc:
                    "Estructura una lista clara con diferentes ofertas. Cada ítem con descripción, precio y acción simple.",
                chips: [
                    "Show",
                    "Workshop",
                    "Tour",
                    "Live",
                    "Charla",
                    "Congreso",
                    "Festival",
                    "Exposición",
                    "Entrenamiento",
                    "Conferencia",
                    "...",
                ],
                closing:
                    "Crea tu evento a tu manera, con libertad para definir cada detalle. Personaliza, divulga y ofrece una experiencia única a tu público.",
            };
        }
        return {
            badge: "Para quem tem eventos",
            title: "Ingressos, agenda e links que convertem",
            description:
                "Crie um fluxo simples para o seu público comprar e participar. Integre links de plataformas como Sympla e outras, sem complicação.",
            nextEvent: "Próximo evento",
            eventTitle: "Noite de Lançamento",
            city: "São Paulo",
            platform: "• Sympla",
            buy: "Comprar",
            paragraph:
                "Se você organiza eventos, sua página na Bionk pode ser o lugar onde a curiosidade vira presença. Links claros, decisões fáceis e uma experiência leve.",
            formats: "Formatos",
            noLimits: "Sem Limites.",
            formatsDesc:
                "Estruture uma lista clara com diferentes ofertas. Cada item com descrição, preço e ação simples.",
            chips: [
                "Show",
                "Workshop",
                "Tour",
                "Live",
                "Palestra",
                "Congresso",
                "Festival",
                "Exposição",
                "Treinamento",
                "Conferência",
                "...",
            ],
            closing:
                "Crie seu evento do seu jeito, com liberdade para definir cada detalhe. Personalize, divulgue e ofereça uma experiência única ao seu público.",
        };
    }, [locale]);

    return (
        <section className="bg-bunker-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <div className="text-sky-400 text-sm uppercase tracking-[4px]">
                        {dict.badge}
                    </div>
                    <h2 className="title mt-3 text-3xl text-bunker-950 sm:text-4xl">
                        {dict.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-bunker-700">{dict.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-white p-6">
                        <div className="text-sky-400 text-xs uppercase tracking-[3px]">
                            {dict.nextEvent}
                        </div>
                        <div className="mt-4 rounded-3xl border p-4">
                            <h3 className="mt-2 font-semibold text-bunker-900 text-xl">
                                {dict.eventTitle}
                            </h3>
                            <div className="my-2 text-bunker-700">
                                <p>{dict.city}</p>
                                {new Date().toLocaleDateString()} • 19:00
                            </div>
                            <div className="flex text-bunker-700 text-xs">
                                <Image alt="Sympla" height={15} src="/images/sympla-icon.svg" width={15} /> {dict.platform}
                            </div>
                            <div className="mt-4 cursor-pointer select-none rounded-full border border-bunker-200 bg-black px-4 py-2 text-center text-sm text-white">
                                {dict.buy}
                            </div>
                        </div>
                        <p className="mt-3 text-bunker-700">{dict.paragraph}</p>
                    </div>

                    <div className="rounded-3xl bg-white p-6">
                        <div className="text-sky-400 text-xs uppercase tracking-[3px]">
                            {dict.formats}
                        </div>
                        <h3 className="mt-2 font-semibold text-bunker-900 text-xl">{dict.noLimits}</h3>
                        <p className="mt-3 text-bunker-700">{dict.formatsDesc}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {dict.chips.map((c, i) => (
                                <span
                                    className="rounded-full border border-bunker-200 bg-white px-4 py-3 text-bunker-800 text-sm"
                                    key={i}
                                >
                                    {c}
                                </span>
                            ))}
                        </div>
                        <div className="mt-4 text-bunker-700">{dict.closing}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
