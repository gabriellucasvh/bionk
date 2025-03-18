import Sidebar from "../dashboard-sidebar";
import PerfilClient from "./perfil.client";

export default function perfil() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <PerfilClient />
        </div>
    );
}