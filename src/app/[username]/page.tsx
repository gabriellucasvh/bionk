import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface PageProps {
  params: { username: string };
}

export default async function UserPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { username } = resolvedParams;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!user) notFound();

  // Caminho base dos templates
  const templateCategory = user.templateCategory || "minimalista"; // Fallback para categoria padrão
  const templateName = user.template || "default"; // Fallback para template padrão

  let TemplateComponent;
  try {
    TemplateComponent = (await import(`@/app/[username]/templates/${templateCategory}/${templateName}.tsx`)).default;
  } catch (error) {
    console.error(`Erro ao carregar template: ${templateCategory}/${templateName}`, error);
    TemplateComponent = (await import("@/app/[username]/templates/minimalista/default")).default;
  }

  return <TemplateComponent user={user} />;
}
