"use client";

import { Button } from "@/components/ui/button";
import { Link2, BarChart3, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    key: "profile",
    href: "/dashboard/perfil",
    label: "Perfil",
    icon: <User className="h-4 w-4" />,
  },
  {
    key: "links",
    href: "/dashboard/links",
    label: "Links",
    icon: <Link2 className="h-4 w-4" />,
  },
  {
    key: "analytics",
    href: "/dashboard/analises",
    label: "Análises",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    key: "settings",
    href: "/dashboard/configs",
    label: "Configurações",
    icon: <Settings className="h-4 w-4" />,
  },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar para telas médias e maiores */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:bg-muted/40">
        <header className="flex h-14 items-center border-b px-6">
          <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
            <Image src="/bionk-logo.svg" alt="logo" width={90} height={90} />
          </Link>
        </header>
        <nav className="flex-1 overflow-y-auto p-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.key} href={link.href}>
                <Button variant={isActive ? "secondary" : "ghost"} className="justify-start gap-2 w-full">
                  {link.icon}
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Menu fixo para mobile com ícones */}
      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t bg-white z-50 p-4 md:hidden">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.key} href={link.href}>
              <Button variant={"ghost"} className={isActive ? "flex flex-col items-center gap-1" : "flex flex-col items-center gap-1 text-muted-foreground"}>
                <span className={isActive ? "text-green-500" : ""}>{link.icon}</span>
                <span>{link.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
