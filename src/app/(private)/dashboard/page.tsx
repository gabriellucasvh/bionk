import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
    const session = await getServerSession()

    // Simula um pequeno delay para garantir que a sessão foi carregada
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!session) {
        redirect('/')
    }

    redirect('/dashboard/perfil')
}
