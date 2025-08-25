import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Settings, User, Menu } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: "Logout effettuato",
      description: "Sei stato disconnesso con successo.",
    });
    navigate('/');
    setIsOpen(false);
  };

  return (
    <header className="bg-elegant-anthracite text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-montserrat font-bold text-spice-red">
              Kebab JJ
            </h1>
            <span className="hidden sm:inline text-xs md:text-sm font-roboto opacity-75">
              | Dashboard Coupon
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-roboto">
              <User className="h-4 w-4" />
              <span>Amministratore</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-elegant-anthracite-light transition-colors"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-elegant-anthracite-light transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-elegant-anthracite-light"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-elegant-anthracite border-elegant-anthracite-light">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 text-white font-roboto mb-6">
                    <User className="h-5 w-5" />
                    <span>Amministratore</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="justify-start text-white hover:bg-elegant-anthracite-light"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Impostazioni
                  </Button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="justify-start text-white hover:bg-elegant-anthracite-light"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnetti
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};