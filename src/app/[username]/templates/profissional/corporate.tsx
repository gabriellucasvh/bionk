import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";

export default function CorporateTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-8 px-4 text-gray-900">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-gray-400 shadow-md">
              <Image src={user.image} alt={user.name} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-gray-900 tracking-wide">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-gray-700 text-sm">
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
                  className="block w-full p-4 bg-white rounded-lg border border-gray-400 shadow-sm hover:shadow-md transition-shadow hover:bg-gray-200"
                >
                  <span className="font-medium text-gray-900">{link.title}</span>
                  <span className="block text-sm text-gray-600">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-gray-700 text-sm font-medium border-t border-gray-400 pt-4 w-full text-center">
          <span>{user.username}</span>
        </footer>
      </main>
    </div>
  );
}