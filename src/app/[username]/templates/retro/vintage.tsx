import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";
import JoinBionkModal from "@/components/JoinBionkModal";

export default function VintageTemplate({ user }: TemplateComponentProps) {
  // O usuário irá atualizar estes caminhos para os SVGs corretos em /public/icons/
  const socialIconMap: { [key: string]: string } = {
    instagram: "/icons/instagram.svg",
    twitter: "/icons/x.svg",
    linkedin: "/icons/linkedin.svg",
    github: "/icons/github-preto.svg", // Usar github.svg (escuro) para melhor contraste com fundo claro
    facebook: "/icons/facebook.svg",
    tiktok: "/icons/tiktok.svg",
    youtube: "/icons/youtube.svg",
    twitch: "/icons/twitch.svg",
    discord: "/icons/discord.svg",
    website: "/icons/link.svg", // Ícone genérico para website
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 to-rose-300 py-8 px-4 text-amber-900 font-serif">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-amber-600 shadow-xl">
              <Image 
                src={user.image} 
                alt={user.name || user.username || "User profile"} // Correção aqui
                fill 
                className="object-cover sepia" 
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-amber-900 tracking-wide drop-shadow-md">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-amber-800 text-sm italic max-w-sm mx-auto leading-relaxed">
              {user.bio}
            </p>
          )}
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
                    className="text-amber-700 hover:text-amber-900 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
                    aria-label={social.platform}
                    title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <Image src={iconPath} alt={social.platform} width={22} height={22} className="sepia-[0.2]" />
                  </a>
                ) : null;
              })}
            </div>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-amber-100 rounded-lg border border-amber-600 shadow-md hover:shadow-lg hover:bg-amber-200 transition-all transform hover:-translate-y-1"
                >
                  <span className="font-bold text-amber-900">{link.title}</span>
                  <span className="block text-sm text-amber-700">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-amber-800 text-sm font-bold border-t border-amber-600 pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  );
}