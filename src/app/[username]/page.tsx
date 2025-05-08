// src/app/[username]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ComponentType } from "react";

type UserProfileData = Prisma.UserGetPayload<{
  include: {
    Link: { where: { active: true }; orderBy: { order: "asc" } };
    SocialLink: { orderBy: { platform: "asc" } };
  };
}>;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;

  const user = (await prisma.user.findUnique({
    where: { username },
    include: {
      Link: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
      SocialLink: {
        orderBy: { platform: "asc" },
      },
    },
  })) as UserProfileData | null;

  if (!user) {
    notFound();
  }

  const category = user.templateCategory ?? "minimalista";
  const name = user.template ?? "default";

  let TemplateComponent: ComponentType<{ user: UserProfileData }>;

  try {
    const mod = await import(
      `@/app/[username]/templates/${category}/${name}.tsx`
    );
    TemplateComponent = mod.default as ComponentType<{
      user: UserProfileData;
    }>;
  } catch {
    const mod = await import(
      `@/app/[username]/templates/minimalista/default`
    );
    TemplateComponent = mod.default as ComponentType<{
      user: UserProfileData;
    }>;
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <TemplateComponent user={user} />
    </main>
  );
}
