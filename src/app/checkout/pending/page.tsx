// src/app/checkout/pending/page.tsx

import { Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";

export default async function CheckoutPendingPage({
    searchParams,
}: {
    searchParams: Promise<{ cs_id?: string }>;
}) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect("/registro");
	}
    const sp = await searchParams;
    const csId = sp?.cs_id;
	if (!csId) {
		redirect("/planos");
	}
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
		apiVersion: "2025-09-30.clover",
	});
	let valid = false;
	try {
		const checkout = await stripe.checkout.sessions.retrieve(csId);
		if (
			checkout &&
			checkout.client_reference_id === session.user.id &&
			checkout.payment_status !== "paid"
		) {
			valid = true;
		}
	} catch {}
	if (!valid) {
		redirect("/planos");
	}
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
			<div className="mx-auto max-w-md space-y-6">
				<Clock className="mx-auto h-16 w-16 text-yellow-500" />
				<h1 className="font-bold text-3xl">Pagamento em Processamento</h1>
				<p className="text-gray-600">
					Seu pagamento está sendo processado. Assim que for confirmado, você
					receberá um email com os detalhes da sua assinatura.
				</p>
				<p className="text-gray-600">
					Este processo pode levar alguns minutos. Você pode fechar esta página
					e continuar navegando.
				</p>
				<div className="flex flex-col gap-4">
					<Link
						className="mt-8 block w-full rounded-full bg-bunker-950 py-4 text-white hover:bg-bunker-900"
						href="/studio"
					>
						Ir para o Studio
					</Link>
					<Link
						className="block w-full rounded-full bg-bunker-400 py-4 text-white hover:bg-bunker-500"
						href="/contato"
					>
						Contatar Suporte
					</Link>
				</div>
			</div>
		</div>
	);
}
