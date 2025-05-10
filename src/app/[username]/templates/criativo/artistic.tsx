import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"
import JoinBionkModal from "@/components/JoinBionkModal"

export default function ArtisticTemplate({ user }: TemplateComponentProps) {

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
    <div className="min-h-screen bg-[#f5f0e8] py-8 px-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzAgMEMxMy40IDAgMCAxMy40IDAgMzBzMTMuNCAzMCAzMCAzMCA0My40LTEzLjQgNDMuNC0zMFM0Ni42IDAgMzAgMHptMCA1MmMtMTIuMiAwLTIyLTkuOC0yMi0yMnM5LjgtMjIgMjItMjIgMjIgOS44IDIyIDIyLTkuOCAyMi0yMiAyMnoiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')]">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-6 relative">
              <div className="absolute -inset-1.5 bg-[#e8c8a9] rounded-full rotate-3"></div>
              <div className="absolute -inset-1.5 bg-[#c8a080] rounded-full -rotate-3"></div>
              <div className="relative w-28 h-28 overflow-hidden rounded-full border-4 border-[#f5f0e8]">
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || user.username}
                  fill
                  className="object-cover sepia-[0.2]"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#e8c8a9] rounded-full flex items-center justify-center rotate-12 text-[#6d4c41] text-xs font-serif">
                Art
              </div>
            </div>
          )}
          <h1 className="text-2xl font-serif italic text-[#6d4c41]">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-[#8d6e63] font-serif max-w-xs mx-auto leading-relaxed">{user.bio}</p>}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-6 flex justify-center items-center space-x-3 sm:space-x-4">
              {user.SocialLink.map((social) => {
                const iconPath = socialIconMap[social.platform.toLowerCase()];
                return iconPath ? (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6d4c41] hover:text-[#4b322a] transition-colors duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center"
                    aria-label={social.platform}
                    title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <Image src={iconPath} alt={social.platform} width={22} height={22} className="filter sepia-[0.1]" />
                  </a>
                ) : null;
              })}
            </div>
          )}
          <div className="mt-4 flex justify-center space-x-2">
            <span className="w-16 h-0.5 bg-[#c8a080]"></span>
            <span className="w-2 h-0.5 bg-[#c8a080]"></span>
            <span className="w-6 h-0.5 bg-[#c8a080]"></span>
          </div>
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link, index) => (
              <li key={link.id} className="w-full group">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-[#d7bea8] rounded-lg ${index % 2 === 0 ? "rotate-1" : "-rotate-1"} transform-gpu transition-transform group-hover:scale-105 duration-300`}
                  ></div>
                  <InteractiveLink
                    href={link.url}
                    linkId={link.id}
                    sensitive={link.sensitive}
                    className="relative block w-full p-4 bg-[#f5f0e8] rounded-lg border border-[#d7bea8] transform-gpu transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300"
                  >
                    <span className="font-serif text-[#6d4c41] font-medium">{link.title}</span>
                    <span className="block text-sm text-[#8d6e63] font-serif">{link.url}</span>
                  </InteractiveLink>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 relative">
          <div className="absolute -inset-x-4 -top-6 h-0.5 w-full max-w-xs mx-auto">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-0.5 bg-[#c8a080]"
                style={{
                  left: `${i * 12.5}%`,
                  width: "8%",
                  opacity: 0.6 + (i % 3) * 0.2,
                }}
              ></div>
            ))}
          </div>
          <div className="font-serif text-[#8d6e63] text-sm italic">
          <JoinBionkModal>{user.username}</JoinBionkModal>
          </div>
        </footer>
      </main>
    </div>
  )
}

