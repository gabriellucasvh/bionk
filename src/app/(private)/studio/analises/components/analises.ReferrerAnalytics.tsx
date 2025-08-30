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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Globe, Instagram, Twitter, Facebook, Youtube, Linkedin, MessageCircle, Search, HelpCircle, ExternalLink, Radar, TrendingUp } from 'lucide-react';

interface ReferrerAnalytics {
  referrer: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface ReferrerAnalyticsProps {
  data: ReferrerAnalytics[];
  isLoading?: boolean;
}

const REFERRER_COLORS = {
  'Instagram': '#E4405F',
  'TikTok': '#000000',
  'Twitter/X': '#1DA1F2',
  'Facebook': '#1877F2',
  'YouTube': '#FF0000',
  'LinkedIn': '#0A66C2',
  'WhatsApp': '#25D366',
  'Telegram': '#0088CC',
  'Discord': '#5865F2',
  'Reddit': '#FF4500',
  'Pinterest': '#BD081C',
  'Google': '#4285F4',
  'Bing': '#00809D',
  'DuckDuckGo': '#DE5833',
  'Yahoo': '#720E9E',
  'direct': '#10b981',
  'unknown': '#6b7280',
  'other': '#8b5cf6'
};

const getReferrerIcon = (referrer: string) => {
  switch (referrer) {
    case 'Instagram':
      return <Instagram className="h-4 w-4" />;
    case 'Twitter/X':
      return <Twitter className="h-4 w-4" />;
    case 'Facebook':
      return <Facebook className="h-4 w-4" />;
    case 'YouTube':
      return <Youtube className="h-4 w-4" />;
    case 'LinkedIn':
      return <Linkedin className="h-4 w-4" />;
    case 'WhatsApp':
    case 'Telegram':
    case 'Discord':
      return <MessageCircle className="h-4 w-4" />;
    case 'Google':
    case 'Bing':
    case 'DuckDuckGo':
    case 'Yahoo':
      return <Search className="h-4 w-4" />;
    case 'direct':
      return <Globe className="h-4 w-4" />;
    case 'unknown':
      return <HelpCircle className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
};

const getReferrerLabel = (referrer: string) => {
  switch (referrer) {
    case 'direct':
      return 'Acesso Direto';
    case 'unknown':
      return 'Outros';
    default:
      return referrer;
  }
};

const getReferrerColor = (referrer: string): string => {
  return REFERRER_COLORS[referrer as keyof typeof REFERRER_COLORS] || REFERRER_COLORS.other;
};

const getReferrerBadgeVariant = (referrer: string) => {
  switch (referrer) {
    case 'Instagram':
    case 'TikTok':
    case 'Facebook':
    case 'Twitter/X':
      return 'default' as const;
    case 'Google':
    case 'Bing':
    case 'DuckDuckGo':
    case 'Yahoo':
      return 'secondary' as const;
    case 'direct':
      return 'outline' as const;
    default:
      return 'secondary' as const;
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {getReferrerIcon(data.referrer)}
          <p className="font-medium">{getReferrerLabel(data.referrer)}</p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium">Cliques:</span> {data.clicks.toLocaleString()}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Visualizações:</span> {data.views.toLocaleString()}
          </p>
          <p className="font-medium">
            <span>Total:</span> {data.totalInteractions.toLocaleString()}
          </p>
          <p className="text-muted-foreground text-xs">
            {((data.totalInteractions / data.total) * 100).toFixed(1)}% do total
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <div className="flex items-center gap-1">
            {getReferrerIcon(entry.payload.referrer)}
            <span className="text-sm">
              {getReferrerLabel(entry.payload.referrer)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ReferrerAnalytics({ data, isLoading }: ReferrerAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Analytics de Origem do Tráfego
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Analytics de Origem do Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Radar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum dado disponível</p>
            <p className="text-sm">Os dados de origem aparecerão aqui quando houver interações</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular totais para percentuais
  const totalInteractions = data.reduce((sum, item) => sum + item.totalInteractions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  // Preparar dados para o gráfico
  const chartData = data.map(item => ({
    ...item,
    name: getReferrerLabel(item.referrer),
    fill: getReferrerColor(item.referrer),
    total: totalInteractions
  }));

  // Ordenar por total de interações (decrescente)
  const sortedData = [...data].sort((a, b) => b.totalInteractions - a.totalInteractions);

  // Determinar se usar gráfico de pizza ou barra baseado na quantidade de dados
  const useBarChart = data.length > 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Analytics de Origem do Tráfego
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          De onde seus visitantes estão vindo - análise completa por origem
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {useBarChart ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalInteractions"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="totalInteractions"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Visualizações</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => {
                const percentage = totalInteractions > 0
                  ? ((item.totalInteractions / totalInteractions) * 100).toFixed(1)
                  : '0.0';

                return (
                  <TableRow key={`${item.referrer}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {getReferrerIcon(item.referrer)}
                        </div>
                        <div>
                          <div className="font-medium">{getReferrerLabel(item.referrer)}</div>
                          <Badge
                            variant={getReferrerBadgeVariant(item.referrer)}
                            className="text-xs mt-1"
                          >
                            {item.referrer === 'direct' ? 'Direto' :
                             item.referrer === 'unknown' ? 'Outros' :
                             item.referrer.includes('Google') || item.referrer.includes('Bing') ? 'Busca' :
                             item.referrer.includes('Instagram') || item.referrer.includes('TikTok') || item.referrer.includes('Facebook') ? 'Social' :
                             'Outros'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {item.totalInteractions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">{percentage}%</span>
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                          />
                        </div>
                      </div>
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
              {data.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Fontes de Tráfego</div>
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
