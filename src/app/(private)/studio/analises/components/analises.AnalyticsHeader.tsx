"use client";

import {
	FileSpreadsheet,
	FileText,
	LayoutDashboard as LayoutStudio,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AnalyticsHeaderProps {
	onExportToExcel: () => void;
	onExportToPDF: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = React.memo(
	({ onExportToExcel, onExportToPDF }) => {
		return (
			<header className="mb-3 flex flex-col items-start justify-between gap-3 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
				<h2 className="font-bold text-xl sm:text-2xl">Análises</h2>
				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					<Button className="text-xs sm:text-sm" size="sm" variant="outline">Últimos 30 dias</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="text-xs sm:text-sm" size="sm" variant="outline">
								<LayoutStudio className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								Exportar
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-36 sm:w-40">
							<DropdownMenuItem
								className="cursor-pointer text-xs sm:text-sm"
								onClick={onExportToExcel}
							>
								<FileSpreadsheet className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								<span className="hidden sm:inline">Exportar para </span>Excel
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer text-xs sm:text-sm"
								onClick={onExportToPDF}
							>
								<FileText className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
								<span className="hidden sm:inline">Exportar para </span>PDF
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
