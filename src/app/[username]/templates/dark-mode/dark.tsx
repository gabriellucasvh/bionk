import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"
import JoinBionkModal from "@/components/JoinBionkModal"

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
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
          <h1 className="text-2xl font-bold text-white">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-neutral-400">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link) => (
              <li key={link.id}>
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors duration-200 shadow-sm hover:shadow-lg"
                >
                  <span className="font-semibold text-white">{link.title}</span>
                  <span className="block text-sm text-neutral-400">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
        <footer className="mt-10 text-white text-sm font-bold border-t border-white pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
