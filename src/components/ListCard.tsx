
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingList } from "@/types";
import { ShoppingCart, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ListCardProps {
  list: ShoppingList;
}

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  const navigate = useNavigate();
  const totalItems = list.items.length;
  const checkedItems = list.items.filter(item => item.checked).length;
  
  const handleClick = () => {
    navigate(`/list/${list.id}`);
  };

  // Mapeamento de cores para classes Tailwind
  const colorClasses: Record<string, { border: string, shadow: string }> = {
    green: { border: "border-green-500", shadow: "shadow-green-100" },
    blue: { border: "border-blue-500", shadow: "shadow-blue-100" },
    purple: { border: "border-purple-500", shadow: "shadow-purple-100" },
    orange: { border: "border-orange-500", shadow: "shadow-orange-100" },
    pink: { border: "border-pink-500", shadow: "shadow-pink-100" }
  };

  const colorClass = colorClasses[list.color] || colorClasses.green;

  return (
    <Card 
      onClick={handleClick}
      className={`border-l-4 ${colorClass.border} cursor-pointer hover:shadow-md transition-shadow ${colorClass.shadow} animate-fade-in`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium">{list.title}</h3>
          <Badge variant="outline" className="ml-1">
            R$ {list.totalPrice?.toFixed(2) || '0.00'}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <ShoppingCart className="h-4 w-4 mr-1" />
          <span>{checkedItems} de {totalItems} itens</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {format(new Date(list.createdAt), "d 'de' MMM", { locale: ptBR })}
          </span>
        </div>
        
        {list.sharedWith?.length > 0 && (
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>Compartilhada ({list.sharedWith.length})</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ListCard;
