"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookCheck } from "lucide-react";
import { MotionLi, MotionUl } from "@/components/ui/motion";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchResults />
    </Suspense>
  )
}

function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<
    Array<{ slug: string; title: string; description: string; type: string }>
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
            {`Resultados para "${query}"`}
          </h1>
        </header>
        {loading ? (
          <Loading />
        ) : results.length === 0 ? (
          <p className="text-center">Nenhum resultado encontrado.</p>
        ) : (
          <MotionUl
            className="space-y-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {results.map((guide) => (
                <MotionLi
                  key={guide.slug}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gray-50 p-6 rounded-md border hover:border-green-600 transition-colors duration-200"
                >
                  <Link
                    href={`/ajuda/guia/${guide.slug}`}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center"
                  >
                    <div className="flex flex-col mb-2 md:mb-0">
                      <h2 className="text-xl font-semibold hover:underline w-fit">
                        {guide.title}
                      </h2>
                      <p className="text-sm">{guide.description}</p>
                    </div>
                    <span className="flex items-center text-xs text-white bg-green-600 rounded-full px-2 py-1 gap-2">
                      <BookCheck size={16} />
                      {guide.type}
                    </span>
                  </Link>
                </MotionLi>
              ))}
            </AnimatePresence>
          </MotionUl>
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

function Loading() {
  return (
    <div className="w-full flex items-center justify-center">
      <span className="loader"></span>
    </div>
  )
}
