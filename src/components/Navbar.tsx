import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ferryLogo from "@/assets/ferry-logo.png";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = location.pathname.includes("/dashboard") || 
                     location.pathname.includes("/reservar") ||
                     location.pathname.includes("/notificacoes") ||
                     location.pathname.includes("/status") ||
                     location.pathname.includes("/relatar");

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3">
          <img src={ferryLogo} alt="Ferrysmart" className="h-12 w-12" />
          <span className="font-bold text-xl">Ferrysmart</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="ghost" onClick={handleLogout}>
              Sair
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Criar Conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
