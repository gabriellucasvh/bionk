import { Star } from "lucide-react";

export default function Testimonials() {
    return (
        <section className="py-24 bg-green-500">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-baithe tracking-wide text-white sm:text-4xl">
                        O que nossos usuários dizem
                    </h2>
                    <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
                        Milhares de criadores já transformaram sua presença online com o Bionk
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            content: "O Bionk transformou minha presença nas redes sociais. Agora posso compartilhar todos os meus links de forma elegante!",
                            author: "Ana Silva",
                            role: "Influenciadora Digital",
                            rating: 5
                        },
                        {
                            content: "Interface super intuitiva! Em poucos minutos, configurei todos os meus links e comecei a compartilhar com minha audiência.",
                            author: "Carlos Santos",
                            role: "Produtor de Conteúdo",
                            rating: 5
                        },
                        {
                            content: "A melhor ferramenta para centralizarr links que já usei. Simples, bonita e eficiente. Recomendo a todos.",
                            author: "Mariana Costa",
                            role: "Empreendedora Digital",
                            rating: 4
                        }
                    ].map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-8 shadow-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 opacity-50 rounded-bl-full"></div>

                            <p className="text-gray-700 mb-6 relative z-10">"{testimonial.content}"</p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                                <div className="flex">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}