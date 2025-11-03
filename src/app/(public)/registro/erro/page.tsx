import { Suspense } from "react";
import RegistroErroClient from "./RegistroErroClient";

export default async function RegistroErroPage({
	searchParams,
}: {
	searchParams: Promise<{ email?: string }>;
}) {
	const { email } = await searchParams;
	return (
		<Suspense fallback={<div>Carregando...</div>}>
			<RegistroErroClient email={email ?? null} />
		</Suspense>
	);
}
