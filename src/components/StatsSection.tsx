import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Users, Target, Award } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

interface StatsSectionProps {
  coupons: Database['public']['Tables']['coupons']['Row'][];
  stats: {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    totalRedemptions: number;
    monthlyGrowth: number;
  };
}

export const StatsSection = ({ coupons, stats }: StatsSectionProps) => {
  const activeCoupons = coupons.filter(c => c.status === 'active' || c.is_active);
  const expiredCoupons = coupons.filter(c => c.status === 'expired');
  const totalUsage = coupons.reduce((sum, coupon) => sum + (coupon.usage_count || 0), 0);
  const averageUsage = coupons.length > 0 ? Math.round(totalUsage / coupons.length) : 0;

  // Top performing coupons
  const topCoupons = [...coupons]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5);

  // Monthly data (mock)
  const monthlyData = [
    { month: 'Gen', coupons: 12, usage: 234 },
    { month: 'Feb', coupons: 15, usage: 289 },
    { month: 'Mar', coupons: 18, usage: 345 },
    { month: 'Apr', coupons: 22, usage: 412 },
    { month: 'Mag', coupons: 25, usage: 456 },
    { month: 'Giu', coupons: 28, usage: 523 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-montserrat font-bold text-elegant-anthracite mb-2">
          Statistiche e Analisi
        </h2>
        <p className="text-muted-foreground font-roboto">
          Panoramica completa delle performance dei tuoi coupon
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-roboto font-medium text-muted-foreground">
                Coupon Totali
              </CardTitle>
              <Target className="h-4 w-4 text-spice-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-montserrat font-bold text-elegant-anthracite">
              {coupons.length}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-mint-green mr-1" />
              <span className="text-mint-green font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">vs mese scorso</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-roboto font-medium text-muted-foreground">
                Riscatti Totali
              </CardTitle>
              <Users className="h-4 w-4 text-turmeric-yellow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-montserrat font-bold text-elegant-anthracite">
              {totalUsage}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-mint-green mr-1" />
              <span className="text-mint-green font-medium">+{stats.monthlyGrowth}%</span>
              <span className="text-muted-foreground ml-1">crescita mensile</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-roboto font-medium text-muted-foreground">
                Media Utilizzi
              </CardTitle>
              <Award className="h-4 w-4 text-mint-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-montserrat font-bold text-elegant-anthracite">
              {averageUsage}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-muted-foreground">per coupon</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-roboto font-medium text-muted-foreground">
                Tasso Attivi
              </CardTitle>
              <Calendar className="h-4 w-4 text-spice-red" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-montserrat font-bold text-elegant-anthracite">
              {Math.round((activeCoupons.length / coupons.length) * 100)}%
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-mint-green font-medium">{activeCoupons.length}</span>
              <span className="text-muted-foreground ml-1">coupon attivi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Coupons */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="font-montserrat text-elegant-anthracite">
              Top Coupon per Utilizzi
            </CardTitle>
            <CardDescription>
              I coupon più utilizzati dai tuoi clienti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCoupons.map((coupon, index) => (
                <div key={coupon.id} className="flex items-center justify-between p-3 bg-smoke-gray rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-spice-red text-white rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-montserrat font-semibold text-elegant-anthracite">
                        {coupon.title}
                      </h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {coupon.code}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-montserrat font-bold text-spice-red">
                      {coupon.usage_count}
                    </div>
                    <div className="text-xs text-muted-foreground">utilizzi</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="font-montserrat text-elegant-anthracite">
              Andamento Mensile
            </CardTitle>
            <CardDescription>
              Creazione coupon e utilizzi negli ultimi 6 mesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <div className="font-roboto font-medium text-elegant-anthracite">
                    {month.month}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-turmeric-yellow">{month.coupons}</span> coupon
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-mint-green">{month.usage}</span> utilizzi
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-spice-red/10 to-turmeric-yellow/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-roboto font-medium text-elegant-anthracite">
                  Crescita Media Mensile
                </span>
                <div className="flex items-center text-mint-green">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-montserrat font-bold">+{stats.monthlyGrowth}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="font-montserrat text-elegant-anthracite">
            Distribuzione per Stato
          </CardTitle>
          <CardDescription>
            Suddivisione dei coupon per stato attuale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-mint-green/10 rounded-lg border border-mint-green/20">
              <div className="text-3xl font-montserrat font-bold text-mint-green mb-2">
                {activeCoupons.length}
              </div>
              <Badge className="bg-mint-green text-white">
                Coupon Attivi
              </Badge>
            </div>
            
            <div className="text-center p-6 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-3xl font-montserrat font-bold text-destructive mb-2">
                {expiredCoupons.length}
              </div>
              <Badge variant="destructive">
                Coupon Scaduti
              </Badge>
            </div>
            
            <div className="text-center p-6 bg-muted/50 rounded-lg border border-muted">
              <div className="text-3xl font-montserrat font-bold text-muted-foreground mb-2">
                {coupons.filter(c => c.status === 'archived').length}
              </div>
              <Badge variant="secondary">
                Coupon Archiviati
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};