import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso con successo.",
    });
    navigate('/');
  };

  return (
    <header className="bg-elegant-anthracite text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-montserrat font-bold text-spice-red">
              Spice & Serve
            </h1>
            <span className="text-sm font-roboto opacity-75">
              | Dashboard Coupon
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm font-roboto">
              <User className="h-4 w-4" />
              <span>Amministratore</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-elegant-anthracite-light"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-elegant-anthracite-light"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};