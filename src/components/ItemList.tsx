
import React, { useState } from "react";
import { Item, Category } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import CategorySelect from "./CategorySelect";
import { useLists } from "@/context/ListContext";

interface ItemListProps {
  listId: string;
  items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ listId, items }) => {
  const { toggleItemCheck, removeItem, updateItem } = useLists();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Item>>({});
  
  // Agrupar por categoria
  const groupedItems: Record<Category, Item[]> = {
    "Alimentação": [],
    "Limpeza": [],
    "Higiene": [],
    "Bebidas": [],
    "Congelados": [],
    "Outros": []
  };
  
  items.forEach(item => {
    if (groupedItems[item.category]) {
      groupedItems[item.category].push(item);
    } else {
      groupedItems["Outros"].push(item);
    }
  });
  
  const startEditing = (item: Item) => {
    setEditingItemId(item.id);
    setEditForm({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      category: item.category
    });
  };
  
  const saveEdit = (item: Item) => {
    updateItem(listId, {
      ...item,
      name: editForm.name || item.name,
      quantity: editForm.quantity || item.quantity,
      price: editForm.price,
      category: editForm.category || item.category
    });
    setEditingItemId(null);
  };
  
  const getCategoryIcon = (category: Category): string => {
    switch (category) {
      case "Alimentação": return "🍎";
      case "Bebidas": return "🥤";
      case "Limpeza": return "🧹";
      case "Higiene": return "🧼";
      case "Congelados": return "❄️";
      case "Outros": return "📦";
    }
  };
  
  // Renderizar apenas categorias que têm itens
  const categoriesToRender = Object.entries(groupedItems)
    .filter(([_, categoryItems]) => categoryItems.length > 0) as [Category, Item[]][];
  
  return (
    <div className="space-y-6">
      {categoriesToRender.map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <h3 className="font-medium flex items-center text-sm text-muted-foreground">
            <span className="mr-2">{getCategoryIcon(category)}</span>
            {category}
          </h3>
          <div className="space-y-2 pl-2">
            {categoryItems.map(item => (
              <div 
                key={item.id} 
                className={`p-3 rounded-md border ${
                  item.checked ? "bg-muted/50 border-muted" : "bg-background border-border"
                } transition-colors`}
              >
                {editingItemId === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.name || ""}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        type="number"
                        value={editForm.quantity || 0}
                        onChange={e => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })}
                        min={1}
                      />
                      <Input
                        type="number"
                        value={editForm.price || ""}
                        onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        placeholder="Preço (R$)"
                        step="0.01"
                      />
                    </div>
                    <CategorySelect
                      value={editForm.category as Category || item.category}
                      onChange={(category) => setEditForm({ ...editForm, category })}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingItemId(null)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => saveEdit(item)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Checkbox 
                      checked={item.checked} 
                      onCheckedChange={() => toggleItemCheck(listId, item.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className={`${item.checked ? "line-through text-muted-foreground" : ""}`}>
                        {item.name}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>{item.quantity} {item.quantity > 1 ? "unids" : "unid"}</span>
                        {item.price && (
                          <span className="ml-2">
                            • R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEditing(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(listId, item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum item na lista ainda. Adicione produtos acima!</p>
        </div>
      )}
    </div>
  );
};

export default ItemList;
