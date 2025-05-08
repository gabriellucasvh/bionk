import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  // O usuário irá atualizar estes caminhos para os SVGs corretos em /public/icons/
  const socialIconMap: { [key: string]: string } = {
    instagram: "/icons/instagram.svg",
    twitter: "/icons/x.svg",
    linkedin: "/icons/linkedin.svg",
    github: "/icons/github-preto.svg", // Adequado para fundos escuros
    facebook: "/icons/facebook.svg",
    tiktok: "/icons/tiktok.svg",
    youtube: "/icons/youtube.svg",
    twitch: "/icons/twitch.svg",
    discord: "/icons/discord.svg",
    website: "/icons/link.svg", // Ícone genérico para website
  };
  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 font-mono">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
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
              {user.SocialLink.map((social) => {
                const iconPath = socialIconMap[social.platform.toLowerCase()];
                return iconPath ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00fff7] hover:text-[#ff00f7] transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
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

        <footer className="mt-10 text-[#ff00f7] text-sm font-bold border-t border-[#ff00f7] pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
