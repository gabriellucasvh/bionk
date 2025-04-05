import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function UserComponent() {
  const session = await getServerSession(authOptions);
  const username = session?.user?.username;

  if (!username) return notFound();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!user) return notFound();

  const templateCategory = user.templateCategory || "minimalista";
  const templateName = user.template || "default";

  let TemplateComponent;
  try {
    TemplateComponent = (await import(`@/app/[username]/templates/${templateCategory}/${templateName}.tsx`)).default;
  } catch (error) {
    console.error(`Erro ao carregar template: ${templateCategory}/${templateName}`, error);
    TemplateComponent = (await import("@/app/[username]/templates/minimalista/default")).default;
  }

  return <TemplateComponent user={user} />;
}
