import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/ui/motion"
import { TemplateComponentProps } from "@/types/user-profile"
import JoinBionkModal from "@/components/JoinBionkModal"

export default function CleanTemplate({ user }: TemplateComponentProps) {

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
    website: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/globe",
    soundcloud: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/soundcloud-logo-preto",
    patreon: "https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/patreon-preto",
  };
  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-6 flex justify-center">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md w-full flex flex-col items-center">
        <header className="w-full flex flex-col items-center text-center mb-10">
          {user.image && (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-28 h-28 rounded-full overflow-hidden border border-gray-300 shadow-md"
            >
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </MotionDiv>
          )}
          <MotionH1
            className="text-3xl font-semibold mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-2 text-gray-500 max-w-sm mx-auto text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              {user.bio}
            </MotionP>
          )}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <MotionDiv 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex justify-center items-center space-x-4">
              {user.SocialLink.map((social) => {
                const iconPath = socialIconMap[social.platform.toLowerCase()];
                return iconPath ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
                    aria-label={social.platform}
                    title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <Image src={iconPath} alt={social.platform} width={22} height={22} />
                  </a>
                ) : null;
              })}
            </MotionDiv>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link, i) => (
              <MotionLi
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full max-w-md p-4 bg-gray-100 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <span className="font-medium text-gray-900">{link.title}</span>
                  <span className="block text-sm text-gray-500">{link.url}</span>
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-black text-sm font-bold border-t pt-4 w-full text-center">
          <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  )
}
