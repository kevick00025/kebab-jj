import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCoupons, mockStats, type Coupon } from '@/data/mockData';
import { CouponForm } from '@/components/CouponForm';
import { CouponList } from '@/components/CouponList';
import { StatsSection } from '@/components/StatsSection';
import { Header } from '@/components/Header';
import { Plus, TicketIcon, TrendingUp, Calendar, Users, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'create' | 'manage' | 'stats'>('overview');
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  
  const addCoupon = (newCoupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>) => {
    const coupon: Coupon = {
      ...newCoupon,
      id: (coupons.length + 1).toString(),
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setCoupons([coupon, ...coupons]);
    setActiveSection('manage');
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    setCoupons(coupons.map(c => c.id === updatedCoupon.id ? updatedCoupon : c));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const expiredCoupons = coupons.filter(c => c.status === 'expired');

  return (
    <div className="min-h-screen bg-smoke-gray font-roboto">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile-First Navigation */}
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-3 mb-6 md:mb-8">
          <Button
            onClick={() => setActiveSection('overview')}
            variant={activeSection === 'overview' ? 'default' : 'outline'}
            className="font-montserrat h-12 lg:h-10 text-sm lg:text-base"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Panoramica</span>
            <span className="sm:hidden">Home</span>
          </Button>
          <Button
            onClick={() => setActiveSection('create')}
            variant={activeSection === 'create' ? 'default' : 'outline'}
            className="font-montserrat h-12 lg:h-10 text-sm lg:text-base"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Crea Coupon</span>
            <span className="sm:hidden">Crea</span>
          </Button>
          <Button
            onClick={() => setActiveSection('manage')}
            variant={activeSection === 'manage' ? 'default' : 'outline'}
            className="font-montserrat h-12 lg:h-10 text-sm lg:text-base"
          >
            <TicketIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Gestisci Coupon</span>
            <span className="sm:hidden">Gestisci</span>
          </Button>
          <Button
            onClick={() => setActiveSection('stats')}
            variant={activeSection === 'stats' ? 'default' : 'outline'}
            className="font-montserrat h-12 lg:h-10 text-sm lg:text-base"
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Statistiche</span>
            <span className="sm:hidden">Stats</span>
          </Button>
        </div>

        {/* Content Sections */}
        <div className="animate-fade-in">
          {activeSection === 'overview' && (
            <div className="space-y-6 md:space-y-8">
              {/* Quick Stats Cards - Mobile Optimized */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-spice-red to-spice-red-dark text-white hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                    <CardTitle className="text-xs md:text-sm font-roboto font-medium opacity-90">
                      Coupon Totali
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-2xl md:text-3xl font-montserrat font-bold">
                      {coupons.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-turmeric-yellow to-turmeric-yellow-dark text-elegant-anthracite hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                    <CardTitle className="text-xs md:text-sm font-roboto font-medium opacity-90">
                      Coupon Attivi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-2xl md:text-3xl font-montserrat font-bold">
                      {activeCoupons.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-mint-green to-mint-green-light text-white hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                    <CardTitle className="text-xs md:text-sm font-roboto font-medium opacity-90">
                      Riscatti Totali
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-2xl md:text-3xl font-montserrat font-bold">
                      {mockStats.totalRedemptions}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
                    <CardTitle className="text-xs md:text-sm font-roboto font-medium text-muted-foreground">
                      Crescita Mensile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 md:px-6">
                    <div className="text-2xl md:text-3xl font-montserrat font-bold text-mint-green">
                      +{mockStats.monthlyGrowth}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Coupons - Mobile Optimized */}
              <Card className="shadow-lg border-0">
                <CardHeader className="px-4 md:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-montserrat text-elegant-anthracite text-lg md:text-xl">
                        Coupon Recenti
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Gli ultimi coupon creati nel sistema
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSection('manage')}
                      className="hidden md:flex"
                    >
                      Vedi tutti
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="space-y-3 md:space-y-4">
                    {coupons.slice(0, 3).map((coupon) => (
                      <div key={coupon.id} className="flex items-center justify-between p-3 md:p-4 bg-smoke-gray rounded-lg hover:bg-smoke-gray-dark transition-colors">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-montserrat font-semibold text-elegant-anthracite text-sm md:text-base truncate">
                            {coupon.title}
                          </h4>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Codice: <span className="font-mono font-medium">{coupon.code}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge 
                            variant={coupon.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {coupon.status === 'active' ? 'Attivo' : 'Scaduto'}
                          </Badge>
                          <span className="text-sm font-medium text-spice-red whitespace-nowrap">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mobile View All Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-4 md:hidden"
                    onClick={() => setActiveSection('manage')}
                  >
                    Vedi tutti i coupon
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'create' && (
            <CouponForm onSave={addCoupon} />
          )}

          {activeSection === 'manage' && (
            <CouponList 
              coupons={coupons} 
              onUpdate={updateCoupon}
              onDelete={deleteCoupon}
            />
          )}

          {activeSection === 'stats' && (
            <StatsSection 
              coupons={coupons}
              stats={mockStats}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;