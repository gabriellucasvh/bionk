import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/ui/motion"
import { TemplateComponentProps } from "@/types/user-profile"
import JoinBionkModal from "@/components/JoinBionkModal"

export default function LuxuryTemplate({ user }: TemplateComponentProps) {

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-[#f5f3ef] py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <MotionDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="mx-auto mb-6 relative w-28 h-28 overflow-hidden rounded-full border-[3px] border-[#d4af37] shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              <Image src={user.image || "/placeholder.svg"} alt={user.name || user.username} fill className="object-cover" />
            </MotionDiv>
          )}
          <MotionH1
            className="text-3xl font-semibold tracking-wide text-[#f5f3ef] drop-shadow-md"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-2 text-sm text-[#e0d8cb] max-w-sm mx-auto italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1 }}
            >
              {user.bio}
            </MotionP>
          )}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <MotionDiv 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 flex justify-center items-center space-x-4">
              {user.SocialLink.map((social) => {
                const iconPath = socialIconMap[social.platform.toLowerCase()];
                return iconPath ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d4af37] hover:text-[#f5f3ef] transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
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
          <ul className="space-y-4">
            {user.Link.map((link, i) => (
              <MotionLi
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 rounded-xl border border-[#d4af37]/30 shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-transform duration-300 backdrop-blur-sm"
                >
                  <span className="font-semibold text-yellow-500">{link.title}</span>
                  <span className="block text-xs text-[#ccc6bc] mt-1">{link.url}</span>
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-14 text-center w-full inline-block px-6 py-2 border border-[#d4af37] text-[#f5f3ef] bg-[#d4af37]/10 backdrop-blur-xl rounded-lg font-medium tracking-wide shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >✨
            <JoinBionkModal>
              {user.username}
            </JoinBionkModal>
            ✨ </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
