import type { Metadata } from "next";
import Sidebar from "../dashboard.sidebar";
import ConfigsClient from "./configs.client";

export const metadata: Metadata = {
    title: "Bionk Configurações",
    description: "Ajuste preferências, segurança e notificações da sua conta Bionk. Tudo organizado para você configurar em poucos cliques!",
};

export default function links() {
    return (
        <>
            <Sidebar />
            <main className="ml-0 md:ml-64 mb-20 md:mb-0 h-screen overflow-y-auto">
                <ConfigsClient />
            </main>
        </>
    );
}
