import { Suspense } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import CompletionRegistrationClient from "./CompletionRegistrationClient";

export default async function CompletionRegistrationPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string; sig?: string }>;
}) {
	const { token, sig } = await searchParams;
	return (
		<Suspense fallback={<LoadingPage />}>
			<CompletionRegistrationClient sig={sig ?? null} token={token ?? null} />
		</Suspense>
	);
}
