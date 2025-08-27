import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-smoke-gray font-roboto px-2">
      <div className="text-center w-full max-w-md mx-auto p-4 sm:p-8 bg-background/95 rounded-xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl font-montserrat font-bold text-spice-red mb-4">404</h1>
          <h2 className="text-xl sm:text-2xl font-montserrat font-semibold text-elegant-anthracite mb-2">
            Pagina Non Trovata
          </h2>
          <p className="text-muted-foreground font-roboto text-base sm:text-lg">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </div>
        <div className="space-y-4">
          <Button 
            asChild
            className="bg-spice-red hover:bg-spice-red-dark text-white font-montserrat font-semibold text-base sm:text-lg w-full py-3"
          >
            <Link to="/">
              Torna al Login
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline"
            className="border-spice-red text-spice-red hover:bg-spice-red hover:text-white font-montserrat text-base sm:text-lg w-full py-3"
          >
            <Link to="/dashboard">
              Vai alla Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
