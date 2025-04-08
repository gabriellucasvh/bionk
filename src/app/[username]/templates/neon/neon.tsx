import Image from 'next/image'
import InteractiveLink from '@/components/InteractiveLink'
import ProfileViewTracker from '@/components/ProfileViewTracker'
import { TemplateComponentProps } from '@/types/user-profile'

export default function NeonTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-800 to-pink-900 py-8 px-4 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,0,255,0.2)_0%,rgba(0,0,0,0)_80%)] pointer-events-none"></div>
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,1)] hover:shadow-[0_0_40px_rgba(59,130,246,1)] transition-all duration-300">
              <Image
                src={user.image}
                alt={user.name || user.username}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-gray-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              {user.bio}
            </p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map(link => (
              <li
                key={link.id}
                className="w-full transform transition-transform hover:scale-110 hover:rotate-1"
              >
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-transparent rounded-lg border-2 border-pink-400 shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:shadow-[0_0_25px_rgba(255,0,255,1)] active:translate-y-1 transition-all relative overflow-hidden"
                >
                  <span className="font-bold text-white text-lg drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                    {link.title}
                  </span>
                  <span className="block text-sm text-gray-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    {link.url}
                  </span>
                  <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none"></div>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10">
          <div className="animate-pulse inline-block px-2 py-1  bg-pink-500 rounded-full text-white  shadow-lg shadow-pink-400 drop-shadow-[0_0_20px_rgba(255,0,255,1)]">
            ⚡ {user.username} ⚡
          </div>
        </footer>
      </main>
    </div>
  )
}
