"use client";
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoButton from './neo-button';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const HeaderProps = [
    { label: "Menu", href: "/" },
    { label: "Templates", href: "/templates" },
    { label: "Planos", href: "/planos" },
    { label: "Descubra", href: "/descubra" },
    { label: "Ajuda", href: "/ajuda" },
];

const HeaderMobile = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className='flex md:hidden fixed inset-x-0 z-50 m-3 max-w-full items-center justify-between p-4 rounded-xl bg-white'>
            <div>
                <Link href={'/'}>
                    <Image src={'/bionk-logo-quadrado.svg'} alt='logo' width={50} height={50} />
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
                        className='absolute top-full mt-1 rounded-xl left-0 w-full flex flex-col p-4 space-y-2 bg-white shadow-md'>
                        {HeaderProps.map((menu) => (
                            <motion.div 
                                key={menu.label} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Link href={menu.href} className='block text-gray-600 hover:text-black transition-colors duration-200 px-4 py-2 rounded-md active:bg-gray-200'>
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
                            <NeoButton className='bg-white'>Login</NeoButton>
                            <NeoButton className='bg-green-400'>Cadastre-se</NeoButton>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default HeaderMobile;
