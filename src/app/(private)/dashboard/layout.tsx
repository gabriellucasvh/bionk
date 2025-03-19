// app/(private)/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth'; // ou sua implementação de autenticação
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const session = await getServerSession();

    if (!session) {
        // Redireciona para login se o usuário não estiver autenticado
        redirect('/login');
    }

    return (
        <section>
            <main >
                {children}
            </main>
        </section>
    );
}
