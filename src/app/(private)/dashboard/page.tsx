import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
export default async function dashboard() {

    const session = await getServerSession()

    if(!session) {
        return redirect('/')
    }
    return(
        <div>oi</div>
    )
}