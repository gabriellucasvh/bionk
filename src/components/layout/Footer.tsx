import { Facebook, Instagram, type LucideProps, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Adicionamos os componentes de ícone ao nosso objeto de navegação
const navigation = {
	resources: [
		{ name: "Ajuda", href: "/ajuda" },
		{ name: "Descubra", href: "/descubra" },
		{ name: "Templates", href: "/templates" },
		{ name: "Preços", href: "/planos" },
	],
	legal: [
		{ name: "Termos e Condições", href: "/termos" },
		{ name: "Política de Privacidade", href: "/privacidade" },
	],
	social: [
		{
			name: "Twitter",
			href: "#",
			icon: (props: LucideProps) => <Twitter {...props} />,
		},
		{
			name: "Instagram",
			href: "#",
			icon: (props: LucideProps) => <Instagram {...props} />,
		},
		{
			name: "Facebook",
			href: "#",
			icon: (props: LucideProps) => <Facebook {...props} />,
		},
	],
};

const Footer = () => {
	return (
		<footer className="w-full bg-slate-900 text-slate-300">
			<div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
				<div className="xl:grid xl:grid-cols-3 xl:gap-8">
					{/* Logo e descrição */}
					<div className="space-y-4">
						<Link className="inline-block" href="/">
							<Image
								alt="Bionk Logo"
								className="h-14 w-auto"
								height={28}
								priority
								src="/bionk-logo-white.svg"
								width={110}
							/>
						</Link>
						<p className="text-slate-400 text-sm leading-6">
							O melhor gerenciador de links para o seu negócio.
						</p>
					</div>

					{/* Links de navegação */}
					<div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
						<div className="md:grid md:grid-cols-2 md:gap-8">
							<div>
								<h3 className="font-semibold text-white text-xs uppercase tracking-wider">
									Recursos
								</h3>
								<ul className="mt-4 space-y-3">
									{navigation.resources.map((item) => (
										<li key={item.name}>
											<Link
												className="text-slate-400 text-sm transition-colors duration-300 hover:text-green-400"
												href={item.href}
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="mt-10 md:mt-0">
								<h3 className="font-semibold text-white text-xs uppercase tracking-wider">
									Legal
								</h3>
								<ul className="mt-4 space-y-3">
									{navigation.legal.map((item) => (
										<li key={item.name}>
											<Link
												className="text-slate-400 text-sm transition-colors duration-300 hover:text-green-400"
												href={item.href}
											>
												{item.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
						{/* Esta coluna pode ser usada para mais links no futuro, se necessário */}
					</div>
				</div>

				{/* Rodapé inferior com copyright e ícones sociais */}
				<div className="mt-16 border-slate-800 border-t pt-8 sm:flex sm:items-center sm:justify-between">
					<div className="flex space-x-6 sm:order-2">
						{navigation.social.map((item) => (
							<Link
								className="text-slate-500 transition-colors duration-300 hover:text-green-400"
								href={item.href}
								key={item.name}
							>
								<span className="sr-only">{item.name}</span>
								<item.icon aria-hidden="true" className="h-5 w-5" />
							</Link>
						))}
					</div>
					<p className="mt-6 text-slate-500 text-xs leading-5 sm:order-1 sm:mt-0">
						&copy; {new Date().getFullYear()} Bionk. Todos os direitos
						reservados.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
