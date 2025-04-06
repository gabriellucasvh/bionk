import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/ui/motion"
import { TemplateComponentProps } from "@/types/user-profile"

export default function CleanTemplate({ user }: TemplateComponentProps) {
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

        <footer className="mt-12">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm"
          >
            {user.username}
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
