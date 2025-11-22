"use client";

import {
	ChevronDown,
	ChevronUp,
	LinkIcon,
	MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const TRAILING_SLASHES_REGEX = /\/+$/;

interface TopLinkData {
	id: string;
	title: string;
	url: string;
	clicks: number;
}

interface TopLinksTableProps {
	topLinks: TopLinkData[];
}

const TopLinksTable: React.FC<TopLinksTableProps> = React.memo(
	({ topLinks }) => {
		const [isExpanded, setIsExpanded] = useState(false);
		const displayedLinks = isExpanded
			? topLinks.slice(0, 10)
			: topLinks.slice(0, 3);
		const hasMoreLinks = topLinks.length > 3;

		return (
			<article>
				<Card className=" gap-3 dark:bg-zinc-900">
					<CardHeader className="pb-3 sm:pb-6">
						<CardTitle className="flex items-center gap-1 text-base sm:gap-2 sm:text-lg">
							Links com Melhor Desempenho
						</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							{isExpanded ? "Top 10" : "Top 3"} links mais clicados nos últimos
							30 dias.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 sm:space-y-4">
							{displayedLinks.map((link, index) => (
								<div
									className="flex flex-col items-start justify-between gap-2 border-b pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4 sm:pb-3"
									key={link.id}
								>
									<div className="flex flex-1 flex-col space-y-1">
										<span className="font-medium text-sm sm:text-base">
											<span
												className={`font-bold ${
													index === 0
														? "text-green-500"
														: index === 1
															? "text-green-600"
															: index === 2
																? "text-green-700"
																: "text-gray-600"
												}`}
											>
												{index + 1}.
											</span>{" "}
											{link.title}
										</span>
										{(() => {
											const transformTwitchUrl = (u: string) => {
												try {
													const parsed = new URL(u);
													if (
														parsed.hostname.toLowerCase() ===
															"clips.twitch.tv" &&
														parsed.pathname.replace(
															TRAILING_SLASHES_REGEX,
															""
														) === "/embed"
													) {
														const slug = parsed.searchParams.get("clip");
														if (slug && slug.trim().length > 0) {
															const display = `https://clips.twitch.tv/${slug}`;
															return { href: display, text: display };
														}
													}
												} catch {}
												return { href: u, text: u };
											};
											const isTwitchEmbed = link.url.includes(
												"clips.twitch.tv/embed"
											);
											const display = isTwitchEmbed
												? transformTwitchUrl(link.url)
												: { href: link.url, text: link.url };
											return (
												<Link
													className="flex w-full max-w-full items-center gap-1 overflow-hidden text-blue-500 text-xs sm:max-w-md sm:text-sm"
													href={display.href}
													target="_blank"
												>
													<LinkIcon className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
													<span className="truncate">{display.text}</span>
												</Link>
											);
										})()}
									</div>
									<div className="flex items-center rounded-full bg-primary/5 px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm">
										<MousePointerClick
											className="mr-1 text-primary sm:mr-1.5"
											size={12}
										/>
										<span className="font-medium">
											{(link.clicks || 0).toLocaleString()}
										</span>
										<span className="ml-1 text-muted-foreground">cliques</span>
									</div>
								</div>
							))}
						</div>

						{hasMoreLinks && (
							<div className="flex justify-center border-t pt-3 sm:pt-4">
								<Button
									className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground sm:gap-2 sm:text-sm"
									onClick={() => setIsExpanded(!isExpanded)}
									size="sm"
									variant="ghost"
								>
									{isExpanded ? (
										<>
											<ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
											Mostrar menos
										</>
									) : (
										<>
											<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">
												Ver mais ({topLinks.length - 3} restantes)
											</span>
											<span className="sm:hidden">+{topLinks.length - 3}</span>
										</>
									)}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</article>
		);
	}
);

TopLinksTable.displayName = "TopLinksTable";

export default TopLinksTable;
