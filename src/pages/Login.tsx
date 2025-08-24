import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-grilled-meat.jpg';
import { ArrowRight, ChefHat } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Accesso automatico senza credenziali dopo 2 secondi
    const timer = setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      toast({
        title: "Accesso effettuato!",
        description: "Benvenuto nel sistema di gestione coupon.",
      });
      navigate('/dashboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDirectAccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    toast({
      title: "Accesso effettuato!",
      description: "Benvenuto nel sistema di gestione coupon.",
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-smoke-gray font-roboto relative overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-smoke-gray/90 to-background/95" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="h-12 w-12 text-spice-red mr-2" />
              <h1 className="text-4xl font-montserrat font-bold text-spice-red">
                Spice & Serve
              </h1>
            </div>
            <p className="text-elegant-anthracite/70 font-roboto text-lg">
              Sistema di Gestione Coupon
            </p>
          </div>

          {/* Welcome Card */}
          <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-montserrat font-semibold text-center text-elegant-anthracite">
                Benvenuto nella Demo
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Il sistema si avvierà automaticamente o puoi procedere manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Access Info */}
              <div className="text-center p-4 bg-mint-green/10 rounded-lg border border-mint-green/20">
                <p className="text-sm font-roboto text-elegant-anthracite/80">
                  ⏱️ <strong>Accesso automatico in corso...</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verrai reindirizzato alla dashboard tra pochi secondi
                </p>
              </div>

              {/* Manual Access Button */}
              <Button
                onClick={handleDirectAccess}
                className="w-full h-12 bg-spice-red hover:bg-spice-red-dark text-white font-montserrat font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Accedi Subito alla Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* Features Preview */}
              <div className="space-y-3">
                <h4 className="font-montserrat font-semibold text-elegant-anthracite text-center">
                  Funzionalità Disponibili:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm font-roboto">
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-spice-red rounded-full mr-2"></div>
                    Crea Coupon
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-turmeric-yellow rounded-full mr-2"></div>
                    Gestisci Promozioni
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-mint-green rounded-full mr-2"></div>
                    Statistiche
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-2 h-2 bg-elegant-anthracite rounded-full mr-2"></div>
                    Report Avanzati
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;