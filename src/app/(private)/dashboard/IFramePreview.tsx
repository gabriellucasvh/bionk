'use client'

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
    <section className="fixed top-1/2 right-28 -translate-y-1/2 z-30 pointer-events-none">
      <div className="w-full max-w-[390px] h-[700px] aspect-[390/844] border-7 border-black rounded-4xl overflow-hidden bg-white shadow-lg pointer-events-auto">
        <iframe
          src={iframeUrl || 'about:blank'}
          title="Pré-visualização do perfil"
          className="w-full h-full border-none"
        />
      </div>
    </section>
  )
}
