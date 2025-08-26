import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ChefHat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: 'Errore di accesso',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Accesso effettuato!',
        description: 'Benvenuto su Kebab JJ.',
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-smoke-gray font-roboto relative overflow-hidden">
  {/* Background Hero Image rimossa perché il file non esiste più */}
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
                Kebab JJ
              </h1>
            </div>
            <p className="text-elegant-anthracite/70 font-roboto text-lg">
              Il portale dei coupon Kebab JJ
            </p>
          </div>
          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-montserrat font-semibold text-center text-elegant-anthracite">
                Accedi al portale
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Inserisci le tue credenziali per accedere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="border p-2 rounded"
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="border p-2 rounded"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading} className="bg-primary text-white p-2 rounded">
                  {loading ? 'Accesso...' : 'Accedi'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;