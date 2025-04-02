// app/[username]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import InteractiveLink from "@/components/InteractiveLink";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      {/* Registra a visualização do perfil */}
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.profileUrl && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-gray-200">
              <Image
                src={user.profileUrl || "/placeholder.svg"}
                alt={user.name || username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {user.name || username}
          </h1>
          {user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink href={link.url} linkId={link.id}>
                  {link.title}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-center text-sm text-gray-500">
          <div className="text-xl flex items-center justify-center">
            <Link href="/">
              <Image
                src="/bionk-logo.svg"
                alt="Bionk Logo"
                width={70}
                height={70}
                className="inline mb-1"
              />
            </Link>
          </div>
          <p>
            © {new Date().getFullYear()} • {username}
          </p>
        </footer>
      </main>
    </div>
  );
}
