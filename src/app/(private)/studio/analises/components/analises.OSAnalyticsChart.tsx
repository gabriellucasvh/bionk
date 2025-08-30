'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

interface OSAnalytics {
  os: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface OSAnalyticsChartProps {
  data: OSAnalytics[];
  isLoading?: boolean;
}

const getOSIcon = (os: string) => {
  switch (os.toLowerCase()) {
    case 'ios':
      return <Smartphone className="h-4 w-4" />;
    case 'android':
      return <Smartphone className="h-4 w-4" />;
    case 'windows':
      return <Monitor className="h-4 w-4" />;
    case 'macos':
      return <Monitor className="h-4 w-4" />;
    case 'linux':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

const getOSLabel = (os: string) => {
  switch (os.toLowerCase()) {
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    case 'windows':
      return 'Windows';
    case 'macos':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Desconhecido';
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {getOSIcon(label)}
          <span className="font-medium">{getOSLabel(label)}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-blue-600">Visualizações:</span>
            <span className="font-medium">{payload[0]?.value?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600">Cliques:</span>
            <span className="font-medium">{payload[1]?.value?.toLocaleString() || 0}</span>
          </div>
          <div className="flex justify-between gap-4 border-t pt-1">
            <span>Total:</span>
            <span className="font-semibold">{((payload[0]?.value || 0) + (payload[1]?.value || 0)).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function OSAnalyticsChart({ data, isLoading }: OSAnalyticsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Sistema Operacional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar dados com interações > 0
  const filteredData = data.filter(item => item.totalInteractions > 0);
  const totalInteractions = filteredData.reduce((sum, item) => sum + item.totalInteractions, 0);

  const chartData = filteredData.map(item => ({
    ...item,
    name: getOSLabel(item.os),
    percentage: totalInteractions > 0 ? ((item.totalInteractions / totalInteractions) * 100).toFixed(1) : '0.0'
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Distribuição por Sistema Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum dado disponível</p>
            <p className="text-sm">Os dados aparecerão conforme as interações forem registradas.</p>
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
          Distribuição por Sistema Operacional
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualizações e cliques por sistema operacional (iOS, Android, Desktop)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="views"
                name="Visualizações"
                fill="#3b82f6"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="clicks"
                name="Cliques"
                fill="#10b981"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
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
            <div className="text-xs sm:text-sm text-muted-foreground">Sistemas Operacionais</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
