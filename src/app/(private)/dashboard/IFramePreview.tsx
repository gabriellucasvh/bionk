'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import '@/app/globals.css'

export default function IframePreview() {
  const { data: session } = useSession()
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.username) {
      setIframeUrl(`http://localhost:3000/${session.user.username}`)
    }
  }, [session])

  if (!iframeUrl) return null

  return (
    <section className="flex justify-center items-center w-full h-screen border-l p-4 md:p-8">
      <div className="w-full max-w-[390px] h-full max-h-[calc(100vh-4rem)] aspect-[390/844] border-7 border-black rounded-4xl overflow-hidden bg-white shadow-lg">
        <iframe
          src={iframeUrl}
          title="Pré-visualização do perfil"
          className="w-full h-full border-none"
        />
      </div>
    </section>
  )
}
