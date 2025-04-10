import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"
import JoinBionkModal from "@/components/JoinBionkModal"

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 py-8 px-4 text-white">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border border-neutral-700 shadow-md">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-neutral-100">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-neutral-400">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-3 bg-neutral-800/70 backdrop-blur-sm rounded-lg border border-neutral-700 shadow hover:shadow-lg hover:bg-neutral-800 transition-all duration-200"
                >
                  <span className="font-medium text-neutral-100">{link.title}</span>
                  <span className="block text-sm text-neutral-400">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
        <footer className="mt-10 text-green-800 text-sm font-bold border-t border-green-600 pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
