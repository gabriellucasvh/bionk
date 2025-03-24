"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HeaderAjuda() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    router.push(`/ajuda/guia/search?q=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <header className="bg-gradient-to-r from-green-800 to-green-500 py-8 px-4 md:py-10 shadow-md rounded-b-2xl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl md:text-4xl font-bold text-center mb-6">
          Bionk Ajuda
        </h1>
        <p className="text-white text-lg mb-2 text-center">
          Como podemos ajudar você?
        </p>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-black" />
            </div>
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por tópicos de ajuda..."
              className="pl-10 md:pl-12 pr-16 h-14 rounded-full bg-white text-black placeholder:text-black/70 border-2 border-transparent focus:border-green-300 focus-visible:ring-green-500 transition-all outline-none"
              aria-label="Buscar tópicos de ajuda"
            />
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 h-12 px-4 rounded-full transition-colors"
            >
              Buscar
            </Button>
          </form>
          <p className="text-white/80 text-sm mt-3 text-center">
            Encontre respostas para suas dúvidas mais comuns
          </p>
        </div>
      </div>
    </header>
  )
}
