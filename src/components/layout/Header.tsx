"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import NeoButton from "../buttons/button-neubrutalism";
import LoadingSpinner from "../buttons/LoadingSpinner";

const HeaderProps = [
  { label: "Menu", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Planos", href: "/planos" },
  { label: "Descubra", href: "/descubra" },
  { label: "Ajuda", href: "/ajuda" },
];

const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const handleClick = (key: string, path: string) => {
    if (isLoading[key]) return;
    setIsLoading((prev) => ({ ...prev, [key]: true }));
    router.push(path);
  };

  return (
    <nav className="hidden lg:flex fixed inset-0 z-50 h-20 mx-40 my-7 max-w-full items-center p-4 rounded-xl bg-white border font-sans">
      <div className="mx-5">
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
          <div className="flex items-center gap-3">
            <NeoButton
              onClick={() => handleClick("dashboard", "/dashboard")}
              className="py-2 bg-lime-400"
              disabled={isLoading["dashboard"]}
            >
              {isLoading["dashboard"] ? <LoadingSpinner /> : "Acessar o Dashboard"}
            </NeoButton>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <NeoButton
              onClick={() => handleClick("login", "/login")}
              className="py-2 bg-white"
              disabled={isLoading["login"]}
            >
              {isLoading["login"] ? <LoadingSpinner /> : "Entrar"}
            </NeoButton>
            <NeoButton
              onClick={() => handleClick("registro", "/registro")}
              className="py-2 bg-lime-400"
              disabled={isLoading["registro"]}
            >
              {isLoading["registro"] ? <LoadingSpinner /> : "Cadastre-se gratuitamente"}
            </NeoButton>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
