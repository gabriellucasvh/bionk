'use client'

import Image from "next/image"
import { motion } from "framer-motion"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"

export default function PhotographyTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white py-12 px-4">
      <ProfileViewTracker userId={user.id} />

      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-10">
          {user.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto mb-6 relative w-36 h-36 overflow-hidden rounded-full border-4 border-gray-400 shadow-lg"
            >
              <Image
                src={user.image || "/placeholder.svg"}
                alt={user.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </motion.div>
          )}
          <motion.h1
            className="text-3xl font-extrabold text-white tracking-wide"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {user.name || user.username}
          </motion.h1>
          {user.bio && (
            <motion.p
              className="mt-2 text-gray-300 max-w-sm mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1 }}
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
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-700 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                  />
                  <motion.span
                    initial={{ letterSpacing: "0px" }}
                    whileHover={{ letterSpacing: "2px" }}
                    transition={{ duration: 0.3 }}
                    className="relative font-bold text-gray-600 block transition-all"
                  >
                    {link.title}
                  </motion.span>
                  <span className="relative block text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                    {link.url}
                  </span>
                </InteractiveLink>
              </motion.li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="inline-block px-6 py-2 bg-gray-900 bg-opacity-80 text-white border border-gray-500 rounded-full shadow-md hover:scale-105 transition-transform duration-300"
          >
            📷 - {user.username}
          </motion.div>
        </footer>
      </main>
    </div>
  )
}
