import type { Metadata } from "next";
import Sidebar from "../dashboard-sidebar";
import AnalisesClient from "./analises.client";

export const metadata: Metadata = {
    title: "Bionk Análises",
    description: "Acompanhe cliques, tráfego e engajamento em tempo real. Transforme dados em estratégia com os dashboards mais completos para Links in Bio!",
};

export default function analises() {
    return (
        <>
            <Sidebar />
            <main className="ml-0 md:ml-64 mb-20 md:mb-0 h-screen overflow-y-auto">
                <AnalisesClient />
            </main>
        </>
    )
}