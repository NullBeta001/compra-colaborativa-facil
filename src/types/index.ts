
export type Category = 'Alimentação' | 'Limpeza' | 'Higiene' | 'Bebidas' | 'Congelados' | 'Outros';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  category: Category;
  checked: boolean;
  barcode?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: Date;
  items: Item[];
  sharedWith: string[];
  color: 'green' | 'blue' | 'purple' | 'orange' | 'pink';
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
