"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, MousePointer } from "lucide-react";

// URL do arquivo de topologia mundial (Natural Earth)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

export default function WorldMapChart({ data, isLoading = false }: WorldMapChartProps) {
  // Calcular valores máximos para normalização das cores
  const maxTotal = Math.max(...data.map(d => d.totalInteractions), 1);
  
  // Criar mapa de países para lookup rápido com normalização de nomes
  const normalizeCountryName = (name: string): string => {
    const countryMapping: { [key: string]: string } = {
      'Brazil': 'Brazil',
      'United States': 'United States of America',
      'United Kingdom': 'United Kingdom',
      'Germany': 'Germany',
      'France': 'France',
      'Italy': 'Italy',
      'Spain': 'Spain',
      'Portugal': 'Portugal',
      'Argentina': 'Argentina',
      'Mexico': 'Mexico',
      'Japan': 'Japan',
      'China': 'China',
      'India': 'India',
      'Australia': 'Australia',
      'Canada': 'Canada'
    };
    return countryMapping[name] || name;
  };
  
  const countryMap = new Map(data.map(d => [normalizeCountryName(d.country), d]));
  
  // Função para obter intensidade da cor baseada no total de interações
  const getColorIntensity = (countryName: string): string => {
    const normalizedName = normalizeCountryName(countryName);
    const countryData = countryMap.get(normalizedName);
    
    if (!countryData || countryData.totalInteractions === 0) {
      return '#f3f4f6'; // Cinza claro para países sem dados
    }
    
    const intensity = countryData.totalInteractions / maxTotal;
    const blueIntensity = Math.max(0.2, intensity); // Mínimo de 20% de intensidade
    return `rgba(59, 130, 246, ${blueIntensity})`; // Azul com transparência baseada na intensidade
  };
  
  // Calcular totais gerais
  const totalClicks = data.reduce((sum, country) => sum + country.clicks, 0);
  const totalViews = data.reduce((sum, country) => sum + country.views, 0);
  const totalCountries = data.filter(country => country.totalInteractions > 0).length;
  
  // Top 5 países
  const topCountries = [...data]
    .sort((a, b) => b.totalInteractions - a.totalInteractions)
    .slice(0, 5)
    .filter(country => country.totalInteractions > 0);

  return (
    <div className="space-y-6">
      {/* Mapa Mundial e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Distribuição Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: '400px' }}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 120,
                  center: [0, 20]
                }}
                width={800}
                height={400}
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryName = geo.properties.NAME;
                      const normalizedName = normalizeCountryName(countryName);
                      const countryData = countryMap.get(normalizedName);
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getColorIntensity(countryName)}
                          stroke="#FFFFFF"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: "#2563eb",
                              outline: "none",
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "#1d4ed8",
                              outline: "none",
                            },
                          }}
                          title={
                            countryData
                              ? `${countryName}\nCliques: ${countryData.clicks}\nVisualizações: ${countryData.views}\nTotal: ${countryData.totalInteractions}`
                              : `${countryName}\nSem dados`
                          }
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>
            
            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Sem dados</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span>Baixa atividade</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Média atividade</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-800 rounded"></div>
                <span>Alta atividade</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Países */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Dados por País</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-700">País</th>
                    <th className="text-right py-2 font-medium text-gray-700">Cliques</th>
                    <th className="text-right py-2 font-medium text-gray-700">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data
                      .sort((a, b) => b.totalInteractions - a.totalInteractions)
                      .map((country, index) => (
                        <tr key={country.country} className="border-b hover:bg-gray-50">
                          <td className="py-2 font-medium text-gray-900">{country.country}</td>
                          <td className="text-right py-2 text-gray-600">{country.clicks}</td>
                          <td className="text-right py-2 text-gray-600">{country.views}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">
                        <Globe className="mx-auto h-8 w-8 text-gray-400 mb-2" />
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