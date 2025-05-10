import prisma from "@/lib/prisma";

function sanitizeUsername(name: string): string {
  const nameWithoutCedilla = name.replace(/ç/g, "c").replace(/Ç/g, "c");

  return nameWithoutCedilla
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9]/g, "") 
    .toLowerCase();
}

export async function generateUniqueUsername(name: string): Promise<string> {
  const username = sanitizeUsername(name);
  let uniqueUsername = username;
  let i = 1;

  while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
    uniqueUsername = `${username}${i}`;
    i++;
  }

  return uniqueUsername;
}
