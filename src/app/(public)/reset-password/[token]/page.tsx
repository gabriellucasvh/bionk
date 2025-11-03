import { Suspense } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import ResetPasswordForm from "./formulario-reset";

export default async function ResetPasswordPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;

	return (
		<div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
			<Suspense fallback={<LoadingPage />}>
				<ResetPasswordForm token={token} />
			</Suspense>
		</div>
	);
}
