
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ShoppingList, Item, Category } from "@/types";
import { mockLists, generateId } from "@/utils/mockData";
import { useToast } from "@/components/ui/use-toast";

interface ListContextType {
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  setCurrentList: (list: ShoppingList | null) => void;
  createList: (title: string, color: ShoppingList["color"]) => ShoppingList;
  addItemToList: (listId: string, item: Omit<Item, "id">) => void;
  updateItem: (listId: string, item: Item) => void;
  toggleItemCheck: (listId: string, itemId: string) => void;
  removeItem: (listId: string, itemId: string) => void;
  shareList: (listId: string, userId: string) => void;
  deleteList: (listId: string) => void;
  updateListTotal: (listId: string) => void;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<ShoppingList[]>(mockLists);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load from localStorage in a real app
    // const savedLists = localStorage.getItem('shopping-lists');
    // if (savedLists) {
    //   setLists(JSON.parse(savedLists));
    // }
  }, []);

  useEffect(() => {
    // Save to localStorage in a real app
    // localStorage.setItem('shopping-lists', JSON.stringify(lists));
  }, [lists]);

  const createList = (title: string, color: ShoppingList["color"]): ShoppingList => {
    const newList: ShoppingList = {
      id: `list-${generateId()}`,
      title,
      createdAt: new Date(),
      items: [],
      sharedWith: [],
      color,
      totalPrice: 0
    };

    setLists((prev) => [...prev, newList]);
    toast({
      title: "Lista criada",
      description: `A lista "${title}" foi criada com sucesso.`
    });
    return newList;
  };

  const addItemToList = (listId: string, itemData: Omit<Item, "id">) => {
    const item: Item = {
      ...itemData,
      id: `item-${generateId()}`
    };

    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          const updatedList = {
            ...list,
            items: [...list.items, item]
          };
          return updatedList;
        }
        return list;
      })
    );
    
    // Update the total after adding an item
    updateListTotal(listId);
    
    toast({
      title: "Item adicionado",
      description: `${itemData.name} foi adicionado à lista.`
    });
  };

  const updateItem = (listId: string, updatedItem: Item) => {
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          const updatedItems = list.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          );
          
          return {
            ...list,
            items: updatedItems
          };
        }
        return list;
      })
    );
    
    // Update the total after modifying an item
    updateListTotal(listId);
  };

  const toggleItemCheck = (listId: string, itemId: string) => {
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          const updatedItems = list.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          );
          
          return {
            ...list,
            items: updatedItems
          };
        }
        return list;
      })
    );
  };

  const removeItem = (listId: string, itemId: string) => {
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter((item) => item.id !== itemId)
          };
        }
        return list;
      })
    );
    
    // Update the total after removing an item
    updateListTotal(listId);
    
    toast({
      title: "Item removido",
      description: "O item foi removido da lista."
    });
  };

  const shareList = (listId: string, userId: string) => {
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId && !list.sharedWith.includes(userId)) {
          return {
            ...list,
            sharedWith: [...list.sharedWith, userId]
          };
        }
        return list;
      })
    );
    
    toast({
      title: "Lista compartilhada",
      description: "O convite foi enviado com sucesso."
    });
  };

  const deleteList = (listId: string) => {
    setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
    
    toast({
      title: "Lista excluída",
      description: "A lista foi excluída permanentemente."
    });
  };

  const updateListTotal = (listId: string) => {
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          const totalPrice = list.items.reduce((acc, item) => {
            return acc + (item.price || 0) * item.quantity;
          }, 0);
          
          return {
            ...list,
            totalPrice
          };
        }
        return list;
      })
    );
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        currentList,
        setCurrentList,
        createList,
        addItemToList,
        updateItem,
        toggleItemCheck,
        removeItem,
        shareList,
        deleteList,
        updateListTotal
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error("useLists must be used within a ListProvider");
  }
  return context;
};
