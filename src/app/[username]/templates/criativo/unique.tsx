import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { TemplateComponentProps } from "@/types/user-profile"

export default function UniqueTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-[#0f172a] py-8 px-4 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background: `radial-gradient(circle, rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},0.8) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 1 + 0.5})`,
              filter: "blur(40px)",
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center relative z-10">
        <header className="w-full text-center mb-12 relative">
          {/* Decorative frame */}
          <div className="absolute -inset-4 border-2 border-dashed border-[#64ffda] rounded-xl opacity-30 rotate-3"></div>

          {user.image && (
            <div className="mx-auto mb-6 relative group">
              <div className="absolute inset-0 bg-[#64ffda] rounded-lg blur-md group-hover:blur-xl transition-all duration-700"></div>
              <div className="absolute inset-0 bg-[#0f172a] rounded-lg transform rotate-45 scale-75 group-hover:rotate-[135deg] transition-all duration-700"></div>
              <div className="relative w-28 h-28 rounded-lg overflow-hidden transform -rotate-6 group-hover:rotate-6 transition-all duration-700">
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name || user.username}
                  fill
                  className="object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              <span className="relative">
                {user.name || user.username}
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#64ffda] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              </span>
            </h1>

            {user.bio && <p className="mt-3 text-[#94a3b8] max-w-xs mx-auto leading-relaxed">{user.bio}</p>}
          </div>
        </header>

        <section className="w-full perspective-[1000px]">
          <ul className="space-y-5">
            {user.Link.map((link, index) => (
              <li
                key={link.id}
                className="w-full transform-gpu hover:translate-z-0 transition-all duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `translateZ(${-index * 5}px) rotateX(${index % 2 === 0 ? 2 : -2}deg)`,
                }}
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block group w-full p-4 bg-[#1e293b] border-l-4 border-[#64ffda] rounded-r-lg backdrop-blur-sm hover:bg-[#334155] transition-all duration-300 hover:translate-x-2 hover:shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#64ffda] mr-3"></div>
                    <div>
                      <span className="font-medium text-neutral-300 group-hover:text-white">{link.title}</span>
                      <span className="block text-sm text-[#94a3b8]">{link.url}</span>
                    </div>
                  </div>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 relative">
          <div className="py-2 px-4 bg-[#1e293b] rounded-full border border-[#64ffda] border-opacity-30 text-[#64ffda] text-sm font-mono tracking-wider transform hover:scale-105 transition-transform duration-300">
            <span className="animate-pulse">◉</span> {user.username}
          </div>
        </footer>
      </main>
    </div>
  )
}

