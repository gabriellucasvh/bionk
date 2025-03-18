"use client"

import { Button } from "@/components/ui/button"
import { Link2, BarChart3, Settings, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SidebarProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  activeTab: string
}

const Sidebar = ({ setActiveTab, activeTab }: SidebarProps) => {
  return (
    <aside className="w-full border-r bg-muted/40 md:w-64">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
          <Image src={"/bionk-logo.svg"} alt='logo' width={90} height={90} />
        </Link>
      </div>
      <nav className="grid gap-1 p-2">
        <Button variant={activeTab === "profile" ? "secondary" : "ghost"} className="justify-start gap-2" onClick={() => setActiveTab("profile")}>
          <User className="h-4 w-4" />
          Perfil
        </Button>
        <Button variant={activeTab === "links" ? "secondary" : "ghost"} className="justify-start gap-2" onClick={() => setActiveTab("links")}>
          <Link2 className="h-4 w-4" />
          Links
        </Button>
        <Button variant={activeTab === "analytics" ? "secondary" : "ghost"} className="justify-start gap-2" onClick={() => setActiveTab("analytics")}>
          <BarChart3 className="h-4 w-4" />
          Análises
        </Button>
        <Button variant={activeTab === "settings" ? "secondary" : "ghost"} className="justify-start gap-2" onClick={() => setActiveTab("settings")}>
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </nav>
    </aside>
  )
}

export default Sidebar
