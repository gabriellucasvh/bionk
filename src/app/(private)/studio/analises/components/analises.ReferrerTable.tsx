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
import { Globe, Instagram, Twitter, Facebook, Youtube, Linkedin, MessageCircle, Search, HelpCircle, ExternalLink, WalletCards, TrendingUp } from 'lucide-react';

interface ReferrerAnalytics {
  referrer: string;
  views: number;
  clicks: number;
  totalInteractions: number;
}

interface ReferrerTableProps {
  data: ReferrerAnalytics[];
  isLoading?: boolean;
}

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

export default function ReferrerTable({ data, isLoading }: ReferrerTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-5 w-5" />
            Detalhes por Origem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="w-24 h-4 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-4">
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
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
            <WalletCards className="h-5 w-5" />
            Detalhes por Origem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhum dado disponível</p>
            <p className="text-sm text-muted-foreground mt-2">
              Os dados de origem aparecerão aqui quando houver interações
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular totais para percentuais
  const totalInteractions = data.reduce((sum, item) => sum + item.totalInteractions, 0);
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);

  // Ordenar por total de interações (decrescente)
  const sortedData = [...data].sort((a, b) => b.totalInteractions - a.totalInteractions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Detalhes por Origem
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise detalhada do tráfego por fonte de origem
        </p>
      </CardHeader>
      <CardContent>
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
                           item.referrer === 'unknown' ? 'Desconhecido' :
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
      </CardContent>
    </Card>
  );
}
