
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types";

interface CategorySelectProps {
  value: Category;
  onChange: (value: Category) => void;
}

const categories: { value: Category; label: string; icon: string }[] = [
  { value: "Alimentação", label: "Alimentação", icon: "🍎" },
  { value: "Bebidas", label: "Bebidas", icon: "🥤" },
  { value: "Limpeza", label: "Limpeza", icon: "🧹" },
  { value: "Higiene", label: "Higiene", icon: "🧼" },
  { value: "Congelados", label: "Congelados", icon: "❄️" },
  { value: "Outros", label: "Outros", icon: "📦" },
];

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange as (value: string) => void}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            <span className="flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
