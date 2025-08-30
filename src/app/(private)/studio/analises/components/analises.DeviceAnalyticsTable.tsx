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
import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';

interface DeviceAnalytics {
  device: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface DeviceAnalyticsTableProps {
  data: DeviceAnalytics[];
  isLoading?: boolean;
}

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

export default function DeviceAnalyticsTable({ data, isLoading }: DeviceAnalyticsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics por Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Analytics por Dispositivo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualizações e cliques categorizados por tipo de dispositivo
        </p>
      </CardHeader>
      <CardContent>
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(item.device)}
                      <Badge variant={getDeviceBadgeVariant(item.device)} className="text-xs">
                        {getDeviceLabel(item.device)}
                      </Badge>
                    </div>
                    {/* Mobile view - show stats below device name */}
                    <div className="sm:hidden mt-2 text-xs text-muted-foreground space-y-1">
                      <div>Views: {item.views.toLocaleString()} | Clicks: {item.clicks.toLocaleString()}</div>
                      <div className="md:hidden">Porcentagem: {percentage}%</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium hidden sm:table-cell">
                    {item.views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-medium hidden sm:table-cell">
                    {item.clicks.toLocaleString()}
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

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de dispositivo disponível ainda.</p>
            <p className="text-sm">Os dados aparecerão conforme as interações forem registradas.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
