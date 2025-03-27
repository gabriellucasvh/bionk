import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"
import Image from "next/image"

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params // Aguarda o objeto params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.profileUrl && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-gray-200">
              <Image src={user.profileUrl || "/placeholder.svg"} alt={user.name || username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{user.name || username}</h1>
          {user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center font-medium border border-gray-100"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-center text-sm text-gray-500">
          <div className="text-xl flex items-center justify-center">
            <Link href="/" className=""><Image src="/bionk-logo.svg" alt="Bionk Logo" width={70} height={70} className="inline mb-1"/>
            </Link>
          </div>
          <p>
            © {new Date().getFullYear()} • {username}
          </p>
        </footer>
      </main>
    </div>
  )
}

