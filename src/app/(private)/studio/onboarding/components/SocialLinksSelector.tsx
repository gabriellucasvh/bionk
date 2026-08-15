"use client";

import { SOCIAL_PLATFORMS } from "@/config/social-platforms";

export default function SocialLinksSelector({
	value,
	onChange,
}: {
	value: { platform: string; username: string }[];
	onChange: (v: { platform: string; username: string }[]) => void;
}) {
	const platforms = SOCIAL_PLATFORMS;

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-4 gap-4">
				{platforms.map((p) => {
					const isSelected = value.some((v) => v.platform === p.key);
					return (
						<button
							className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border p-2 transition ${
								isSelected
									? "border-transparent ring ring-black"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							}`}
							key={p.key}
							onClick={() => {
								if (isSelected) {
									onChange(value.filter((v) => v.platform !== p.key));
								} else {
									onChange([...value, { platform: p.key, username: "" }]);
								}
							}}
							title={p.name}
							type="button"
						>
							<div
								className="mb-2 h-8 w-8"
								style={{
									backgroundColor: p.color,
									maskImage: `url(${p.icon})`,
									maskSize: "contain",
									maskRepeat: "no-repeat",
									maskPosition: "center",
								}}
							/>
							<span className="truncate text-xs">{p.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
