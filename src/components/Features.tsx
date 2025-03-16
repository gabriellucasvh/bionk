import { CheckCircle, Shield, Zap } from "lucide-react";


export default function Features() {
    return (

        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold font-baithe tracking-wide text-gray-900 sm:text-4xl">
                        Recursos que fazem a diferença
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Tudo o que você precisa para gerenciar sua presença online em um só lugar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <CheckCircle className="h-8 w-8 text-green-500" />,
                            title: "Interface Intuitiva",
                            description: "Fácil de configurar, sem necessidade de conhecimentos técnicos."
                        },
                        {
                            icon: <Zap className="h-8 w-8 text-yellow-500" />,
                            title: "Carregamento Rápido",
                            description: "Experiência otimizada para seus seguidores, sem demoras."
                        },
                        {
                            icon: <Shield className="h-8 w-8 text-blue-500" />,
                            title: "Segurança Avançada",
                            description: "Proteja seus dados e links com nossa tecnologia robusta."
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                        >
                            <div className="bg-white inline-flex rounded-full p-3 shadow mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}