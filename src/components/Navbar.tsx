
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLists } from '@/context/ListContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useLists();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/auth');
    }
  };

  return (
    <header className="border-b">
      <div className="container px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <ShoppingCart className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold text-lg">Lista Inteligente</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
