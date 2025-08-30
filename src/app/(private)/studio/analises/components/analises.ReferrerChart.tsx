'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Globe, Instagram, Twitter, Facebook, Youtube, Linkedin, MessageCircle, Search, HelpCircle, ExternalLink, Radar } from 'lucide-react';

interface ReferrerAnalytics {
  referrer: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface ReferrerChartProps {
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
      return 'Desconhecido';
    default:
      return referrer;
  }
};

const getReferrerColor = (referrer: string): string => {
  return REFERRER_COLORS[referrer as keyof typeof REFERRER_COLORS] || REFERRER_COLORS.other;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          {getReferrerIcon(data.referrer)}
          <p className="font-medium text-gray-900">{getReferrerLabel(data.referrer)}</p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium">Cliques:</span> {data.clicks.toLocaleString()}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Visualizações:</span> {data.views.toLocaleString()}
          </p>
          <p className="text-gray-900 font-medium">
            <span>Total:</span> {data.totalInteractions.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs">
            {((data.totalInteractions / payload[0].payload.total) * 100).toFixed(1)}% do total
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
            <span className="text-sm text-gray-600">
              {getReferrerLabel(entry.payload.referrer)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ReferrerChart({ data, isLoading }: ReferrerChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Origem do Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse">
              <Radar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-center text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Origem do Tráfego
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <Radar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum dado disponível</p>
              <p className="text-sm text-muted-foreground mt-2">
                Os dados de origem aparecerão aqui quando houver interações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map(item => ({
    ...item,
    name: getReferrerLabel(item.referrer),
    fill: getReferrerColor(item.referrer),
    total: data.reduce((sum, d) => sum + d.totalInteractions, 0)
  }));

  // Determinar se usar gráfico de pizza ou barra baseado na quantidade de dados
  const useBarChart = data.length > 6;

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Origem do Tráfego
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{data.length}</p>
            <p className="text-xs text-muted-foreground">Fontes</p>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          De onde seus visitantes estão vindo
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
