"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function HeaderAjuda() {
	const [query, setQuery] = useState("");
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			return;
		}
		router.push(`/ajuda/guia/search?q=${encodeURIComponent(trimmedQuery)}`);
	};

	return (
		<header className="rounded-b-2xl bg-gradient-to-r from-green-800 to-green-500 px-4 py-8 shadow-md md:py-10">
			<div className="mx-auto max-w-6xl">
				<div className="mb-7 flex w-full flex-row items-center justify-center gap-3">
					<Link className="inline-block" href="/">
						<Image
							alt="logo"
							className="h-10 w-min"
							height={30}
							priority
							src="https://res.cloudinary.com/dlfpjuk2r/image/upload/v1755641014/bionk-logo-icon_ya5kbp.svg"
							width={90}
						/>
					</Link>
					<h1 className="font-bold text-2xl text-white md:text-4xl">
						Central de Ajuda
					</h1>
				</div>
				<p className="mb-2 text-center text-md text-white">
					Como podemos ajudar você?
				</p>
				<div className="mx-auto max-w-2xl">
					<form className="group relative" onSubmit={handleSearch}>
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Search className="h-5 w-5 text-black" />
						</div>
						<Input
							aria-label="Buscar tópicos de ajuda"
							className="h-14 rounded-full border-2 border-transparent bg-white pr-16 pl-10 text-black outline-none transition-all placeholder:text-black/70 focus:border-green-300 focus-visible:ring-green-500 md:pl-12"
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Buscar por tópicos de ajuda..."
							type="search"
							value={query}
						/>
						<Button
							className="-translate-y-1/2 absolute top-1/2 right-1 h-12 rounded-full bg-green-600 px-4 transition-colors hover:bg-green-700"
							type="submit"
						>
							Buscar
						</Button>
					</form>
					<p className="mt-3 text-center text-sm text-white/80">
						Encontre respostas para suas dúvidas mais comuns
					</p>
				</div>
			</div>
		</header>
	);
}
