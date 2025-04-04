import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import ProfileViewTracker from "@/components/ProfileViewTracker";

interface TemplateProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    bio: string | null;
    image: string | null;
    Link: {
      id: number;
      title: string;
      url: string;
      sensitive: boolean;
    }[];
  };
}

export default function MinimalTemplate({ user }: TemplateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 text-gray-800">
      <ProfileViewTracker userId={user.id} />

      <header className="text-center">
        {user.image && (
          <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
            <Image
              src={user.image}
              alt={user.name || user.username}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-xl font-semibold mt-2">{user.name || user.username}</h1>
        {user.bio && <p className="text-gray-500 text-sm mt-1">{user.bio}</p>}
      </header>

      <main className="mt-6 w-full max-w-xs">
        <ul className="space-y-3">
          {user.Link.map((link) => (
            <li key={link.id}>
              <InteractiveLink
                href={link.url}
                linkId={link.id}
                sensitive={link.sensitive}
                className="block w-full py-2 px-4 border rounded-lg text-center font-medium text-gray-700 hover:bg-gray-100"
              >
                {link.title}
              </InteractiveLink>
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-6 text-gray-400 text-xs">
        <p>© {new Date().getFullYear()} • {user.username}</p>
      </footer>
    </div>
  );
}
