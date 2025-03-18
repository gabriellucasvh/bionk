"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink, Grip, Edit, Eye, Trash2, MoreHorizontal, EyeOff, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

const LinksTab = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar links</h2>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar novo link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Links</CardTitle>
          <CardDescription>Gerencie, edite e organize seus links.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link Items */}
          {[{ title: "Meu Portfolio", url: "https://portfolio.example.com", active: true, clicks: 1243, sensitive: false }].map((link) => (
            <div key={link.title} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 sm:w-7/12">
                <Grip className="h-5 w-5 cursor-move text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{link.title}</span>
                    {link.sensitive && <Badge variant="outline" className="text-xs">Sensível</Badge>}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-500">
                    <ExternalLink className="h-3 w-3" />
                    <Link className="truncate" href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:w-5/12 sm:justify-end">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="h-3 w-3" />
                    {link.clicks}
                  </Badge>
                  <Switch checked={link.active} aria-label={link.active ? "Disable link" : "Enable link"} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver informações
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {link.sensitive ? (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Conteúdo não Sensível
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Conteúdo Sensível
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default LinksTab
