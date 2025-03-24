"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  // Variantes para o container e os itens com efeito de stagger e fade in/slide up
  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <main className="py-10 px-4">
      <section className="max-w-2xl mx-auto">
        <header>
          <h1 className="text-3xl font-bold text-center mb-6">
            Resultados para "{query}"
          </h1>
        </header>
        {loading ? (
          <div className="w-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        ) : results.length === 0 ? (
          <p className="text-center">Nenhum resultado encontrado.</p>
        ) : (
          <motion.ul
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {results.map((guide) => (
                <motion.li
                  key={guide.slug}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gray-50 p-6 rounded-md border hover:border-green-600 transition-colors duration-200"
                >
                  <Link href={`/ajuda/guia/${guide.slug}`} className="block">
                    <h2 className="text-xl font-semibold hover:underline">{guide.title}</h2>
                    <p className="text-sm">{guide.description}</p>
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
        <footer className="mt-6 text-center">
          <Button
            onClick={() => router.push("/ajuda")}
            className="bg-green-600 hover:bg-green-700"
          >
            Voltar à Central de Ajuda
          </Button>
        </footer>
      </section>
    </main>
  )
}
