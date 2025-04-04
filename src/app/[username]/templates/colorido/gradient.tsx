import Image from "next/image"
import InteractiveLink from "@/components/InteractiveLink"
import ProfileViewTracker from "@/components/ProfileViewTracker"

export default function GradientTemplate({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-rose-400 to-lime-400 py-8 px-4">
      <ProfileViewTracker userId={user.id} />
      <main className="max-w-md mx-auto flex flex-col items-center backdrop-blur-sm">
        <header className="w-full text-center mb-8">
          {user.image && (
            <div className="mx-auto mb-4 relative w-28 h-28 overflow-hidden rounded-full p-1 bg-gradient-to-r from-amber-400 via-violet-500 to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">
            {user.name || user.username}
          </h1>
          {user.bio && (
            <p className="mt-2 bg-gradient-to-r from-purple-100 to-cyan-400 text-transparent bg-clip-text font-medium">
              {user.bio}
            </p>
          )}
        </header>

        <section className="w-full">
          <ul className="space-y-4">
            {user.Link.map((link: any, index: number) => {
              // Create different gradient directions for each link
              const gradientDirections = [
                "bg-gradient-to-r from-green-300 to-purple-400",
                "bg-gradient-to-r from-pink-300 to-amber-400",
                "bg-gradient-to-r from-blue-300 to-emerald-400",
                "bg-gradient-to-r from-violet-300 to-rose-400",
              ]
              const gradient = gradientDirections[index % gradientDirections.length]

              return (
                <li key={link.id} className="w-full transform transition-all duration-300 hover:translate-x-1">
                  <InteractiveLink
                    href={link.url}
                    linkId={link.id}
                    sensitive={link.sensitive}
                    className={`block w-full p-4 ${gradient} rounded-lg shadow-md hover:shadow-lg border border-white border-opacity-20 backdrop-blur-sm`}
                  >
                    <span className="font-bold text-white drop-shadow-sm">{link.title}</span>
                    <span className="block text-sm text-white text-opacity-80">{link.url}</span>
                  </InteractiveLink>
                </li>
              )
            })}
          </ul>
        </section>

        <footer className="mt-10 p-2 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shadow-md">
          <div className="px-6 py-1 rounded-full bg-white bg-opacity-10 backdrop-blur-sm text- font-medium">
            {user.username}
          </div>
        </footer>
      </main>
    </div>
  )
}

