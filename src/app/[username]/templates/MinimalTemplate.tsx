export default function MinimalTemplate({ user }: { user: any }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
        {user.bio && <p className="mt-2 text-gray-400">{user.bio}</p>}
        <ul className="mt-6 space-y-2">
          {user.Link.map((link: any) => (
            <li key={link.id}>
              <a href={link.url} className="text-blue-400 underline">{link.title}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  