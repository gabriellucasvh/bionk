"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import NeoButton from './neo-button'
import { LogOut } from 'lucide-react'

const HeaderProps = [
  { label: "Menu", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Planos", href: "/planos" },
  { label: "Descubra", href: "/descubra" },
  { label: "Ajuda", href: "/ajuda" },
]

const Header: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const handleLogout = () => {
    signOut()
  }

  return (
    <nav className="hidden md:flex fixed inset-0 z-50 h-20 m-3 max-w-full items-center p-4 rounded-xl bg-white border">
      <div className="mx-10">
        <Link href="/">
          <Image src="/bionk-logo.svg" alt="logo" width={160} height={90} />
        </Link>
      </div>
      {HeaderProps.map((menu) => (
        <ul key={menu.label}>
          <li>
            <Link
              className="text-gray-600 hover:text-black transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-200"
              href={menu.href}
            >
              {menu.label}
            </Link>
          </li>
        </ul>
      ))}
      <div className="flex w-full justify-end gap-4">
        {session ? (
          <div className='flex items-center gap-3'>
            <NeoButton
              onClick={() => router.push("/dashboard")}
              className="py-2 bg-gradient-to-r from-green-500 to-green-400"
            >
              Dashboard
            </NeoButton>
            <NeoButton
              onClick={handleLogout}
              className="py-2 bg-white flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </NeoButton>
          </div>
        ) : (
          <div className='flex items-center gap-3'>
            <NeoButton
              onClick={() => router.push("/login")}
              className="py-2 bg-white"
            >
              Entrar
            </NeoButton>
            <NeoButton
              onClick={() => router.push("/registro")}
              className="py-2 bg-gradient-to-r from-green-500 to-green-400"
            >
              Cadastre-se gratuitamente
            </NeoButton>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Header
