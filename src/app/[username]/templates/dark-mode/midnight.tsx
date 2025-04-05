import Image from "next/image"
import { MotionH1, MotionP, MotionDiv, MotionLi } from "@/components/ui/motion"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"

export default function MidnightTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a23] via-[#1a1a40] to-[#0f0f2d] py-10 px-4 text-white relative overflow-hidden">
      <ProfileViewTracker userId={user.id} />

      {/* Luzes suaves e fundo embaçado */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[90px]" />
        <div className="absolute bottom-[5%] right-[5%] w-80 h-80 bg-purple-700/20 rounded-full blur-[100px]" />
      </div>

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <MotionDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="mx-auto mb-6 relative w-28 h-28 overflow-hidden rounded-full border-4 border-white/10 shadow-xl backdrop-blur-md bg-white/5"
            >
              <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
            </MotionDiv>
          )}
          <MotionH1
            className="text-3xl font-semibold text-violet-100 tracking-wide"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-3 text-sm text-purple-300 max-w-sm mx-auto bg-white/5 backdrop-blur-sm rounded-md px-3 py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {user.bio}
            </MotionP>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link: any, i: number) => (
              <MotionLi
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block group w-full p-4 bg-[#1f1f3a] hover:bg-[#2a2a4c] rounded-xl border border-white/10 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  <span className="font-medium text-gray-600 group-hover:text-purple-500">{link.title}</span>
                  <span className="block text-xs text-purple-200 mt-1">{link.url}</span>
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-14 w-full text-center">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-flex items-center justify-center gap-2 text-purple-300 text-sm bg-[#2d2d50]/50 px-5 py-2 rounded-lg shadow-inner border border-white/10 backdrop-blur-sm"
          >
            <span className="animate-pulse text-violet-400">•</span>
            <span className="tracking-wide">{user.username}</span>
            <span className="animate-pulse text-violet-400">•</span>
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
