"use client";

import { LinkIcon, MousePointerClick } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
							Ranking dos links mais clicados nos últimos 30 dias.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{topLinks.map((link) => (
								<div
									key={link.id}
									className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0"
								>
									<div className="flex flex-col space-y-1 flex-1">
										<span className="font-medium">{link.title}</span>
										<Link
											href={link.url}
											target="_blank"
											className="text-sm text-blue-500 flex items-center gap-1 max-w-md break-words break-all whitespace-normal"
										>
											<LinkIcon className="h-4 w-4 shrink-0" />
											<span>{link.url}</span>
										</Link>
									</div>
									<div className="flex items-center bg-primary/5 px-3 py-1.5 rounded-full text-sm">
										<MousePointerClick
											size={14}
											className="mr-1.5 text-primary"
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
	},
);

TopLinksTable.displayName = "TopLinksTable";

export default TopLinksTable;
