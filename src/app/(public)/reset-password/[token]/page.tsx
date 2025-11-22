import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import LoadingPage from "@/components/layout/LoadingPage";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import ResetPasswordForm from "./formulario-reset";
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;

	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	return (
		<div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
			<Suspense fallback={<LoadingPage />}>
				<ResetPasswordForm locale={locale} token={token} />
			</Suspense>
		</div>
	);
}

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const cookieLocale = cookieStore.get("locale")?.value || "pt-br";
	const locale = normalizeLocale(cookieLocale);
	const dict = await getDictionary(locale, "reset-token");
	return { title: dict.title, description: dict.subtitle };
}
