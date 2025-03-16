import Link from 'next/link'
import React from 'react'
import NeoButton from './neo-button'
import Image from 'next/image'

const HeaderProps = [
    { label: "Menu", href: "/" },
    { label: "Templates", href: "/templates" },
    { label: "Planos", href: "/planos" },
    { label: "Descubra", href: "/descubra" },
    { label: "Ajuda", href: "/ajuda" },
]
const Header = () => {
    return (
        <nav className='hidden md:flex fixed inset-0 z-50 h-20 m-3 max-w-full items-center p-4 rounded-xl bg-white'>
            <div className='mx-10'>
                <Link href={"/"}><Image src={"/bionk-logo.svg"} alt='logo' width={160} height={90} /></Link>
            </div>
            {HeaderProps.map((menu) => (
                <ul className='' key={menu.label}>
                    <li>
                        <Link className='text-gray-600 hover:text-black transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-200' href={menu.href}>{menu.label}</Link>
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