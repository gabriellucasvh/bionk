import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { MotionDiv, MotionH1, MotionLi, MotionP, MotionSpan } from "@/components/ui/motion";

export default function ModernTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white py-12 px-6 flex justify-center">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-lg w-full flex flex-col items-center">
        <header className="w-full text-center mb-12 flex flex-col items-center">
          {user.image && (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-700 shadow-lg bg-gray-700 hover:shadow-2xl transition-shadow duration-500"
            >
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </MotionDiv>
          )}
          <MotionH1
            className="text-4xl font-extrabold mt-4 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {user.name || user.username}
          </MotionH1>
          {user.bio && (
            <MotionP
              className="mt-2 text-gray-300 max-w-sm mx-auto text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {user.bio}
            </MotionP>
          )}
        </header>

        <section className="w-full">
          <ul className="grid gap-4">
            {user.Link.map((link: any, i: number) => (
              <MotionLi
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex justify-center"
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="group block w-full max-w-md p-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                >
                  <MotionSpan
                    initial={{ letterSpacing: "0px" }}
                    whileHover={{ letterSpacing: "1px" }}
                    transition={{ duration: 0.3 }}
                    className="relative font-semibold text-lg text-white block transition-all"
                  >
                    {link.title}
                  </MotionSpan>
                  <span className="relative block text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                    {link.url}
                  </span>
                  <MotionDiv
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  />
                </InteractiveLink>
              </MotionLi>
            ))}
          </ul>
        </section>

        <footer className="mt-16 flex justify-center">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="inline-block px-8 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
          >
            ⚡ {user.username} ⚡ 
          </MotionDiv>
        </footer>
      </main>
    </div>
  )
}
