"use client";

import { Button } from "@/components/ui/button";
import { Link2, BarChart3, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

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

  return (
    <aside className="w-full border-r bg-muted/40 md:w-64">
      <header className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
          <Image src="/bionk-logo.svg" alt="logo" width={90} height={90} />
        </Link>
      </header>
      <nav className="grid gap-1 p-2">
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
  );
};

export default Sidebar;
