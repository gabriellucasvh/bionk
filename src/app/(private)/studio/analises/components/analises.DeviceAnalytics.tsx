'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Smartphone, Monitor, Tablet, HelpCircle, PictureInPicture2 } from 'lucide-react';

interface DeviceAnalytics {
  device: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface DeviceAnalyticsProps {
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
      return 'Outros';
    default:
      return device;
  }
};

const getDeviceBadgeVariant = (device: string) => {
  switch (device.toLowerCase()) {
    case 'mobile':
      return 'default';
    case 'desktop':
      return 'secondary';
    case 'tablet':
      return 'outline';
    default:
      return 'destructive';
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

export default function DeviceAnalytics({ data, isLoading }: DeviceAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PictureInPicture2 className="h-5 w-5" />
            Analytics por Dispositivo
          </CardTitle>
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
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

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
            <PictureInPicture2 className="h-5 w-5" />
            Analytics por Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <PictureInPicture2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
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
          <PictureInPicture2 className="h-5 w-5" />
          Analytics por Dispositivo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição de visualizações e cliques por tipo de dispositivo
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico */}
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

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Dispositivo</TableHead>
                <TableHead className="text-right min-w-[80px] hidden sm:table-cell">Visualizações</TableHead>
                <TableHead className="text-right min-w-[80px] hidden sm:table-cell">Cliques</TableHead>
                <TableHead className="text-right min-w-[80px]">Total</TableHead>
                <TableHead className="text-right min-w-[80px] hidden md:table-cell">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const percentage = totalViews + totalClicks > 0
                  ? ((item.totalInteractions / (totalViews + totalClicks)) * 100).toFixed(1)
                  : '0.0';

                return (
                  <TableRow key={item.device}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(item.device)}
                        <span>{getDeviceLabel(item.device)}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: DEVICE_COLORS[item.device as keyof typeof DEVICE_COLORS] || DEVICE_COLORS.unknown
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {item.views.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {item.clicks.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.totalInteractions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground hidden md:table-cell">
                      {percentage}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Resumo estatístico */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
        <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-amber-600">
              {chartData.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Tipos de Dispositivo</div>
          </div>

          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {totalViews.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Visualizações</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Cliques</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {totalInteractions.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total de Interações</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
