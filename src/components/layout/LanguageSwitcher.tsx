"use client";

import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = ["pt-br", "en", "es"] as const;

export default function LanguageSwitcher({
	locale = "pt-br",
}: {
	locale?: (typeof locales)[number];
}) {
	const router = useRouter();
	const currentLocale = locale as (typeof locales)[number];

	const setLocale = (l: (typeof locales)[number]) => {
		Cookies.set("locale", l, { expires: 365, path: "/" });
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded border border-bunker-700 bg-bunker-800 px-2 py-1 text-white text-xs">
				<span className="inline-flex items-center gap-1">
					<Image
						alt={
							currentLocale === "pt-br"
								? "Bandeira PT-BR"
								: currentLocale === "en"
									? "Bandeira EN"
									: "Bandeira ES"
						}
						height={14}
						src={
							currentLocale === "pt-br"
								? "/flags/br.svg"
								: currentLocale === "en"
									? "/flags/us.svg"
									: "/flags/es.svg"
						}
						width={20}
					/>
					<span>
						{currentLocale === "pt-br" ? "PT" : currentLocale.toUpperCase()}
					</span>
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent sideOffset={6}>
				<DropdownMenuRadioGroup
					onValueChange={(v) => {
						const val = v as (typeof locales)[number];
						setLocale(val);
					}}
					value={currentLocale}
				>
					{locales.map((l) => (
						<DropdownMenuRadioItem key={l} value={l}>
							<span className="inline-flex cursor-pointer items-center gap-2">
								<Image
									alt={
										l === "pt-br"
											? "Bandeira PT-BR"
											: l === "en"
												? "Bandeira EN"
												: "Bandeira ES"
									}
									height={16}
									src={
										l === "pt-br"
											? "/flags/br.svg"
											: l === "en"
												? "/flags/us.svg"
												: "/flags/es.svg"
									}
									width={24}
								/>
								<span className="text-sm">
									{l === "pt-br" ? "PT" : l.toUpperCase()}
								</span>
							</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
