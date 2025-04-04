"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeoButton from "../buttons/button-neubrutalism";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import LoadingSpinner from "../buttons/LoadingSpinner";

const HeaderProps = [
  { label: "Menu", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Planos", href: "/planos" },
  { label: "Descubra", href: "/descubra" },
  { label: "Ajuda", href: "/ajuda" },
];

const HeaderMobile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const handleClick = (key: string, path: string) => {
    if (isLoading[key]) return;
    setIsLoading((prev) => ({ ...prev, [key]: true }));
    router.push(path);
  };

  return (
    <nav className="flex md:hidden fixed inset-x-0 z-50 m-3 max-w-full items-center justify-between p-4 rounded-xl bg-white border font-sans">
      <div>
        <Link href="/">
          <Image src="/bionk-logo.svg" alt="logo" width={100} height={50} />
        </Link>
      </div>
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full mt-1 rounded-xl left-0 w-full flex flex-col p-4 space-y-2 bg-white shadow-md border"
          >
            {HeaderProps.map((menu) => (
              <motion.div
                key={menu.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href={menu.href}
                  className="block w-full text-gray-600 hover:text-black transition-colors duration-200 px-4 py-2 rounded-md active:bg-gray-200"
                >
                  {menu.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4 mt-4"
            >
              <div className="flex w-full justify-end gap-4 border-t pt-4">
                {session ? (
                  <div className="flex items-center w-full justify-center gap-3">
                    <NeoButton
                      onClick={() => handleClick("dashboard", "/dashboard")}
                      className="p-2 bg-gradient-to-r from-green-500 to-green-400"
                      disabled={isLoading["dashboard"]}
                    >
                      {isLoading["dashboard"] ? <LoadingSpinner /> : "Acessar o Dashboard"}
                    </NeoButton>
                  </div>
                ) : (
                  <div className="flex items-center w-full justify-center gap-3">
                    <NeoButton
                      onClick={() => handleClick("login", "/login")}
                      className="p-2 bg-white"
                      disabled={isLoading["login"]}
                    >
                      {isLoading["login"] ? <LoadingSpinner /> : "Entrar"}
                    </NeoButton>
                    <NeoButton
                      onClick={() => handleClick("registro", "/registro")}
                      className="p-2 bg-gradient-to-r from-green-500 to-green-400"
                      disabled={isLoading["registro"]}
                    >
                      {isLoading["registro"] ? <LoadingSpinner /> : "Cadastre-se gratuitamente"}
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
