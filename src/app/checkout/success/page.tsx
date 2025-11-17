// src/app/checkout/success/page.tsx

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
			<div className="mx-auto max-w-md space-y-6">
				<CheckCircle className="mx-auto h-16 w-16 text-green-500" />
				<h1 className="font-bold text-3xl">Pagamento Confirmado!</h1>
				<p className="text-gray-600">
					Seu pagamento foi processado com sucesso. Obrigado por assinar a
					Bionk!
				</p>
				<p className="text-gray-600">
					Você receberá um email com os detalhes da sua assinatura em breve.
				</p>

				<Link
					className="mt-8 block w-full rounded-full bg-bunker-950 py-4 text-white hover:bg-bunker-900"
					href="/studio"
				>
					Ir para o Studio
				</Link>
			</div>
		</div>
	);
}
