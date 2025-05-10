import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 py-10 px-4 font-sans">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover grayscale hover:grayscale-0 transition duration-500"
              />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-white">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-neutral-400 text-sm">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              {user.SocialLink && user.SocialLink.length > 0 && (
                <div className="mt-4 flex justify-center items-center">
                  <UserProfileSocialIcons socialLinks={user.SocialLink} iconSize={22} className="space-x-3 sm:space-x-4" theme="dark" />
                </div>
              )}
            </div>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link) => (
              <li key={link.id}>
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-md transition-all duration-200"
                >
                  <span className="text-base font-medium">{link.title}</span>
                  <span className="block text-xs text-neutral-300">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-neutral-400 text-sm font-bold border-t border-white pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
