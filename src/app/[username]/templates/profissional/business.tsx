import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";
import JoinBionkModal from "@/components/JoinBionkModal";

export default function BusinessTemplate({ user }: TemplateComponentProps) {

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
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4 text-gray-900">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-blue-300 shadow-lg">
              <Image src={user.image} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-blue-900 tracking-wide">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-blue-800 text-sm">
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
                    className="text-blue-700 hover:text-blue-900 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
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
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-white rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-blue-900">{link.title}</span>
                  <span className="block text-sm text-blue-600">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-blue-800 text-sm font-bold border-t border-blue-800 pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  );
}
