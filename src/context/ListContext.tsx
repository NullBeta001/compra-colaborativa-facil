
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ShoppingList, Item, Category } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

interface ListContextType {
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  setCurrentList: (list: ShoppingList | null) => void;
  createList: (title: string, color: ShoppingList["color"]) => Promise<ShoppingList>;
  addItemToList: (listId: string, item: Omit<Item, "id">) => Promise<void>;
  updateItem: (listId: string, item: Item) => Promise<void>;
  toggleItemCheck: (listId: string, itemId: string) => Promise<void>;
  removeItem: (listId: string, itemId: string) => Promise<void>;
  shareList: (listId: string, userId: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  updateListTotal: (listId: string) => Promise<void>;
  loading: boolean;
  user: User | null;
  session: Session | null;
  refreshLists: () => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider = ({ children }: { children: ReactNode }) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Configurando autenticação
  useEffect(() => {
    // Primeiro configuramos o listener de mudança de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setLists([]);
          setCurrentList(null);
          navigate('/auth');
        } else if (event === 'SIGNED_IN') {
          refreshLists();
        }
      }
    );

    // Verificar se há uma sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        refreshLists();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Função para buscar as listas de compras do usuário
  const refreshLists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar listas criadas pelo usuário
      const { data: ownLists, error: ownListsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id);

      if (ownListsError) throw ownListsError;

      // Buscar listas compartilhadas com o usuário
      const { data: sharedListIds, error: sharedError } = await supabase
        .from('list_shares')
        .select('list_id')
        .eq('user_id', user.id);

      if (sharedError) throw sharedError;

