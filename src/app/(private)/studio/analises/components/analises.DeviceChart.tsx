'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';

interface DeviceAnalytics {
  device: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface DeviceChartProps {
  data: DeviceAnalytics[];
  isLoading?: boolean;
}

const DEVICE_COLORS = {
  mobile: '#3b82f6',    // blue
  desktop: '#10b981',   // green
  tablet: '#f59e0b',    // amber
  unknown: '#6b7280',   // gray
};

const getDeviceIcon = (device: string) => {
  switch (device.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'desktop':
      return <Monitor className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const getDeviceLabel = (device: string) => {
  switch (device.toLowerCase()) {
    case 'mobile':
      return 'Mobile';
    case 'desktop':
      return 'Desktop';
    case 'tablet':
      return 'Tablet';
    case 'unknown':
      return 'Desconhecido';
    default:
      return device;
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {getDeviceIcon(data.device)}
          <span className="font-medium">{getDeviceLabel(data.device)}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span>Visualizações:</span>
            <span className="font-medium">{data.views.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Cliques:</span>
            <span className="font-medium">{data.clicks.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4 border-t pt-1">
            <span>Total:</span>
            <span className="font-semibold">{data.totalInteractions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Porcentagem:</span>
            <span className="font-medium">{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <div className="flex items-center gap-1">
            {getDeviceIcon(entry.payload.device)}
            <span className="text-sm">{getDeviceLabel(entry.payload.device)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DeviceChart({ data, isLoading }: DeviceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar dados com interações > 0 e calcular porcentagens
  const filteredData = data.filter(item => item.totalInteractions > 0);
  const totalInteractions = filteredData.reduce((sum, item) => sum + item.totalInteractions, 0);

  const chartData = filteredData.map(item => ({
    ...item,
    name: getDeviceLabel(item.device),
    percentage: totalInteractions > 0 ? ((item.totalInteractions / totalInteractions) * 100).toFixed(1) : '0.0'
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Distribuição por Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum dado disponível</p>
            <p className="text-sm">Os dados aparecerão conforme as interações forem registradas.</p>
            <p className="text-xs mt-2 opacity-75">Dados anonimizados conforme LGPD</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Distribuição por Dispositivo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de visualizações e cliques por tipo de dispositivo
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="totalInteractions"
                className="sm:!r-[60px] sm:!R-[120px]"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DEVICE_COLORS[entry.device as keyof typeof DEVICE_COLORS] || DEVICE_COLORS.unknown}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo estatístico */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {totalInteractions.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total de Interações</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Visualizações</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {data.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Cliques</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-amber-600">
              {chartData.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Tipos de Dispositivo</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
