import Sidebar from "../dashboard-sidebar";
import LinksClient from "./links.client";

export default function links() {
    return (
        <>
            <Sidebar />
            <main className="ml-0 md:ml-64 h-screen overflow-y-auto">
                <LinksClient />
            </main>
        </>
    );
}