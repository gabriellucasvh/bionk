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

	// Verifica se o nome de usuário está na blacklist
	if (BLACKLISTED_USERNAMES.includes(username)) {
		username = `${username}_`;
	}

	// Busca todos os usernames que começam com o nome base
	const existingUsers = await prisma.user.findMany({
		where: {
			username: {
				startsWith: username,
			},
		},
		select: { username: true },
	});

	const existingUsernames = new Set(existingUsers.map((u) => u.username));

	if (!existingUsernames.has(username)) {
		return username;
	}

	let i = 1;
	let uniqueUsername = `${username}${i}`;
	while (existingUsernames.has(uniqueUsername)) {
		i++;
		uniqueUsername = `${username}${i}`;
	}

	return uniqueUsername;
}
