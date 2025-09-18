import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import BannedUserWarning from "@/components/BannedUserWarning";
import { authOptions } from "@/lib/auth";

export default async function BanidoPage() {
	const session = await getServerSession(authOptions);

	// Se não há sessão ou usuário não está banido, redirecionar
	if (!session?.user?.isBanned) {
		redirect("/");
	}

	return (
		<BannedUserWarning
			bannedAt={session.user.bannedAt}
			banReason={session.user.banReason}
			username={session.user.username || "usuário"}
		/>
	);
}
