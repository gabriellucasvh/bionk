"use client";

import * as d3 from "d3";
import { Earth, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as topojson from "topojson-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface CountryAnalytics {
	country: string;
	clicks: number;
	views: number;
	totalInteractions: number;
}

interface WorldMapAnalyticsProps {
	data: CountryAnalytics[];
	isLoading?: boolean;
	width?: number;
	height?: number;
}

interface TooltipState {
	visible: boolean;
	x: number;
	y: number;
	content: string;
}

export default function WorldMapAnalytics({
	data,
	isLoading = false,
	width = 800,
	height = 400,
}: WorldMapAnalyticsProps) {
	// Hooks devem ser chamados primeiro
	const svgRef = useRef<SVGSVGElement>(null);
	const [worldData, setWorldData] = useState<any>(null);
	const [tooltip, setTooltip] = useState<TooltipState>({
		visible: false,
		x: 0,
		y: 0,
		content: "",
	});

	// Normalizar nomes de países para correspondência
	const normalizeCountryName = (name: string): string => {
		if (!name) {
			return "";
		}

		// Primeiro, normalizar o nome removendo acentos e convertendo para lowercase
		const normalized = name.toLowerCase().trim();

		// Mapeamento bidirecional para correspondência entre dados e TopoJSON
		const countryMapping: { [key: string]: string } = {
			// Mapeamento dos dados para TopoJSON
			brazil: "Brazil",
			"united states": "United States of America",
			usa: "United States of America",
			us: "United States of America",
			"united kingdom": "United Kingdom",
			uk: "United Kingdom",
			germany: "Germany",
			france: "France",
			italy: "Italy",
			spain: "Spain",
			portugal: "Portugal",
			argentina: "Argentina",
			mexico: "Mexico",
			japan: "Japan",
			china: "China",
			india: "India",
			australia: "Australia",
			canada: "Canada",
			russia: "Russia",
			"russian federation": "Russia",
			"south korea": "South Korea",
			korea: "South Korea",
			netherlands: "Netherlands",
			holland: "Netherlands",
			switzerland: "Switzerland",
			sweden: "Sweden",
			norway: "Norway",
			denmark: "Denmark",
			finland: "Finland",
			belgium: "Belgium",
			austria: "Austria",
			poland: "Poland",
			"czech republic": "Czech Republic",
			czechia: "Czech Republic",
			hungary: "Hungary",
			romania: "Romania",
			bulgaria: "Bulgaria",
			greece: "Greece",
			turkey: "Turkey",
			israel: "Israel",
			egypt: "Egypt",
			"south africa": "South Africa",
			nigeria: "Nigeria",
			kenya: "Kenya",
			morocco: "Morocco",
			algeria: "Algeria",
			tunisia: "Tunisia",
			libya: "Libya",
			ethiopia: "Ethiopia",
			ghana: "Ghana",
			"ivory coast": "Côte d'Ivoire",
			"cote d'ivoire": "Côte d'Ivoire",
			senegal: "Senegal",
			mali: "Mali",
			"burkina faso": "Burkina Faso",
			niger: "Niger",
			chad: "Chad",
			sudan: "Sudan",
			"south sudan": "South Sudan",
			uganda: "Uganda",
			tanzania: "Tanzania",
			zambia: "Zambia",
			zimbabwe: "Zimbabwe",
			botswana: "Botswana",
			namibia: "Namibia",
			angola: "Angola",
			mozambique: "Mozambique",
			madagascar: "Madagascar",
			mauritius: "Mauritius",
			seychelles: "Seychelles",
			chile: "Chile",
			peru: "Peru",
			colombia: "Colombia",
			venezuela: "Venezuela",
			ecuador: "Ecuador",
			bolivia: "Bolivia",
			paraguay: "Paraguay",
			uruguay: "Uruguay",
			guyana: "Guyana",
			suriname: "Suriname",
			"french guiana": "French Guiana",
			thailand: "Thailand",
			vietnam: "Vietnam",
			cambodia: "Cambodia",
			laos: "Laos",
			myanmar: "Myanmar",
			burma: "Myanmar",
			malaysia: "Malaysia",
			singapore: "Singapore",
			indonesia: "Indonesia",
			philippines: "Philippines",
			brunei: "Brunei",
			taiwan: "Taiwan",
			"hong kong": "Hong Kong",
			macau: "Macau",
			mongolia: "Mongolia",
			"north korea": "North Korea",
			kazakhstan: "Kazakhstan",
			uzbekistan: "Uzbekistan",
			turkmenistan: "Turkmenistan",
			kyrgyzstan: "Kyrgyzstan",
			tajikistan: "Tajikistan",
			afghanistan: "Afghanistan",
			pakistan: "Pakistan",
			bangladesh: "Bangladesh",
			"sri lanka": "Sri Lanka",
			nepal: "Nepal",
			bhutan: "Bhutan",
			maldives: "Maldives",
			iran: "Iran",
			iraq: "Iraq",
			syria: "Syria",
			lebanon: "Lebanon",
			jordan: "Jordan",
			"saudi arabia": "Saudi Arabia",
			yemen: "Yemen",
			oman: "Oman",
			uae: "United Arab Emirates",
			"united arab emirates": "United Arab Emirates",
			qatar: "Qatar",
			bahrain: "Bahrain",
			kuwait: "Kuwait",
			georgia: "Georgia",
			armenia: "Armenia",
			azerbaijan: "Azerbaijan",
			belarus: "Belarus",
			ukraine: "Ukraine",
			moldova: "Moldova",
			lithuania: "Lithuania",
			latvia: "Latvia",
			estonia: "Estonia",
			slovenia: "Slovenia",
			croatia: "Croatia",
			"bosnia and herzegovina": "Bosnia and Herzegovina",
			serbia: "Serbia",
			montenegro: "Montenegro",
			kosovo: "Kosovo",
			"north macedonia": "North Macedonia",
			macedonia: "North Macedonia",
			albania: "Albania",
			ireland: "Ireland",
			iceland: "Iceland",
			luxembourg: "Luxembourg",
			malta: "Malta",
			cyprus: "Cyprus",
			"new zealand": "New Zealand",
			fiji: "Fiji",
			"papua new guinea": "Papua New Guinea",
			"solomon islands": "Solomon Islands",
			vanuatu: "Vanuatu",
			samoa: "Samoa",
			tonga: "Tonga",
			palau: "Palau",
			micronesia: "Micronesia",
			"marshall islands": "Marshall Islands",
			kiribati: "Kiribati",
			nauru: "Nauru",
			tuvalu: "Tuvalu",
		};

		// Tentar encontrar correspondência direta
		const directMatch = countryMapping[normalized];
		if (directMatch) {
			return directMatch;
		}

		// Se não encontrar correspondência direta, retornar o nome original capitalizado
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(" ");
	};

	// Criar mapa de países para lookup rápido
	const countryMap = new Map(
		data.map((d) => {
			const normalizedName = normalizeCountryName(d.country);
			console.log(`Mapeando: ${d.country} -> ${normalizedName}`, d);
			return [normalizedName, d];
		})
	);

	console.log("CountryMap criado:", Array.from(countryMap.entries()));

	// Verificar especificamente o Brasil
	console.log("Brasil no countryMap:", countryMap.get("Brazil"));
	console.log("Brazil no countryMap:", countryMap.get("Brazil"));

	// Calcular valores máximos para normalização das cores
	const maxTotal = Math.max(...data.map((d) => d.totalInteractions), 1);
	console.log("Max interactions:", maxTotal);

	// Função para obter intensidade da cor baseada no total de interações
	const getColorIntensity = (countryName: string): string => {
		const normalizedName = normalizeCountryName(countryName);
		const countryData = countryMap.get(normalizedName);

		if (!countryData || countryData.totalInteractions === 0) {
			return "#f3f4f6"; // Cinza claro para países sem dados
		}

		const intensity = countryData.totalInteractions / maxTotal;
		const blueIntensity = Math.max(0.2, intensity); // Mínimo de 20% de intensidade
		return `rgba(59, 130, 246, ${blueIntensity})`; // Azul com transparência baseada na intensidade
	};

	// Carregar dados do mundo
	useEffect(() => {
		d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
			.then((world: any) => {
				setWorldData(world);
			})
			.catch((error) => {
				console.error("Erro ao carregar dados do mundo:", error);
			});
	}, []);

	// Renderizar o mapa
	useEffect(() => {
		if (!(worldData && svgRef.current)) {
			return;
		}

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const projection = d3
			.geoNaturalEarth1()
			.scale(width / 6.5)
			.translate([width / 2, height / 2]);

		const path = d3.geoPath().projection(projection);

		const countries = topojson.feature(
			worldData,
			worldData.objects.countries
		) as any;

		svg
			.selectAll("path")
			.data(countries.features)
			.enter()
			.append("path")
			.attr("d", path as any)
			.attr("fill", (d: any) => {
				const countryName = d.properties.name || d.properties.NAME;
				return getColorIntensity(countryName);
			})
			.attr("stroke", "#fff")
			.attr("stroke-width", 0.5)
			.style("cursor", "pointer")
			.on("mouseover", function (event, d: any) {
				const countryName = d.properties?.name || d.properties?.NAME || "";
				const normalizedName = normalizeCountryName(countryName);
				const countryData = countryMap.get(normalizedName);

				d3.select(this).attr("stroke-width", 2);

				const [mouseX, mouseY] = d3.pointer(event, svgRef.current);

				let content = `<strong>${countryName}</strong><br/>`;
				if (countryData) {
					content += `Cliques: ${countryData.clicks}<br/>`;
					content += `Views: ${countryData.views}<br/>`;
					content += `Total: ${countryData.totalInteractions}`;
				} else {
					content += "Sem dados disponíveis";
				}

				setTooltip({
					visible: true,
					x: mouseX,
					y: mouseY,
					content,
				});
			})
			.on("mouseout", function () {
				d3.select(this).attr("stroke-width", 0.5);
				setTooltip({ visible: false, x: 0, y: 0, content: "" });
			});
	}, [worldData, data, width, height, countryMap, getColorIntensity]);

	if (isLoading) {
		return (
			<Card className=" dark:bg-zinc-900">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Earth className="h-5 w-5" />
						Mapa Mundial de Interações
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[400px] w-full animate-pulse rounded-md bg-muted" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className=" dark:bg-zinc-900">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Earth className="h-5 w-5" />
					Mapa Mundial de Interações
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Mapa Mundial */}
				<div className="relative">
					<svg
						className="h-auto w-full max-w-full rounded-lg border border-gray-200"
						height={height}
						preserveAspectRatio="xMidYMid meet"
						ref={svgRef}
						viewBox={`0 0 ${width} ${height}`}
						width={width}
					/>

					{/* Tooltip */}
					{tooltip.visible && (
						<div
							className="pointer-events-none absolute z-10 rounded bg-gray-800 p-2 text-sm text-white shadow-lg"
							dangerouslySetInnerHTML={{ __html: tooltip.content }}
							style={{
								left: tooltip.x,
								top: tooltip.y,
								transform: "translate(-50%, -100%)",
							}}
						/>
					)}

					{/* Legenda */}
					<div className="mt-4">
						{/* Desktop: Layout horizontal */}
						<div className="hidden items-center justify-center space-x-4 text-gray-600 text-sm sm:flex">
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-gray-200" />
								<span className="dark:text-white/80">Sem dados</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-200" />
								<span className="dark:text-white/80">Baixa atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-500" />
								<span className="dark:text-white/80">Média atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-800" />
								<span className="dark:text-white/80">Alta atividade</span>
							</div>
						</div>

						{/* Mobile: Layout 2x2 */}
						<div className="grid grid-cols-2 gap-2 text-gray-600 text-sm sm:hidden">
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 flex-shrink-0 rounded bg-gray-200" />
								<span className="truncate">Sem dados</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 flex-shrink-0 rounded bg-blue-200" />
								<span className="truncate">Baixa atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 flex-shrink-0 rounded bg-blue-500" />
								<span className="truncate">Média atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 flex-shrink-0 rounded bg-blue-800" />
								<span className="truncate">Alta atividade</span>
							</div>
						</div>
					</div>
				</div>

				{/* Tabela de Países */}
				<div>
					<h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 text-lg dark:text-white">
						<Users className="h-4 w-4" />
						Dados por País
					</h3>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="min-w-[120px]">País</TableHead>
									<TableHead className="hidden min-w-[80px] text-right sm:table-cell">
										Visualizações
									</TableHead>
									<TableHead className="hidden min-w-[80px] text-right sm:table-cell">
										Cliques
									</TableHead>
									<TableHead className="min-w-[80px] text-right">
										Total
									</TableHead>
									<TableHead className="hidden min-w-[80px] text-right md:table-cell">
										% do Total
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.length > 0 ? (
									data
										.sort((a, b) => b.totalInteractions - a.totalInteractions)
										.map((country, index) => {
											const totalInteractions = data.reduce(
												(sum, item) => sum + item.totalInteractions,
												0
											);
											const percentage =
												totalInteractions > 0
													? (
															(country.totalInteractions / totalInteractions) *
															100
														).toFixed(1)
													: "0.0";

											return (
												<TableRow key={`${country.country}-${index}`}>
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
																<Earth className="h-4 w-4 text-muted-foreground" />
															</div>
															<div className="font-medium">
																{country.country}
															</div>
														</div>
													</TableCell>
													<TableCell className="hidden text-right sm:table-cell">
														{country.views.toLocaleString()}
													</TableCell>
													<TableCell className="hidden text-right sm:table-cell">
														{(country.clicks || 0).toLocaleString()}
													</TableCell>
													<TableCell className="text-right font-medium">
														{country.totalInteractions.toLocaleString()}
													</TableCell>
													<TableCell className="hidden text-right text-muted-foreground md:table-cell">
														{percentage}%
													</TableCell>
												</TableRow>
											);
										})
								) : (
									<TableRow>
										<TableCell
											className="py-8 text-center text-muted-foreground"
											colSpan={5}
										>
											<div className="flex flex-col items-center gap-2">
												<Earth className="h-8 w-8 text-muted-foreground" />
												<span>Nenhum dado disponível</span>
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
