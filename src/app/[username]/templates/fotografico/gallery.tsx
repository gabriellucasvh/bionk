import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/ui/motion"

export default function GalleryTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-300 via-purple-200 to-pink-300 text-gray-900 py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto mb-6 relative w-32 h-32 overflow-hidden rounded-full border-4 border-white shadow-lg"
            >
              <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
            </MotionDiv>
          )}
          <MotionH1
            className="text-3xl font-extrabold text-gray-800"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-2 text-gray-700 max-w-sm mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1 }}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-full"
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-white bg-opacity-90 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <span className="font-bold text-gray-800">{link.title}</span>
                  <span className="block text-sm text-gray-600">{link.url}</span>
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-12 text-center">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-block px-6 py-2 bg-white bg-opacity-80 text-gray-800 border border-gray-300 rounded-full shadow-md"
          >
            📸 Galeria de {user.username}
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
