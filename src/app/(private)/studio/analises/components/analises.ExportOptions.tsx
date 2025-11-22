"use client";

import {
	Download,
	FileSpreadsheet,
	FileText,
	LayoutDashboard as LayoutStudio,
} from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { BottomSheet, BottomSheetContent } from "@/components/ui/bottom-sheet";
import { DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportOptionsProps {
	onExportToExcel: () => void;
	onExportToPDF: () => void;
	onExportToCSV: () => void;
}

export default function ExportOptions({
	onExportToExcel,
	onExportToPDF,
	onExportToCSV,
}: ExportOptionsProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	return (
		<div className="flex">
			<div className="sm:hidden">
				<BottomSheet onOpenChange={setMobileOpen} open={mobileOpen}>
					<BaseButton
						className="select-none rounded-xl bg-black text-white text-xs hover:bg-black/80 dark:bg-white dark:text-black"
						onClick={() => setMobileOpen(true)}
						type="button"
					>
						<LayoutStudio className="mr-1 h-3 w-3" />
						Exportar
					</BaseButton>
					<BottomSheetContent>
						<DialogTitle className="py-3 font-semibold text-base">
							Exportar
						</DialogTitle>
						<div className="space-y-2">
							<button
								className="flex w-full items-center justify-between rounded-xl border p-3 py-4 text-left text-sm"
								onClick={() => {
									onExportToExcel();
									setMobileOpen(false);
								}}
								type="button"
							>
								<span>Excel</span>
								<Download className="h-5 w-5 text-muted-foreground" />
							</button>
							<button
								className="flex w-full items-center justify-between rounded-xl border p-3 py-4 text-left text-sm"
								onClick={() => {
									onExportToPDF();
									setMobileOpen(false);
								}}
								type="button"
							>
								<span>PDF</span>
								<Download className="h-5 w-5 text-muted-foreground" />
							</button>
							<button
								className="flex w-full items-center justify-between rounded-xl border p-3 py-4 text-left text-sm"
								onClick={() => {
									onExportToCSV();
									setMobileOpen(false);
								}}
								type="button"
							>
								<span>CSV</span>
								<Download className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>
					</BottomSheetContent>
				</BottomSheet>
			</div>
			<div className="hidden sm:block">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<BaseButton className="select-none rounded-xl bg-black text-sm text-white hover:bg-black/80 dark:bg-white dark:text-black">
							<LayoutStudio className="mr-2 h-4 w-4" />
							Exportar
						</BaseButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-50">
						<DropdownMenuItem
							className="cursor-pointer text-sm"
							onClick={onExportToExcel}
						>
							<FileSpreadsheet className="mr-2 h-4 w-4" />
							Exportar para Excel
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-pointer text-sm"
							onClick={onExportToPDF}
						>
							<FileText className="mr-2 h-4 w-4" />
							Exportar para PDF
						</DropdownMenuItem>
						<DropdownMenuItem
							className="cursor-pointer text-sm"
							onClick={onExportToCSV}
						>
							<FileText className="mr-2 h-4 w-4" />
							Exportar para CSV
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
