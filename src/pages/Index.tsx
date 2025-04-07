
import React from "react";
import { useLists } from "@/context/ListContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Plus } from "lucide-react";
import ListCard from "@/components/ListCard";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { lists } = useLists();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-6 mx-auto max-w-md">
        <div className="space-y-6">
          {lists.length > 0 ? (
            <>
              <h2 className="text-lg font-medium">Suas Listas</h2>
              <div className="space-y-4">
                {lists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>
            </>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Crie sua primeira lista</h2>
              <p className="text-muted-foreground">
                Comece criando uma lista de compras para organizar seus produtos.
              </p>
              <Button 
                onClick={() => navigate("/create")}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" /> Nova Lista
              </Button>
            </Card>
          )}
        </div>
      </main>
      
      {lists.length > 0 && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button 
            onClick={() => navigate("/create")} 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
