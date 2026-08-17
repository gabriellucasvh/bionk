"use client";

import {
	CaretDown,
	CaretLeft,
	CaretRight,
	CaretUp,
	CaretUpDown,
	MagnifyingGlass,
	SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export default function AudienceDataTable({ data }: { data: any[] }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [countryFilter, setCountryFilter] = useState("all");
	const [trafficSourceFilter, setTrafficSourceFilter] = useState("all");

	const [visibleColumns, setVisibleColumns] = useState({
		name: true,
		email: true,
		phone: true,
		createdAt: true,
		country: true,
		referrer: true,
	});

	// Ordenação
	type SortKey =
		| "name"
		| "email"
		| "phone"
		| "createdAt"
		| "country"
		| "referrer";
	const [sortConfig, setSortConfig] = useState<{
		key: SortKey;
		direction: "asc" | "desc";
	} | null>({
		key: "createdAt",
		direction: "desc",
	});

	// Paginação
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Contato Selecionado (Sheet)
	const [selectedContact, setSelectedContact] = useState<any | null>(null);

	const toggleColumn = (key: keyof typeof visibleColumns) => {
		setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSort = (key: SortKey) => {
		let direction: "asc" | "desc" = "asc";
		if (
			sortConfig &&
			sortConfig.key === key &&
			sortConfig.direction === "asc"
		) {
			direction = "desc";
		}
		setSortConfig({ key, direction });
	};

	const uniqueCountries = useMemo(() => {
		const countries = new Set(
			data.map((item) => item.country || "Desconhecido")
		);
		return Array.from(countries).sort();
	}, [data]);

	const uniqueTrafficSources = useMemo(() => {
		const sources = new Set(
			data.map((item) => item.referrer || "Desconhecido")
		);
		return Array.from(sources).sort();
	}, [data]);

	const filteredAndSortedData = useMemo(() => {
		const processedData = data.filter((item) => {
			const matchesSearch =
				(item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
				(item.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
				(item.phone || "").includes(searchTerm);

			const matchesCountry =
				countryFilter === "all" ||
				(item.country || "Desconhecido") === countryFilter;

			const matchesTrafficSource =
				trafficSourceFilter === "all" ||
				(item.referrer || "Desconhecido") === trafficSourceFilter;

			return matchesSearch && matchesCountry && matchesTrafficSource;
		});

		if (sortConfig !== null) {
			processedData.sort((a, b) => {
				let aValue = a[sortConfig.key] || "";
				let bValue = b[sortConfig.key] || "";

				// Normalizar Desconhecido para ficar no fim ou no começo dependendo do sort
				if (sortConfig.key === "country" || sortConfig.key === "referrer") {
					if (!aValue) {
						aValue = "Desconhecido";
					}
					if (!bValue) {
						bValue = "Desconhecido";
					}
				}

				if (sortConfig.key === "createdAt") {
					aValue = new Date(a.createdAt).getTime();
					bValue = new Date(b.createdAt).getTime();
				} else {
					aValue = aValue.toString().toLowerCase();
					bValue = bValue.toString().toLowerCase();
				}

				if (aValue < bValue) {
					return sortConfig.direction === "asc" ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === "asc" ? 1 : -1;
				}
				return 0;
			});
		}

		return processedData;
	}, [data, searchTerm, countryFilter, trafficSourceFilter, sortConfig]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [
		searchTerm,
		countryFilter,
		trafficSourceFilter,
		sortConfig,
		itemsPerPage,
	]);

	// Pagination slice
	const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
	const paginatedData = filteredAndSortedData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const renderSortIcon = (columnKey: SortKey) => {
		if (sortConfig?.key !== columnKey) {
			return <CaretUpDown className="ml-1 h-4 w-4 opacity-50" />;
		}
		return sortConfig.direction === "asc" ? (
			<CaretUp className="ml-1 h-4 w-4" weight="bold" />
		) : (
			<CaretDown className="ml-1 h-4 w-4" weight="bold" />
		);
	};

	const renderUnknownCell = (value: string | null) => {
		if (!value || value === "Desconhecido") {
			return (
				<span className="text-zinc-400 italic dark:text-zinc-500">
					Desconhecido
				</span>
			);
		}
		return value;
	};

	return (
		<div className="p-4 sm:p-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative w-full max-w-sm">
					<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<MagnifyingGlass className="h-4 w-4 text-zinc-400" />
					</div>
					<Input
						className="pl-9"
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Pesquisar..."
						value={searchTerm}
					/>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Select onValueChange={setCountryFilter} value={countryFilter}>
						<SelectTrigger className="w-[140px] sm:w-[160px]">
							<SelectValue placeholder="País" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos os Países</SelectItem>
							{uniqueCountries.map((country) => (
								<SelectItem key={country} value={country}>
									{country}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						onValueChange={setTrafficSourceFilter}
						value={trafficSourceFilter}
					>
						<SelectTrigger className="w-[140px] sm:w-[160px]">
							<SelectValue placeholder="Origem" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas as Origens</SelectItem>
							{uniqueTrafficSources.map((source) => (
								<SelectItem key={source} value={source}>
									{source}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="ml-auto" variant="outline">
								<SlidersHorizontal className="mr-2 h-4 w-4" weight="regular" />
								Colunas
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="bottom">
							<DropdownMenuCheckboxItem
								checked={visibleColumns.name}
								onCheckedChange={() => toggleColumn("name")}
							>
								Nome
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={visibleColumns.email}
								onCheckedChange={() => toggleColumn("email")}
							>
								E-mail
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={visibleColumns.phone}
								onCheckedChange={() => toggleColumn("phone")}
							>
								Telefone
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={visibleColumns.createdAt}
								onCheckedChange={() => toggleColumn("createdAt")}
							>
								Data de Envio
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={visibleColumns.country}
								onCheckedChange={() => toggleColumn("country")}
							>
								País
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={visibleColumns.referrer}
								onCheckedChange={() => toggleColumn("referrer")}
							>
								Fonte de Tráfego
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{visibleColumns.name && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										Nome {renderSortIcon("name")}
									</div>
								</TableHead>
							)}
							{visibleColumns.email && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("email")}
								>
									<div className="flex items-center">
										E-mail {renderSortIcon("email")}
									</div>
								</TableHead>
							)}
							{visibleColumns.phone && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("phone")}
								>
									<div className="flex items-center">
										Telefone {renderSortIcon("phone")}
									</div>
								</TableHead>
							)}
							{visibleColumns.createdAt && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("createdAt")}
								>
									<div className="flex items-center">
										Data de Envio {renderSortIcon("createdAt")}
									</div>
								</TableHead>
							)}
							{visibleColumns.country && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("country")}
								>
									<div className="flex items-center">
										País {renderSortIcon("country")}
									</div>
								</TableHead>
							)}
							{visibleColumns.referrer && (
								<TableHead
									className="cursor-pointer select-none hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									onClick={() => handleSort("referrer")}
								>
									<div className="flex items-center">
										Fonte de Tráfego {renderSortIcon("referrer")}
									</div>
								</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedData.length > 0 ? (
							paginatedData.map((item) => (
								<TableRow
									className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									key={item.id}
									onClick={() => setSelectedContact(item)}
								>
									{visibleColumns.name && (
										<TableCell className="font-medium">
											{renderUnknownCell(item.name)}
										</TableCell>
									)}
									{visibleColumns.email && (
										<TableCell>{renderUnknownCell(item.email)}</TableCell>
									)}
									{visibleColumns.phone && (
										<TableCell>{renderUnknownCell(item.phone)}</TableCell>
									)}
									{visibleColumns.createdAt && (
										<TableCell>
											{format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
												locale: ptBR,
											})}
										</TableCell>
									)}
									{visibleColumns.country && (
										<TableCell>{renderUnknownCell(item.country)}</TableCell>
									)}
									{visibleColumns.referrer && (
										<TableCell>{renderUnknownCell(item.referrer)}</TableCell>
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									className="h-24 text-center text-zinc-500"
									colSpan={Object.values(visibleColumns).filter(Boolean).length}
								>
									Nenhum contato encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			<div className="mt-4 flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
				<div className="flex items-center gap-2">
					<p>Itens por página:</p>
					<Select
						onValueChange={(v) => setItemsPerPage(Number(v))}
						value={itemsPerPage.toString()}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="25">25</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex w-[100px] items-center justify-center font-medium text-sm">
						Página {currentPage} de {totalPages || 1}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage === 1}
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							variant="outline"
						>
							<CaretLeft className="h-4 w-4" />
						</Button>
						<Button
							className="h-8 w-8 p-0"
							disabled={currentPage >= totalPages || totalPages === 0}
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							variant="outline"
						>
							<CaretRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Side Panel (Sheet) */}
			<Sheet
				onOpenChange={(open) => !open && setSelectedContact(null)}
				open={!!selectedContact}
			>
				<SheetContent className="overflow-y-auto sm:max-w-md">
					<SheetHeader className="mb-6">
						<SheetTitle>Detalhes do Contato</SheetTitle>
						<SheetDescription>
							Informações captadas através do formulário.
						</SheetDescription>
					</SheetHeader>
					{selectedContact && (
						<div className="space-y-6">
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									Nome
								</h4>
								<p className="mt-1 text-base">
									{renderUnknownCell(selectedContact.name)}
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									E-mail
								</h4>
								<p className="mt-1 text-base">
									{renderUnknownCell(selectedContact.email)}
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									Telefone
								</h4>
								<p className="mt-1 text-base">
									{renderUnknownCell(selectedContact.phone)}
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									Data de Envio
								</h4>
								<p className="mt-1 text-base">
									{format(
										new Date(selectedContact.createdAt),
										"dd 'de' MMMM 'de' yyyy 'às' HH:mm",
										{
											locale: ptBR,
										}
									)}
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									País
								</h4>
								<p className="mt-1 text-base">
									{renderUnknownCell(selectedContact.country)}
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-sm text-zinc-500 dark:text-zinc-400">
									Fonte de Tráfego
								</h4>
								<p className="mt-1 text-base">
									{renderUnknownCell(selectedContact.referrer)}
								</p>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
