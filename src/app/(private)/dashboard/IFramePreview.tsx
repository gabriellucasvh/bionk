"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import '@/app/globals.css'

export default function IframePreview() {
  const { data: session, status } = useSession()
  const [iframeUrl, setIframeUrl] = useState<string>('')
  const username = session?.user?.username;

  useEffect(() => {
    if (status === 'authenticated' && username) {
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://www.bionk.me'
          : 'http://localhost:3000'

      setIframeUrl(`${baseUrl}/${username}`)
    } else if (status === 'authenticated') {
      setIframeUrl('about:blank'); 
    }
  }, [username, status, session?.user?.username]) 

  return (
    <section className="fixed inset-0 flex items-center justify-center lg:items-end lg:justify-end z-30 pointer-events-none p-4 lg:p-8">
      <div className="w-[min(100%,calc(100vh*0.3))] sm:w-[min(100%,calc(100vh*0.5))] md:w-[min(100%,calc(100vh*0.45))] lg:w-[min(100%,calc(100vh*0.4))] xl:w-[min(100%,calc(100vh*0.43))] aspect-[390/844] border-4 border-black rounded-4xl overflow-hidden bg-white shadow-lg pointer-events-auto">
        <iframe
          src={iframeUrl || 'about:blank'}
          title="Pré-visualização do perfil"
          className="w-full h-full border-none"
        />
      </div>
    </section>
  )
}
