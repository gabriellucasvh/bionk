"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { FeatureCollection, Feature, Geometry } from 'geojson';

interface CountryAnalytics {
  country: string;
  clicks: number;
  views: number;
}

interface WorldMapD3Props {
  data: CountryAnalytics[];
  width?: number;
  height?: number;
}

const WorldMapD3: React.FC<WorldMapD3Props> = ({ 
  data, 
  width = 700, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [worldData, setWorldData] = useState<FeatureCollection | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });

  // Carregar dados do mundo
  useEffect(() => {
    d3.json<FeatureCollection>('/world-110m.json')
      .then((data) => {
        if (data) {
          setWorldData(data);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar dados do mundo:', error);
      });
  }, []);

  // Função para normalizar nomes de países
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
      'Canada': 'Canada',
      'Russia': 'Russia',
      'South Korea': 'South Korea',
      'Netherlands': 'Netherlands',
      'Belgium': 'Belgium',
      'Switzerland': 'Switzerland'
    };
    return countryMapping[name] || name;
  };

  // Renderizar mapa
  useEffect(() => {
    if (!worldData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Criar projeção
    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Criar mapa de dados para lookup rápido
    const countryMap = new Map<string, CountryAnalytics>();
    data.forEach(d => {
      const normalizedName = normalizeCountryName(d.country);
      countryMap.set(normalizedName, d);
    });

    // Calcular valores máximos para escala de cores
    const maxTotal = Math.max(...data.map(d => d.clicks + d.views), 1);

    // Escala de cores
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxTotal]);

    // Desenhar países
    svg.selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', (d: Feature<Geometry, any>) => {
        const countryName = d.properties?.NAME || d.properties?.name || '';
        const normalizedName = normalizeCountryName(countryName);
        const countryData = countryMap.get(normalizedName);
        
        if (countryData) {
          const total = countryData.clicks + countryData.views;
          return colorScale(total);
        }
        return '#f0f0f0';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d: Feature<Geometry, any>) {
        const countryName = d.properties?.NAME || d.properties?.name || '';
        const normalizedName = normalizeCountryName(countryName);
        const countryData = countryMap.get(normalizedName);
        
        d3.select(this).attr('stroke-width', 2);
        
        const [mouseX, mouseY] = d3.pointer(event, svgRef.current);
        
        let content = `<strong>${countryName}</strong><br/>`;
        if (countryData) {
          content += `Cliques: ${countryData.clicks}<br/>`;
          content += `Views: ${countryData.views}<br/>`;
          content += `Total: ${countryData.clicks + countryData.views}`;
        } else {
          content += 'Sem dados disponíveis';
        }
        
        setTooltip({
          visible: true,
          x: mouseX,
          y: mouseY,
          content
        });
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 0.5);
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
      });

  }, [worldData, data, width, height]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Mapa Mundial de Interações</h2>
        <p className="text-sm text-gray-600">Visualização geográfica dos cliques e visualizações por país</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Mapa Mundial */}
        <div className="xl:col-span-2 relative">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="border border-gray-200 rounded-lg w-full h-auto max-w-full"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          />
          
          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute bg-gray-800 text-white p-2 rounded shadow-lg pointer-events-none z-10 text-sm"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)'
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
          )}
        </div>

        {/* Tabela de Países */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Dados por País</h3>
            </div>
            <div className="p-4">
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
                        .sort((a, b) => (b.clicks + b.views) - (a.clicks + a.views))
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
                          <div className="flex flex-col items-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Nenhum dado disponível
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapD3;