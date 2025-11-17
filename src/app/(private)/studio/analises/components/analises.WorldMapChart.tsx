"use client";

import { json } from "d3-fetch";
import { geoMercator, geoPath } from "d3-geo";
import { select, selectAll } from "d3-selection";
import { Earth } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// URL do arquivo de topologia mundial (Natural Earth)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const normalizeCountryName = (name: string): string => {
	const countryMapping: { [key: string]: string } = {
		Brazil: "Brazil",
		"United States": "United States of America",
		"United Kingdom": "United Kingdom",
		Germany: "Germany",
		France: "France",
		Italy: "Italy",
		Spain: "Spain",
		Portugal: "Portugal",
		Argentina: "Argentina",
		Mexico: "Mexico",
		Japan: "Japan",
		China: "China",
		India: "India",
		Australia: "Australia",
		Canada: "Canada",
	};
	return countryMapping[name] || name;
};

interface CountryAnalytics {
	country: string;
	clicks: number;
	views: number;
	totalInteractions: number;
}

interface WorldMapChartProps {
	data: CountryAnalytics[];
	isLoading?: boolean;
}

export default function WorldMapChart(props: WorldMapChartProps) {
	const { data } = props;
	const svgRef = useRef<SVGSVGElement>(null);

	const maxTotal = useMemo(
		() => Math.max(...data.map((d) => d.totalInteractions), 1),
		[data]
	);

	const countryMap = useMemo(
		() => new Map(data.map((d) => [normalizeCountryName(d.country), d])),
		[data]
	);

	const getColorIntensity = useCallback(
		(countryName: string): string => {
			const normalizedName = normalizeCountryName(countryName);
			const countryData = countryMap.get(normalizedName);
			if (!countryData || countryData.totalInteractions === 0) {
				return "#f3f4f6";
			}
			const intensity = countryData.totalInteractions / maxTotal;
			const blueIntensity = Math.max(0.2, intensity);
			return `rgba(59, 130, 246, ${blueIntensity})`;
		},
		[countryMap, maxTotal]
	);

	useEffect(() => {
		if (!svgRef.current) {
			return;
		}

		const svg = select(svgRef.current);
		svg.selectAll("*").remove();

		const width = 800;
		const height = 400;

		const projection = geoMercator()
			.scale(120)
			.center([0, 20])
			.translate([width / 2, height / 2]);

		const path = geoPath().projection(projection);

		json(geoUrl).then((world: any) => {
			const countries = world.features;

			svg
				.selectAll(".country")
				.data(countries)
				.enter()
				.append("path")
				.attr("class", "country")
				.attr("d", (d: any) => path(d))
				.attr("fill", (d: any) => getColorIntensity(d.properties.NAME))
				.attr("stroke", "#FFFFFF")
				.attr("stroke-width", 0.5)
				.style("cursor", "pointer")
				.on("mouseover", function (event, d: any) {
					select(this).attr("fill", "#2563eb");

					const countryName = d.properties.NAME;
					const normalizedName = normalizeCountryName(countryName);
					const countryData = countryMap.get(normalizedName);

					select("body")
						.append("div")
						.attr("class", "tooltip")
						.style("position", "absolute")
						.style("background", "rgba(0, 0, 0, 0.8)")
						.style("color", "white")
						.style("padding", "8px")
						.style("border-radius", "4px")
						.style("font-size", "12px")
						.style("pointer-events", "none")
						.style("z-index", "1000")
						.html(
							countryData
								? `${countryName}<br/>Cliques: ${countryData.clicks}<br/>Visualizações: ${countryData.views}<br/>Total: ${countryData.totalInteractions}`
								: `${countryName}<br/>Sem dados`
						)
						.style("left", `${event.pageX + 10}px`)
						.style("top", `${event.pageY - 10}px`);
				})
				.on("mouseout", function (_event, d: any) {
					select(this).attr("fill", getColorIntensity(d.properties.NAME));
					selectAll(".tooltip").remove();
				});
		});
	}, [countryMap, maxTotal]);

	return (
		<div className="space-y-6">
			{/* Mapa Mundial e Tabela */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Earth className="h-5 w-5" />
							Distribuição Geográfica
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="w-full" style={{ height: "400px" }}>
							<svg
								height="100%"
								ref={svgRef}
								style={{
									width: "100%",
									height: "100%",
								}}
								viewBox="0 0 800 400"
								width="100%"
							/>
						</div>

						{/* Legenda */}
						<div className="mt-4 flex items-center justify-center space-x-4 text-gray-600 text-sm">
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-gray-200" />
								<span>Sem dados</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-200" />
								<span>Baixa atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-500" />
								<span>Média atividade</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-4 w-4 rounded bg-blue-800" />
								<span>Alta atividade</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Tabela de Países */}
				<Card className="h-fit">
					<CardHeader>
						<CardTitle className="font-semibold text-lg">
							Dados por País
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="max-h-96 overflow-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="py-2 text-left font-medium text-gray-700">
											País
										</th>
										<th className="py-2 text-right font-medium text-gray-700">
											Cliques
										</th>
										<th className="py-2 text-right font-medium text-gray-700">
											Views
										</th>
									</tr>
								</thead>
								<tbody>
									{data.length > 0 ? (
										data
											.sort((a, b) => b.totalInteractions - a.totalInteractions)
											.map((country) => (
												<tr
													className="border-b hover:bg-gray-50"
													key={country.country}
												>
													<td className="py-2 font-medium text-gray-900">
														{country.country}
													</td>
													<td className="py-2 text-right text-gray-600">
														{country.clicks}
													</td>
													<td className="py-2 text-right text-gray-600">
														{country.views}
													</td>
												</tr>
											))
									) : (
										<tr>
											<td
												className="py-8 text-center text-gray-500"
												colSpan={3}
											>
												<Earth className="mx-auto mb-2 h-8 w-8 text-gray-400" />
												Nenhum dado disponível
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
