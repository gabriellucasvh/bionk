import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DefaultTemplate from "./templates/DefaultTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";

const templates: Record<string, any> = {
  default: DefaultTemplate,
  minimal: MinimalTemplate,
};

interface PageProps {
  params: { username: string };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = params;

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

  const TemplateComponent = templates[user.template] || DefaultTemplate;

  return <TemplateComponent user={user} />;
}
