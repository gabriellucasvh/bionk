import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";
import JoinBionkModal from "@/components/JoinBionkModal";

export default function CorporateTemplate({ user }: TemplateComponentProps) {

  const socialIconMap: { [key: string]: string } = {
    instagram: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/instagram-preto",
    twitter: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/x-preto",
    linkedin: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/linkedin", 
    github: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/github-preto",
    facebook: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/facebook", 
    tiktok: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665281/bionk/icons/tiktok.svg", 
    youtube: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665282/bionk/icons/youtube.svg", 
    twitch: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665281/bionk/icons/twitch.svg", 
    discord: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665283/bionk/icons/discord.svg", 
    soundcloud: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/soundcloud-logo-preto",
    patreon: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/patreon-preto",
    website: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/globe", 
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-8 px-4 text-gray-900">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-gray-400 shadow-md">
              <Image src={user.image} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-gray-700 text-sm">
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
                    className="text-gray-600 hover:text-gray-800 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
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
                  className="block w-full p-4 bg-white rounded-lg border border-gray-400 shadow-sm hover:shadow-md transition-shadow hover:bg-gray-200"
                >
                  <span className="font-medium text-gray-900">{link.title}</span>
                  <span className="block text-sm text-gray-600">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-black text-sm font-bold border-t border-black pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  );
}