import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { TemplateComponentProps } from "@/types/user-profile";
import JoinBionkModal from "@/components/JoinBionkModal";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";

export default function BusinessTemplate({ user }: TemplateComponentProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4 text-gray-900 flex flex-col">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center w-full flex-grow">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full border-4 border-blue-300 shadow-lg">
              <Image src={user.image} alt={user.name || user.username} fill className="object-cover" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-blue-900 tracking-wide">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 text-blue-800 text-sm">
              {user.bio}
            </p>
          )}
          {user.SocialLink && user.SocialLink.length > 0 && (
            <div className="mt-4 flex justify-center items-center space-x-3 sm:space-x-4">
              {user.SocialLink && user.SocialLink.length > 0 && (
                <div className="mt-4 flex justify-center items-center">
                  <UserProfileSocialIcons socialLinks={user.SocialLink} iconSize={22} className="space-x-3 sm:space-x-4" />
                </div>
              )}
            </div>
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
                  className="block w-full p-4 bg-white rounded-lg border border-blue-300 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="font-medium text-blue-900">{link.title}</span>
                  <span className="block text-sm text-blue-600">{link.url}</span>
                </InteractiveLink>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <footer className="max-w-md mx-auto mt-10 text-blue-800 text-sm font-bold border-t border-blue-800 pt-4 w-full text-center">
        <JoinBionkModal>{user.username}</JoinBionkModal>
      </footer>
    </div>
  );
}
