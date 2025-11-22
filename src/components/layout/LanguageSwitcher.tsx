"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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
		<div className="flex items-center gap-2 text-xs">
			{locales.map((l) => (
				<button
					className={
						l === currentLocale
							? "rounded border border-bunker-700 bg-bunker-800 px-2 py-1 text-white"
							: "rounded px-2 py-1 text-bunker-400 hover:text-white"
					}
					key={l}
					onClick={() => setLocale(l)}
					type="button"
				>
					{l === "pt-br" ? "PT" : l.toUpperCase()}
				</button>
			))}
		</div>
	);
}
