"use client";

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"; 


const VerPerfilMobile = () => {
  const { data: session } = useSession(); 
  const [profileUrl, setProfileUrl] = useState<string>('#');

  const username = session?.user?.username;

  useEffect(() => {
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.bionk.me' : 'http://localhost:3000';
    setProfileUrl(username ? `${baseUrl}/${username}` : '#');
  }, [username, session?.user?.username]);


  return (
    <div>
      <Button
            className="lg:hidden py-3 px-10 justify-center bg-green-500 text-white hover:bg-green-600 hover:text-white"
            size="sm"
            onClick={() => window.open(profileUrl, '_blank')}
            disabled={!username}
          >
            <ExternalLink className="h-4 w-4" />
            Ver meu perfil
          </Button>
    </div>
  )
}

export default VerPerfilMobile