      // Se há listas compartilhadas, buscar seus detalhes
      let sharedLists = [];
      if (sharedListIds && sharedListIds.length > 0) {
        const listIds = sharedListIds.map(item => item.list_id);
        const { data: shared, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .in('id', listIds);

        if (error) throw error;
        if (shared) sharedLists = shared;
      }

      // Combinar listas próprias e compartilhadas
      const allListsRaw = [...(ownLists || []), ...sharedLists];
      
      // Buscar itens para cada lista
      const allLists = await Promise.all(allListsRaw.map(async (list) => {
        const { data: items, error: itemsError } = await supabase
          .from('list_items')
          .select('*')
          .eq('list_id', list.id);

        if (itemsError) throw itemsError;

        // Buscar informações de compartilhamento
        const { data: shares, error: sharesError } = await supabase
          .from('list_shares')
          .select('user_id')
          .eq('list_id', list.id);

        if (sharesError) throw sharesError;

        // Montar objeto ShoppingList
        const shoppingList: ShoppingList = {
          id: list.id,
          title: list.title,
          createdAt: new Date(list.created_at),
          color: list.color as ShoppingList["color"],
          totalPrice: parseFloat(list.total_price?.toString() || "0"),
          items: items ? items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price !== null ? Number(item.price) : undefined,
            category: item.category as Category,
            checked: item.checked,
            barcode: item.barcode || undefined
          })) : [],
          sharedWith: shares ? shares.map(s => s.user_id) : []
        };

        return shoppingList;
      }));

      setLists(allLists);
    } catch (error: any) {
      console.error("Erro ao buscar listas:", error.message);
      toast({
        title: "Erro ao carregar listas",
        description: "Não foi possível carregar suas listas de compras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createList = async (title: string, color: ShoppingList["color"]): Promise<ShoppingList> => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Inserir na tabela shopping_lists
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        title,
        color,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar lista",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    if (!data) {
      throw new Error("Falha ao criar lista: nenhum dado retornado");
    }

    // Criar objeto ShoppingList para retorno
    const newList: ShoppingList = {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      color: data.color as ShoppingList["color"],
      totalPrice: 0,
      items: [],
      sharedWith: []
    };

    setLists(prev => [...prev, newList]);
    
    toast({
      title: "Lista criada",
      description: `A lista "${title}" foi criada com sucesso.`
    });
    
    return newList;
  };

  const addItemToList = async (listId: string, itemData: Omit<Item, "id">) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Inserir item na tabela list_items
    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId,
        name: itemData.name,
        quantity: itemData.quantity,
        price: itemData.price || null,
        category: itemData.category,
        checked: itemData.checked,
        barcode: itemData.barcode || null
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao adicionar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    if (!data) {
      throw new Error("Falha ao adicionar item: nenhum dado retornado");
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
          const newItem: Item = {
            id: data.id,
            name: data.name,
            quantity: data.quantity,
            price: data.price !== null ? Number(data.price) : undefined,
            category: data.category as Category,
            checked: data.checked,
            barcode: data.barcode || undefined
          };
          return {
            ...list,
            items: [...list.items, newItem]
          };
        }
        return list;
      })
    );
    
    // Atualizar o preço total da lista
    await updateListTotal(listId);
    
    toast({
      title: "Item adicionado",
      description: `${itemData.name} foi adicionado à lista.`
    });
  };

  const updateItem = async (listId: string, updatedItem: Item) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Atualizar item na tabela list_items
    const { error } = await supabase
      .from('list_items')
      .update({
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        price: updatedItem.price || null,
        category: updatedItem.category,
        checked: updatedItem.checked,
        barcode: updatedItem.barcode || null
      })
      .eq('id', updatedItem.id);

    if (error) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item =>
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
    
    // Atualizar o preço total da lista
    await updateListTotal(listId);
  };

  const toggleItemCheck = async (listId: string, itemId: string) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Encontrar o estado atual do item
    const currentList = lists.find(list => list.id === listId);
    if (!currentList) return;
    
    const item = currentList.items.find(item => item.id === itemId);
    if (!item) return;
    
    // Atualizar o estado do item
    const { error } = await supabase
      .from('list_items')
      .update({ checked: !item.checked })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erro ao atualizar item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item =>
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

  const removeItem = async (listId: string, itemId: string) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Remover item da tabela list_items
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erro ao remover item",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter(item => item.id !== itemId)
          };
        }
        return list;
      })
    );
    
    // Atualizar o preço total da lista
    await updateListTotal(listId);
    
    toast({
      title: "Item removido",
      description: "O item foi removido da lista."
    });
  };

  const shareList = async (listId: string, userId: string) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Compartilhar lista adicionando na tabela list_shares
    const { error } = await supabase
      .from('list_shares')
      .insert({
        list_id: listId,
        user_id: userId
      });

    if (error) {
      // Verificar se é um erro de restrição única (já compartilhado)
      if (error.code === '23505') {
        toast({
          title: "Aviso",
          description: "Esta lista já está compartilhada com este usuário."
        });
        return;
      }
      
      toast({
        title: "Erro ao compartilhar lista",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
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

  const deleteList = async (listId: string) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Remover lista da tabela shopping_lists
    // As tabelas relacionadas serão automaticamente excluídas por causa da restrição ON DELETE CASCADE
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', listId);

    if (error) {
      toast({
        title: "Erro ao excluir lista",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Atualizar estado local
    setLists(prev => prev.filter(list => list.id !== listId));
    if (currentList?.id === listId) {
      setCurrentList(null);
    }
    
    toast({
      title: "Lista excluída",
      description: "A lista foi excluída permanentemente."
    });
  };

  const updateListTotal = async (listId: string) => {
    if (!user) throw new Error("Usuário não autenticado");
    
    // Encontrar a lista atual no estado
    const currentList = lists.find(list => list.id === listId);
    if (!currentList) return;
    
    // Calcular o total de preço com base nos itens
    const totalPrice = currentList.items.reduce((acc, item) => {
      return acc + (item.price || 0) * item.quantity;
    }, 0);
    
    // Atualizar o valor total na tabela shopping_lists
    const { error } = await supabase
      .from('shopping_lists')
      .update({ total_price: totalPrice })
      .eq('id', listId);

    if (error) {
      console.error("Erro ao atualizar preço total:", error);
      return;
    }

    // Atualizar estado local
    setLists(prev => 
      prev.map(list => {
        if (list.id === listId) {
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
        updateListTotal,
        loading,
        user,
        session,
        refreshLists
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
