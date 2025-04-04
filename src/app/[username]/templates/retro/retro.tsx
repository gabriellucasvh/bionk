import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";

export default function RetroTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 to-orange-500 py-8 px-4 text-brown-900 font-retro">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-brown-700 shadow-lg">
              <Image src={user.image} alt={user.name} fill className="object-cover sepia" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-brown-900 tracking-wide drop-shadow-lg">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-brown-800 text-sm italic">
              {user.bio}
            </p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link: any) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-yellow-200 rounded-lg border border-brown-700 shadow-md hover:shadow-lg hover:bg-yellow-300 transition-all transform hover:-translate-y-1"
                >
                  <span className="font-bold text-brown-900">{link.title}</span>
                  <span className="block text-sm text-brown-700">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-brown-800 text-sm font-bold border-t border-brown-700 pt-4 w-full text-center">
          <span>{user.username}</span>
        </footer>
      </main>
    </div>
  );
}
