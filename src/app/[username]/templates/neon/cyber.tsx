import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";

export default function CyberpunkTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-800 to-blue-700 py-8 px-4 text-lime-300">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.8)]">
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-lime-300 tracking-widest drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.7)]">
              {user.bio}
            </p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link: any) => (
              <li key={link.id} className="w-full transform transition-transform hover:scale-105 hover:rotate-1">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg border-2 border-cyan-400 shadow-[0_4px_0_rgb(34,211,238)] hover:shadow-[0_6px_0_rgb(34,211,238)] active:shadow-[0_2px_0_rgb(34,211,238)] active:translate-y-1 transition-all"
                >
                  <span className="font-bold text-gray-900 text-glow">{link.title}</span>
                  <span className="block text-sm text-yellow-300">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10">
          <div className="animate-pulse inline-block px-4 py-2 bg-pink-500 rounded-full text-gray-900 font-medium shadow-[0_0_15px_rgba(219,39,119,0.8)]">
            🌴 {user.username} 🌴
          </div>
        </footer>
      </main>
    </div>
  );
}
