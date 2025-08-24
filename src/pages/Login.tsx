import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import heroImage from '@/assets/hero-grilled-meat.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulazione autenticazione
    setTimeout(() => {
      if (username === 'admin' && password === 'spice2024') {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: "Accesso effettuato!",
          description: "Benvenuto nel sistema di gestione coupon.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Accesso negato",
          description: "Credenziali non valide. Riprova.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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
            <h1 className="text-4xl font-montserrat font-bold text-spice-red mb-2">
              Spice & Serve
            </h1>
            <p className="text-elegant-anthracite/70 font-roboto">
              Sistema di Gestione Coupon
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-montserrat font-semibold text-center text-elegant-anthracite">
                Accedi al Pannello
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Inserisci le tue credenziali per continuare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-roboto font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Inserisci username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 font-roboto border-smoke-gray-dark focus:border-spice-red focus:ring-spice-red"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-roboto font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Inserisci password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 font-roboto border-smoke-gray-dark focus:border-spice-red focus:ring-spice-red"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-spice-red hover:bg-spice-red-dark text-white font-montserrat font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>
              
              {/* Demo Credentials */}
              <div className="mt-6 p-3 bg-mint-green/10 rounded-lg border border-mint-green/20">
                <p className="text-xs font-roboto text-elegant-anthracite/70 text-center">
                  <strong>Demo:</strong> Username: admin | Password: spice2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;