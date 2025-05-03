import prisma from "@/lib/prisma";

function sanitizeUsername(name: string): string {
  // Primeiro, substitui 'ç' e 'Ç' por 'c'
  const nameWithoutCedilla = name.replace(/ç/g, "c").replace(/Ç/g, "c");

  // Depois, normaliza e remove acentos e caracteres não alfanuméricos
  return nameWithoutCedilla
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos (acentos)
    .replace(/[^a-zA-Z0-9]/g, "") // Remove caracteres não alfanuméricos
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
