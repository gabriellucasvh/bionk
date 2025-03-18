import Sidebar from "../dashboard-sidebar";
import LinksClient from "./links.client";

export default function links() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <LinksClient />
        </div>
    );
}