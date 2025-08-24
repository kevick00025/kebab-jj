import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockCoupons, mockStats, type Coupon } from '@/data/mockData';
import { CouponForm } from '@/components/CouponForm';
import { CouponList } from '@/components/CouponList';
import { StatsSection } from '@/components/StatsSection';
import { Header } from '@/components/Header';
import { Plus, TicketIcon, TrendingUp, Calendar, Users } from 'lucide-react';

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
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            onClick={() => setActiveSection('overview')}
            variant={activeSection === 'overview' ? 'default' : 'outline'}
            className="font-montserrat"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Panoramica
          </Button>
          <Button
            onClick={() => setActiveSection('create')}
            variant={activeSection === 'create' ? 'default' : 'outline'}
            className="font-montserrat"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crea Coupon
          </Button>
          <Button
            onClick={() => setActiveSection('manage')}
            variant={activeSection === 'manage' ? 'default' : 'outline'}
            className="font-montserrat"
          >
            <TicketIcon className="mr-2 h-4 w-4" />
            Gestisci Coupon
          </Button>
          <Button
            onClick={() => setActiveSection('stats')}
            variant={activeSection === 'stats' ? 'default' : 'outline'}
            className="font-montserrat"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Statistiche
          </Button>
        </div>

        {/* Content Sections */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-spice-red to-spice-red-dark text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-roboto font-medium opacity-90">
                    Coupon Totali
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-montserrat font-bold">
                    {coupons.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-turmeric-yellow to-turmeric-yellow-dark text-elegant-anthracite">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-roboto font-medium opacity-90">
                    Coupon Attivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-montserrat font-bold">
                    {activeCoupons.length}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-mint-green to-mint-green-light text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-roboto font-medium opacity-90">
                    Riscatti Totali
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-montserrat font-bold">
                    {mockStats.totalRedemptions}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-roboto font-medium text-muted-foreground">
                    Crescita Mensile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-montserrat font-bold text-mint-green">
                    +{mockStats.monthlyGrowth}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Coupons */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="font-montserrat text-elegant-anthracite">
                  Coupon Recenti
                </CardTitle>
                <CardDescription>
                  Gli ultimi coupon creati nel sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coupons.slice(0, 3).map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 bg-smoke-gray rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-montserrat font-semibold text-elegant-anthracite">
                          {coupon.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Codice: <span className="font-mono font-medium">{coupon.code}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                          {coupon.status === 'active' ? 'Attivo' : 'Scaduto'}
                        </Badge>
                        <span className="text-sm font-medium text-spice-red">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `€${coupon.discountValue}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
  );
};

export default Dashboard;