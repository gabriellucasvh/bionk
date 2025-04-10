import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";
import JoinBionkModal from "@/components/JoinBionkModal";

export default function VintageTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 to-rose-300 py-8 px-4 text-amber-900 font-serif">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-amber-600 shadow-xl">
              <Image 
                src={user.image} 
                alt={user.name || user.username || "User profile"} // Correção aqui
                fill 
                className="object-cover sepia" 
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-amber-900 tracking-wide drop-shadow-md">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-amber-800 text-sm italic max-w-sm mx-auto leading-relaxed">
              {user.bio}
            </p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink
                  href={link.url}
                  linkId={link.id}
                  sensitive={link.sensitive}
                  className="block w-full p-4 bg-amber-100 rounded-lg border border-amber-600 shadow-md hover:shadow-lg hover:bg-amber-200 transition-all transform hover:-translate-y-1"
                >
                  <span className="font-bold text-amber-900">{link.title}</span>
                  <span className="block text-sm text-amber-700">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-10 text-amber-800 text-sm font-bold border-t border-amber-600 pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
        </footer>
      </main>
    </div>
  );
}