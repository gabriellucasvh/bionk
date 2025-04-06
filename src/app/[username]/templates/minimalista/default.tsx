import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";

export default function DefaultTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 border-gray-200">
              <Image src={user.image} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{user.name || user.username}</h1>
          {user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}
        </header>

        <section className="w-full">
          <ul className="space-y-3">
            {user.Link.map((link) => (
              <li key={link.id} className="w-full">
                <InteractiveLink href={link.url} linkId={link.id} sensitive={link.sensitive}>
                  {link.title}
                  <span className="block text-sm text-gray-500">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
