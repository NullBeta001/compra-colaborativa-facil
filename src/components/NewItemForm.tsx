import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Category, Item } from "@/types";
import CategorySelect from "./CategorySelect";
import Scanner from "./Scanner";
import { Barcode, Plus } from "lucide-react";
import { useLists } from "@/context/ListContext";
import { fetchProductByBarcode } from "@/services/productApi";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  price: z.coerce.number().optional(),
  category: z.enum(["Alimentação", "Limpeza", "Higiene", "Bebidas", "Congelados", "Outros"] as const),
  barcode: z.string().optional(),
});

interface NewItemFormProps {
  listId: string;
}

const NewItemForm: React.FC<NewItemFormProps> = ({ listId }) => {
  const { addItemToList } = useLists();
  const [showScanner, setShowScanner] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      price: undefined,
      category: "Alimentação",
      barcode: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newItem: Omit<Item, "id"> = {
      name: values.name,
      quantity: values.quantity,
      price: values.price,
      category: values.category,
      barcode: values.barcode,
      checked: false,
    };
    
    addItemToList(listId, newItem);
    form.reset();
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Mostrar loading ou algo similar aqui, se desejar
    
    try {
      // Buscar produto pelo código de barras
      const productData = await fetchProductByBarcode(barcode);
      
      if (productData) {
        // Preencher o formulário com os dados do produto
        form.setValue("barcode", barcode);
        form.setValue("name", productData.name);
        form.setValue("category", productData.category);
        if (productData.price) {
          form.setValue("price", productData.price);
        }
        
        toast({
          title: "Produto encontrado",
          description: `${productData.name} adicionado automaticamente.`,
        });
      } else {
        // Se não encontrou o produto, apenas preenche o código
        form.setValue("barcode", barcode);
        toast({
          title: "Código reconhecido",
          description: "Preencha os detalhes do produto manualmente.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      form.setValue("barcode", barcode);
      toast({
        title: "Erro ao buscar produto",
        description: "Preencha os detalhes do produto manualmente.",
        variant: "destructive",
      });
    }
    
    setShowScanner(false);
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow-sm mb-6 animate-fade-in">
      {showScanner ? (
        <div>
          <Scanner onDetected={handleBarcodeDetected} />
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={() => setShowScanner(false)}
          >
            Cancelar Escaneamento
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Adicionar Item</h3>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="ml-auto"
                onClick={() => setShowScanner(true)}
              >
                <Barcode className="h-4 w-4" />
              </Button>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arroz Integral" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <CategorySelect 
                      value={field.value} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Item
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default NewItemForm;
