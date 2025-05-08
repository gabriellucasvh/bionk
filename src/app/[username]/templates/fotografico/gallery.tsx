import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"

export default function DefaultTemplate({ user }: TemplateComponentProps) {

  const socialIconMap: { [key: string]: string } = {
    instagram: "/icons/instagram-preto.svg",
    twitter: "/icons/x-preto.svg",
    linkedin: "/icons/linkedin.svg",
    github: "/icons/github-preto.svg",
    facebook: "/icons/facebook.svg",
    tiktok: "/icons/tiktok.svg",
    youtube: "/icons/youtube.svg",
    twitch: "/icons/twitch.svg",
    discord: "/icons/discord.svg",
    website: "/icons/link.svg",
    soundcloud: "/icons/soundcloud-preto.svg",
    patreon: "/icons/patreon-preto.svg",
  };
  return (
    <div className="min-h-screen bg-[#f9f9f7] text-neutral-900 py-12 px-4 font-sans">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-6 relative w-28 h-28 border-[6px] border-white shadow-lg">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-neutral-600">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              {user.SocialLink.map((social) => {
                const iconPath = socialIconMap[social.platform.toLowerCase()];
                return iconPath ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
                    aria-label={social.platform}
                    title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <Image src={iconPath} alt={social.platform} width={22} height={22} />
                  </a>
                ) : null;
              })}
            </div>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-5 bg-white border border-neutral-300 shadow-sm hover:shadow-md transition duration-200"
                >
                  <span className="text-base font-semibold">{link.title}</span>
                  <span className="block text-sm text-neutral-500">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-neutral-600 text-sm font-bold border-t border-neutral-300 pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
