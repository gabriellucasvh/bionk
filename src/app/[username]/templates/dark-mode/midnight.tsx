import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import JoinBionkModal from "@/components/JoinBionkModal"
import { TemplateComponentProps } from "@/types/user-profile"

export default function DefaultTemplate({ user }: TemplateComponentProps) {

  const socialIconMap: { [key: string]: string } = {
    instagram: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/instagram-branco",
    twitter: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/x-branco",
    linkedin: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/linkedin", 
    github: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/github-branco",
    facebook: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/facebook", 
    tiktok: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665281/bionk/icons/tiktok.svg", 
    youtube: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665282/bionk/icons/youtube.svg", 
    twitch: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665281/bionk/icons/twitch.svg", 
    discord: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746665283/bionk/icons/discord.svg", 
    soundcloud: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/soundcloud-logo-branco",
    patreon: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/patreon-branco",
    website: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/globe", 
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] py-10 px-4 text-white">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border border-indigo-500 shadow-md">
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-indigo-200">{user.bio}</p>}
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
                    className="text-indigo-300 hover:text-indigo-100 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
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
                  className="block w-full p-4  bg-[#1e1b3a] hover:bg-[#2a2650] border border-indigo-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="font-semibold text-white">{link.title}</span>
                  <span className="block text-sm text-indigo-300">{link.url}</span>
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
