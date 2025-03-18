import Sidebar from "../dashboard-sidebar";
import AnalisesClient from "./analises.client";

export default function analises() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <AnalisesClient />
        </div>
    )
}