import { Suspense } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import OtpRegistrationClient from "./OtpRegistrationClient";

export default async function OtpRegistrationPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string }>;
}) {
	const { token } = await searchParams;
	return (
		<Suspense fallback={<LoadingPage />}>
			<OtpRegistrationClient token={token ?? null} />
		</Suspense>
	);
}
