import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP, MotionSpan } from "@/components/ui/motion"
import { TemplateComponentProps } from "@/types/user-profile"

export default function PhotographyTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto mb-6 relative w-36 h-36 overflow-hidden rounded-full border-4 border-gray-400 shadow-lg"
            >
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name || user.username}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </MotionDiv>
          )}
          <MotionH1
            className="text-3xl font-extrabold text-white tracking-wide"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-2 text-gray-300 max-w-sm mx-auto leading-relaxed"
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
            {user.Link.map((link, i) => (
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
                  className="group relative block w-full p-4 bg-gray-900 bg-opacity-90 rounded-lg border border-gray-500 shadow-md overflow-hidden"
                >
                  <MotionDiv
                    className="absolute inset-0 bg-gradient-to-r from-gray-700 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  />
                  <MotionSpan
                    initial={{ letterSpacing: "0px" }}
                    whileHover={{ letterSpacing: "2px" }}
                    transition={{ duration: 0.3 }}
                    className="relative font-bold text-gray-600 block transition-all"
                  >
                    {link.title}
                  </MotionSpan>
                  <span className="relative block text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                    {link.url}
                  </span>
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
            className="inline-block px-6 py-2 bg-gray-900 bg-opacity-80 text-white border border-gray-500 rounded-full shadow-md hover:scale-105 transition-transform duration-300"
          >
            📷 - {user.username}
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
