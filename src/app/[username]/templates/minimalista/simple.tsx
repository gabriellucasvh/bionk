import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-50 py-8 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-green-200 shadow-md transform hover:scale-105 transition-transform duration-300">
              <Image src={user.image || "/placeholder.svg"} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-green-800">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-green-600">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-3 bg-white bg-opacity-70 backdrop-blur-sm rounded-lg border border-green-100 shadow-sm hover:shadow-md hover:bg-opacity-90 transition-all duration-200"
                >
                  <span className="font-medium text-green-700">{link.title}</span>
                  <span className="block text-sm text-green-500">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

