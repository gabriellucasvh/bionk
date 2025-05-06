"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText, LayoutDashboard } from "lucide-react";

interface AnalyticsHeaderProps {
  onExportToExcel: () => void;
  onExportToPDF: () => void;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = React.memo(
  ({ onExportToExcel, onExportToPDF }) => {
    return (
      <header className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Análises</h2>
        <div className="flex gap-2">
          <Button variant="outline">Últimos 30 dias</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={onExportToExcel}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar para Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onExportToPDF}
                className="cursor-pointer"
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