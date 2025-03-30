import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateUniqueUsername(name: string): Promise<string> {
  const username = name.toLowerCase().replace(/\s+/g, "");
  let uniqueUsername = username;
  let i = 1;

  while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
    uniqueUsername = `${username}${i}`;
    i++;
  }

  return uniqueUsername;
}