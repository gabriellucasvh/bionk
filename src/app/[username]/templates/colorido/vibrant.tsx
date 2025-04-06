import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"

export default function VibrantTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-600 via-violet-600 to-blue-600 py-8 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:shadow-[0_0_25px_rgba(250,204,21,0.7)] transition-all duration-300">
              <Image src={user.image || "/placeholder.svg"} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-yellow-200 drop-shadow-sm">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full transform transition-transform hover:scale-[1.02] hover:-rotate-1">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg border-2 border-cyan-300 shadow-[0_4px_0_rgb(34,211,238)] hover:shadow-[0_6px_0_rgb(34,211,238)] active:shadow-[0_2px_0_rgb(34,211,238)] active:translate-y-1 transition-all"
                >
                  <span className="font-bold text-white">{link.title}</span>
                  <span className="block text-sm text-cyan-100">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10">
          <div className="animate-pulse inline-block px-4 py-2 bg-fuchsia-500 rounded-full text-white font-medium shadow-lg">
            ✨ {user.username} ✨
          </div>
        </footer>
      </main>
    </div>
  )
}

