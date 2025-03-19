import Sidebar from "../dashboard-sidebar";
import AnalisesClient from "./analises.client";

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