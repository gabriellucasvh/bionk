import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import ClientDashboard from "./client-dashboard"
export default async function dashboard() {

    const session = await getServerSession()

    if(!session) {
        return redirect('/')
    }
    return(
        <div className="bg-white">
            <ClientDashboard />
        </div>
    )
}