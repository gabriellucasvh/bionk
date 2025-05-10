"use client";

import { Button } from "@/components/ui/button";
import { Link2, BarChart3, Settings, User, LogOut, Paintbrush, ExternalLink } from "lucide-react"; 
import { signOut, useSession } from "next-auth/react"; 
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    key: "personalization",
    href: "/dashboard/personalizar",
    label: "Personalizar",
    icon: <Paintbrush className="h-4 w-4" />,
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
  const router = useRouter();
  const { data: session } = useSession(); 
  const [disabledButtons, setDisabledButtons] = useState<Set<string>>(() => new Set());
  const [profileUrl, setProfileUrl] = useState<string>('#');
  const handleLogout = () => signOut();

  const username = session?.user?.username;

  useEffect(() => {
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://www.bionk.me' : 'http://localhost:3000';
    setProfileUrl(username ? `${baseUrl}/${username}` : '#');
  }, [username, session?.user?.username]);

  useEffect(() => {
    setDisabledButtons(new Set());
  }, [pathname])
  return (
    <>
      {/* Sidebar para telas médias e maiores */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-r md:bg-card/40">
        <header className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
            <Image src="/bionk-logo.svg" alt="logo" width={90} height={30} priority />
          </Link>
        </header>

        <div className="px-2 py-2">
          <Button
            className="w-full py-5 justify-center bg-green-500 text-white hover:bg-green-600 hover:text-white"
            size="sm"
            onClick={() => window.open(profileUrl, '_blank')}
            disabled={!username}
          >
            <ExternalLink className="h-4 w-4" />
            Ver meu perfil
          </Button>
        </div>

        <nav className="px-2 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Button
                key={link.key}
                variant={isActive ? "secondary" : "ghost"}
                className={`justify-start w-full text-sm font-medium h-10 ${isActive ? "bg-secondary" : ""}`}
                disabled={disabledButtons.has(link.key)}
                onClick={() => {
                  if (isActive) return
                  setDisabledButtons((prev) => new Set(prev).add(link.key))
                  router.push(`${link.href}`)
                }}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Button>
            )
          })}
        </nav>

        <div className="mt-auto p-4 space-y-2 border-t">
          <Button
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Menu fixo para mobile com ícones */}
      <nav className="fixed inset-x-0 bottom-0 z-50 bg-white border-t md:hidden">
        <ul className="grid grid-cols-5 divide-x divide-muted py-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.key} className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] sm:text-xs ${isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  disabled={disabledButtons.has(link.key)}
                  onClick={() => {
                    if (isActive) return;
                    setDisabledButtons((prev) => new Set(prev).add(link.key));
                    router.push(`${link.href}`);
                  }}
                >
                  <span className={isActive ? "text-green-500" : ""}>
                    {link.icon}
                  </span>
                  {link.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

    </>
  );
};

export default Sidebar;
