import Link from 'next/link'
import React from 'react'
import NeoButton from './neo-button'

const HeaderProps = [
    { label: "Menu", href: "/" },
    { label: "Templates", href: "/templates" },
    { label: "Planos", href: "/planos" },
    { label: "Descubra", href: "/descubra" },
    { label: "Ajuda", href: "/ajuda" },
]
const Header = () => {
    return (
        <nav className='fixed inset-0 z-50 flex h-20 m-3 max-w-full items-center gap-4 p-4 rounded-lg bg-gray-200 shadow-black/30 shadow-md'>
            <div>
                <h1 className='font-bold italic text-xl'>Bionk</h1>
            </div>
            {HeaderProps.map((menu) => (
                <ul className='' key={menu.label}>
                    <li>
                        <Link href={menu.href}>{menu.label}</Link>
                    </li>
                </ul>
            )
            )}
            <div className='flex w-full justify-end gap-4'>
                <NeoButton className='bg-white'>Login</NeoButton>
                <NeoButton className='bg-green-400'>Cadastre-se</NeoButton>
            </div>
        </nav>
    )
}

export default Header