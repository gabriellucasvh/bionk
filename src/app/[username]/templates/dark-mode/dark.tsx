import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"

export default function DarkTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-black py-8 px-4">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none"></div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center relative z-10">
        <header className="w-full flex flex-col items-center text-center mb-10">
          {user.image && (
            <div className="mb-6 relative group flex justify-center">
              <div className="relative w-24 h-24 overflow-hidden rounded-full border border-gray-800 group-hover:border-gray-700 transition-colors duration-300">
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <h1 className="text-2xl font-medium text-white tracking-tight">{user.name || user.username}</h1>

          {user.bio && <p className="mt-3 text-gray-400 max-w-xs mx-auto leading-relaxed text-sm">{user.bio}</p>}

        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link: any) => (
              <li key={link.id} className="w-full group">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-gray-900 rounded-md border border-gray-800 group-hover:border-gray-700 transition-all duration-300 group-hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium text-black group-hover:text-white transition-colors duration-300">
                        {link.title}
                      </span>
                      <span className="block text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        {link.url}
                      </span>
                    </div>
                    
                  </div>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-center">
          <div className="inline-flex items-center space-x-1.5 text-xs text-gray-600 py-2 px-3 rounded-full bg-gray-900 border border-gray-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
            <span>{user.username}</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

