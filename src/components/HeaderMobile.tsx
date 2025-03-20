"use client";
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoButton from './neo-button';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Menu, X } from 'lucide-react';

const HeaderProps = [
    { label: "Menu", href: "/" },
    { label: "Templates", href: "/templates" },
    { label: "Planos", href: "/planos" },
    { label: "Descubra", href: "/descubra" },
    { label: "Ajuda", href: "/ajuda" },
];

const HeaderMobile = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession()
    const router = useRouter()
    const handleLogout = () => {
        signOut()
    }

    return (
        <nav className='flex md:hidden fixed inset-x-0 z-50 m-3 max-w-full items-center justify-between p-4 rounded-xl bg-white border'>
            <div>
                <Link href={'/'}>
                    <Image src={'/bionk-logo.svg'} alt='logo' width={100} height={50} />
                </Link>
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className='focus:outline-none'>
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className='absolute top-full mt-1 rounded-xl left-0 w-full flex flex-col p-4 space-y-2 bg-white shadow-md border'>
                        {HeaderProps.map((menu) => (
                            <motion.div
                                key={menu.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link href={menu.href} className='block  w-full text-gray-600 hover:text-black transition-colors duration-200 px-4 py-2 rounded-md active:bg-gray-200'>
                                    {menu.label}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className='flex flex-col gap-4 mt-4'
                        >
                            <div className="flex w-full justify-end gap-4 border-t pt-4">
                                {session ? (
                                    <div className='flex items-center w-full justify-center gap-3'>
                                        <NeoButton
                                            onClick={() => router.push("/dashboard")}
                                            className="p-2 bg-gradient-to-r from-green-500 to-green-400"
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
                                    <div className='flex items-center w-full justify-center gap-3'>
                                        <NeoButton
                                            onClick={() => router.push("/login")}
                                            className="p-2 bg-white"
                                        >
                                            Entrar
                                        </NeoButton>
                                        <NeoButton
                                            onClick={() => router.push("/registro")}
                                            className="p-2 bg-gradient-to-r from-green-500 to-green-400"
                                        >
                                            Cadastre-se gratuitamente
                                        </NeoButton>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default HeaderMobile;
