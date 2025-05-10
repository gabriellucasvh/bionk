import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-10 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-3xl border-4 border-[#e94560] shadow-[0_0_15px_#e9456055] hover:scale-105 transition-transform duration-300">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-[#e94560] tracking-tight">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-[#ffd460] text-base">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-4 flex justify-center items-center">
              <UserProfileSocialIcons socialLinks={user.SocialLink} iconSize={22} className="space-x-3 sm:space-x-4" />
            </div>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-5">
            {user.Link.map((link) => (
              <li key={link.id}>
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-[#53354a] hover:bg-[#903749] border border-[#e94560] transition-all duration-200 shadow-md hover:shadow-xl"
                >
                  <span className="font-semibold text-white text-lg">{link.title}</span>
                  <span className="block text-sm text-[#ffd460]">{link.url}</span>
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
