// src/utils/generateUsername.ts
import { BLACKLISTED_USERNAMES } from "@/config/blacklist";
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
	let username = sanitizeUsername(name);
	let i = 1;

	// Verifica se o nome de usuário sanitizado está na blacklist
	if (BLACKLISTED_USERNAMES.includes(username)) {
		username = `${username}_`; // Adiciona um sufixo para torná-lo válido
	}

	let uniqueUsername = username;

	while (
		await prisma.user.findUnique({ where: { username: uniqueUsername } })
	) {
		uniqueUsername = `${username}${i}`;
		i++;
	}

	return uniqueUsername;
}
