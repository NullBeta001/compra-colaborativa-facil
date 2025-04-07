
import { ShoppingList, User } from "@/types";

export const currentUser: User = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana.silva@exemplo.com",
  avatar: "https://i.pravatar.cc/150?u=ana"
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "Carlos Santos",
    email: "carlos.santos@exemplo.com",
    avatar: "https://i.pravatar.cc/150?u=carlos"
  },
  {
    id: "user-3",
    name: "Juliana Lima",
    email: "juliana.lima@exemplo.com",
    avatar: "https://i.pravatar.cc/150?u=juliana"
  }
];

export const mockLists: ShoppingList[] = [
  {
    id: "list-1",
    title: "Compras do Mês",
    createdAt: new Date(),
    color: "green",
    items: [
      {
        id: "item-1",
        name: "Arroz Integral",
        quantity: 2,
        price: 22.90,
        category: "Alimentação",
        checked: false,
        barcode: "7891234567890"
      },
      {
        id: "item-2",
        name: "Leite Semi-Desnatado",
        quantity: 6,
        price: 4.79,
        category: "Alimentação",
        checked: false
      },
      {
        id: "item-3",
        name: "Sabão em Pó",
        quantity: 1,
        price: 18.90,
        category: "Limpeza",
        checked: false
      }
    ],
    sharedWith: ["user-2"],
    totalPrice: 71.43
  },
  {
    id: "list-2",
    title: "Festa de Aniversário",
    createdAt: new Date(),
    color: "blue",
    items: [
      {
        id: "item-4",
        name: "Refrigerante Cola",
        quantity: 4,
        price: 8.99,
        category: "Bebidas",
        checked: false
      },
      {
        id: "item-5",
        name: "Salgadinhos Variados",
        quantity: 3,
        price: 12.50,
        category: "Alimentação",
        checked: false
      }
    ],
    sharedWith: ["user-2", "user-3"],
    totalPrice: 73.46
  }
];

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
