import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"
import { MotionDiv, MotionH1, MotionLi, MotionP } from "@/components/ui/motion"
import { TemplateComponentProps } from "@/types/user-profile"

export default function GalleryTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-neutral-900 text-white py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-xl mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-12">
          {user.image && (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-neutral-700 shadow-xl"
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
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-semibold tracking-tight text-white"
          >
            {user.name || user.username}
          </MotionH1>

          {user.bio && (
            <MotionP
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mt-2 text-sm text-neutral-400 max-w-sm mx-auto"
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
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="w-full"
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="group w-full block px-5 py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
                >
                  <span className="font-medium text-white group-hover:text-teal-400">{link.title}</span>
                  <span className="block text-xs text-neutral-400 mt-1 group-hover:text-teal-300">{link.url}</span>
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-16 text-center">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="inline-block px-5 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-sm text-neutral-300"
          >
            📸 @{user.username}
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
