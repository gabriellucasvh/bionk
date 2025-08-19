"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText, LayoutDashboard as LayoutStudio } from "lucide-react";
import React from "react";

interface AnalyticsHeaderProps {
	onExportToExcel: () => void;
	onExportToPDF: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = React.memo(
	({ onExportToExcel, onExportToPDF }) => {
		return (
			<header className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
				<h2 className="font-bold text-2xl">Análises</h2>
				<div className="flex gap-2">
					<Button variant="outline">Últimos 30 dias</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<LayoutStudio className="mr-2 h-4 w-4" />
								Exportar
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={onExportToExcel}
							>
								<FileSpreadsheet className="mr-2 h-4 w-4" />
								Exportar para Excel
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={onExportToPDF}
							>
								<FileText className="mr-2 h-4 w-4" />
								Exportar para PDF
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		);
	}
);

AnalyticsHeader.displayName = "AnalyticsHeader";

export default AnalyticsHeader;
