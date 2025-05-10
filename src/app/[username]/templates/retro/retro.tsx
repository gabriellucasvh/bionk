import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-[#f4f1de] text-[#3d405b] py-10 px-4 font-[Courier_New,courier,monospace]">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden border-4 border-[#e07a5f] shadow-[4px_4px_0_#3d405b]">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-[#81b29a]">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-[#3d405b] italic">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-4 flex justify-center items-center space-x-3 sm:space-x-4">
              {user.SocialLink && user.SocialLink.length > 0 && (
                <div className="mt-4 flex justify-center items-center">
                  <UserProfileSocialIcons socialLinks={user.SocialLink} iconSize={22} className="space-x-3 sm:space-x-4" />
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
                  className="block w-full p-4 bg-[#f2cc8f] text-[#3d405b] border-2 border-[#e07a5f] shadow-[4px_4px_0_#3d405b] hover:bg-[#ffe8b6] transition-all duration-200 font-bold"
                >
                  <span className="text-sm uppercase">{link.title}</span>
                  <span className="block text-xs text-[#3d405b] underline">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-[#3d405b] text-sm font-bold border-t border-[#3d405b] pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
