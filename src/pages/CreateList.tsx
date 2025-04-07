
import React from "react";
import { useNavigate } from "react-router-dom";
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
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { ShoppingList } from "@/types";
import Navbar from "@/components/Navbar";
import { useLists } from "@/context/ListContext";
import { Check } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  color: z.enum(["green", "blue", "purple", "orange", "pink"] as const),
});

const CreateList = () => {
  const navigate = useNavigate();
  const { createList, setCurrentList } = useLists();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      color: "green",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newList = await createList(values.title, values.color);
      setCurrentList(newList);
      navigate(`/list/${newList.id}`);
    } catch (error) {
      console.error("Erro ao criar lista:", error);
    }
  };

  const colorOptions: { value: ShoppingList["color"]; label: string; bgClass: string }[] = [
    { value: "green", label: "Verde", bgClass: "bg-green-500" },
    { value: "blue", label: "Azul", bgClass: "bg-blue-500" },
    { value: "purple", label: "Roxo", bgClass: "bg-purple-500" },
    { value: "orange", label: "Laranja", bgClass: "bg-orange-500" },
    { value: "pink", label: "Rosa", bgClass: "bg-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container px-4 py-6 mx-auto max-w-md">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Nova Lista</h2>
          <p className="text-muted-foreground">
            Crie uma nova lista de compras para organizar seus produtos.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Lista</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Compras do Mês" 
                      autoComplete="off"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Cor da Lista</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {colorOptions.map((color) => (
                        <FormItem
                          key={color.value}
                          className="flex-1"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={color.value}
                              id={color.value}
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor={color.value}
                            className={`
                              flex items-center justify-center p-3 rounded-lg border-2
                              border-muted bg-background
                              hover:bg-muted/20 hover:border-primary/50
                              cursor-pointer transition-all
                              peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10
                              peer-data-[state=checked]:shadow-sm
                              w-full
                            `}
                          >
                            <div className="flex items-center justify-center">
                              <div className={`w-4 h-4 rounded-full ${color.bgClass} mr-2`}></div>
                              <span>{color.label}</span>
                            </div>
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <Check className="h-4 w-4 mr-2" /> Criar Lista
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CreateList;
