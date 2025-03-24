"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SearchResultsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""
    const [results, setResults] = useState<
        Array<{ slug: string; title: string; description: string }>
    >([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setLoading(false)
            return
        }

        const fetchResults = async () => {
            try {
                const res = await fetch(`/api/ajuda/guides/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data)
            } catch (error) {
                console.error("Erro ao buscar resultados:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query])

    return (
        <main className="py-10 px-4">
            <section className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6">Resultados para "{query}"</h1>
                {loading ? (
                    <span className="w-full flex mx-auto items-center justify-center loader"></span>
                ) : results.length === 0 ? (
                    <p className="text-center">Nenhum resultado encontrado.</p>
                ) : (
                    <ul className="space-y-4">
                        {results.map((guide) => (
                            <li key={guide.slug} className="bg-gray-50 p-6 rounded-md border hover:border-green-600 transition-colors duration-200">
                                <Link href={`/ajuda/guia/${guide.slug}`} className="block">
                                    <h2 className="text-xl font-semibold hover:underline">{guide.title}</h2>
                                    <p className="text-sm">{guide.description}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-6 text-center">
                    <Button onClick={() => router.push("/ajuda")} className="bg-green-600 hover:bg-green-700">
                        Voltar à Central de Ajuda
                    </Button>
                </div>
            </section>
        </main>
    )
}
