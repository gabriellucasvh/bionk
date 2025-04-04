'use client'

import Image from "next/image"
import { motion } from "framer-motion"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"

export default function ElegantTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] text-neutral-800 py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mx-auto mb-6 relative w-28 h-28 overflow-hidden rounded-full border-4 border-neutral-300 shadow-[0_5px_30px_rgba(0,0,0,0.1)] bg-white"
            >
              <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
            </motion.div>
          )}
          <motion.h1
            className="text-3xl font-serif font-semibold text-neutral-900"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            {user.name || user.username}
          </motion.h1>
          {user.bio && (
            <motion.p
              className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {user.bio}
            </motion.p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link: any, i: number) => (
              <motion.li
                key={link.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-300 shadow-sm transition-all duration-300"
                >
                  <span className="font-medium text-neutral-800">{link.title}</span>
                  <span className="block text-xs text-neutral-500 mt-1">{link.url}</span>
                </InteractiveLink>
              </motion.li>
            ))}
          </ul>
        </section>

        <footer className="mt-14 text-center w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-block px-6 py-2 border border-neutral-300 text-neutral-700 bg-white/70 backdrop-blur-md rounded-md font-serif text-sm shadow-md"
          >
            — {user.username} —
          </motion.div>
        </footer>
      </main>
    </div>
  )
}
