
import Sidebar from "../dashboard-sidebar";
import PerfilClient from "./perfil.client";

export default function Perfil() {
    return (
        <>
            <Sidebar />
            <main className="ml-0 md:ml-64 h-screen overflow-y-auto">
                <PerfilClient />
            </main>
        </>
    );
}
