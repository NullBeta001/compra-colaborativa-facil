
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowUp } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  return (
    <nav className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {!isHome ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ArrowUp className="h-5 w-5 rotate-270 transform -rotate-90" />
            </Button>
          ) : (
            <ShoppingCart className="h-6 w-6 text-primary" />
          )}
          <h1 className="text-xl font-semibold">
            {isHome ? "Lista Inteligente" : ""}
          </h1>
        </div>
        
        {isHome && (
          <Button
            onClick={() => navigate("/create")}
            className="bg-primary hover:bg-primary/90"
          >
            Nova Lista
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
