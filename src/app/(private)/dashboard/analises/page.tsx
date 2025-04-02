// app/analises/page.tsx
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import Sidebar from "../dashboard-sidebar";
import AnalisesClient from "./analises.client";
import { authOptions } from "@/lib/auth"; // ajuste conforme sua configuração

export const metadata: Metadata = {
  title: "Bionk Análises",
  description:
    "Acompanhe cliques, tráfego e engajamento em tempo real. Transforme dados em estratégia com os dashboards mais completos para Links in Bio!",
};

export default async function Analises() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <>
      <Sidebar />
      <main className="ml-0 md:ml-64 mb-20 md:mb-0 h-screen overflow-y-auto">
        {userId ? (
          <AnalisesClient userId={userId} />
        ) : (
          <section className="p-4">
            <p className="text-center text-lg font-medium">
              Você precisa estar autenticado para acessar esta página.
            </p>
          </section>
        )}
      </main>
    </>
  );
}
