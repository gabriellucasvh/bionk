"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LinkIcon, MousePointerClick } from "lucide-react";
import Link from "next/link";
import React from "react";

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
		return (
			<article>
				<Card>
					<CardHeader>
						<CardTitle>Links com Melhor Desempenho</CardTitle>
						<CardDescription>
							Top 10 links mais clicados nos últimos 30 dias.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{topLinks.slice(0, 10).map((link, index) => (
								<div
									className="flex flex-col items-start justify-between border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center"
									key={link.id}
								>
									<div className="flex flex-1 flex-col space-y-1">
										<span className="font-medium">
											<span 
												className={`font-bold ${
													index === 0 ? 'text-green-500' : 
													index === 1 ? 'text-green-600' : 
													index === 2 ? 'text-green-700' : 'text-gray-600'
												}`}
											>
												{index + 1}.
											</span>
											{' '}{link.title}
										</span>
										<Link
											className="flex max-w-md items-center gap-1 whitespace-normal break-words break-all text-blue-500 text-sm"
											href={link.url}
											target="_blank"
										>
											<LinkIcon className="h-4 w-4 shrink-0" />
											<span>{link.url}</span>
										</Link>
									</div>
									<div className="flex items-center rounded-full bg-primary/5 px-3 py-1.5 text-sm">
										<MousePointerClick
											className="mr-1.5 text-primary"
											size={14}
										/>
										<span className="font-medium">
											{link.clicks.toLocaleString()}
										</span>
										<span className="ml-1 text-muted-foreground">cliques</span>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</article>
		);
	}
);

TopLinksTable.displayName = "TopLinksTable";

export default TopLinksTable;
