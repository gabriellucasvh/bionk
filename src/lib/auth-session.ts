import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getAppSession() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		return session;
	}

	const cookieStore = await cookies();
	const activeProfileId = cookieStore.get("bionk_active_profile_id")?.value;

	if (activeProfileId && activeProfileId !== session.user.id) {
		const profile = await prisma.user.findFirst({
			where: {
				id: activeProfileId,
				ownerId: session.user.id,
			},
		});

		if (profile) {
			// Sobrescreve o ID do usuário para que o resto da aplicação atue sobre este perfil
			return {
				...session,
				user: {
					...session.user,
					originalUserId: session.user.id,
					id: activeProfileId,
					username: profile.username,
					name: profile.name,
					image: profile.image,
				},
			};
		}
	}

	return session;
}

