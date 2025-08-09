// src/app/(private)/dashboard/UserComponents.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import type { FC } from "react"
import type { Prisma } from "@prisma/client"

type UserWithLinks = Prisma.UserGetPayload<{
  include: {
    Link: {
      where: { active: true }
      orderBy: { order: "asc" }
    }
  }
}>

export default async function UserComponent() {
  const session = await getServerSession(authOptions)
  const username = session?.user?.username

  if (!username) return notFound()

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!user || !user.username) return notFound()

  const safeUser = user as UserWithLinks

  const templateCategory = user.templateCategory || "minimalista"
  const templateName = user.template || "default"

  let TemplateComponent: FC<{ user: UserWithLinks }>

  try {
    TemplateComponent = (await import(
      `@/app/[username]/templates/${templateCategory}/${templateName}`
    )).default as FC<{ user: UserWithLinks }>
  } catch (error) {
    console.error(`Erro ao carregar template: ${templateCategory}/${templateName}`, error)
    TemplateComponent = (await import("@/app/[username]/templates/minimalista/default")).default as FC<{ user: UserWithLinks }>
  }

  return <TemplateComponent user={safeUser} />
}
