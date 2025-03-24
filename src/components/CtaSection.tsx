"use client"

import { ArrowRight, Users } from "lucide-react";
import NeoButton from "./neo-button";
import { useRouter } from "next/navigation";

export default function CtaSection() {
    const router = useRouter()
    return (

        <section className="py-20 bg-white text-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 font-baithe tracking-wider">
                        Pronto para unificar sua presença online?
                    </h2>
                    <p className="text-lg mb-8 text-black">
                        Junte-se a milhares de criadores que já estão aproveitando o poder do Bionk
                    </p>

                    <div className="inline-flex flex-wrap justify-center gap-4">
                        <div className="relative group">
                            <NeoButton
                                className="bg-white flex px-8 py-4 text-black font-semibold"
                                onClick={() => {router.push("/registro")}}
                            >
                                Criar Conta Grátis <ArrowRight className="ml-2 h-5 w-5" />
                            </NeoButton>
                        </div>

                        <NeoButton
                            className="bg-lime-400 flex px-8 py-4 "
                            onClick={() => {router.push("/planos")}}
                        >
                            Ver Planos Premium <Users className="ml-2 h-5 w-5" />
                        </NeoButton>
                    </div>
                </div>
            </div>
        </section>
    )
}