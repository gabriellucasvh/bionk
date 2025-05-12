import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 font-mono flex flex-col">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center w-full flex-grow">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden border-2 border-[#ff00f7] shadow-[0_0_10px_#ff00f777]">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#00fff7] uppercase tracking-widest">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-[#ff00f7] text-sm">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-4 flex justify-center items-center space-x-3 sm:space-x-4">
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
                  className="block w-full p-4 bg-[#111] hover:bg-[#1e1e1e] border border-[#00fff7] text-[#00fff7] shadow-[0_0_10px_#00fff733] transition duration-300 font-semibold"
                >
                  <span className="text-base">{link.title}</span>
                  <span className="block text-xs text-[#ff00f7]">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

      </main>
      <footer className="max-w-md mx-auto mt-10 text-[#ff00f7] text-sm font-bold border-t border-[#ff00f7] pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
      </footer>
    </div>
  )
}
