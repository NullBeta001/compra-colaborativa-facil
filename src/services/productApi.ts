import { Category } from "@/types";

interface ProductInfo {
  name: string;
  price?: number;
  category: Category;
  imageUrl?: string;
}

// Cache para armazenar produtos já consultados
const productCache: Record<string, ProductInfo> = {};

/**
 * Busca informações de um produto pelo código de barras
 * Neste exemplo, estamos usando a API pública do Cosmos (Brasil)
 * Em um ambiente de produção, você usaria uma API comercial real
 */
export async function fetchProductByBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    // Verificar se o produto está no cache
    if (productCache[barcode]) {
      console.log("Produto encontrado no cache:", productCache[barcode]);
      return productCache[barcode];
    }

    // URL da API do Cosmos (gratuita, mas limitada)
    // Alternativas pagas: Bluecode API, Barcode Lookup, UPCitemdb
    const apiUrl = `https://api.cosmos.bluesoft.com.br/gtins/${barcode}`;
    
    // Você precisaria de uma chave de API em um ambiente real
    const headers = {
      "Content-Type": "application/json",
      "X-Cosmos-Token": "seu_token_cosmos_aqui" // Em produção, isso viria de variáveis de ambiente
    };

    // Em um ambiente real, você faria essa chamada:
    // const response = await fetch(apiUrl, { headers });
    // const data = await response.json();
    
    // Para este exemplo, simularemos a resposta
    // Simulação de delay para parecer uma chamada real
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mapear categorias da API para nossas categorias internas
    const mapApiCategoryToInternal = (apiCategory: string): Category => {
      const categoryMap: Record<string, Category> = {
        "Alimentos": "Alimentação",
        "Bebidas": "Bebidas",
        "Limpeza": "Limpeza",
        "Higiene Pessoal": "Higiene",
        "Congelados": "Congelados"
      };
      
      return categoryMap[apiCategory] || "Outros";
    };
    
    // Simulação de resposta da API para códigos de barras diferentes
    let mockResponse: ProductInfo;
    
    // Determinamos a categoria baseada nos primeiros dígitos
    const firstDigits = barcode.substring(0, 2);
    const categoryCode = parseInt(firstDigits) % 6;
    const categories: Category[] = ["Alimentação", "Bebidas", "Limpeza", "Higiene", "Congelados", "Outros"];
    const category = categories[categoryCode];
    
    // Gerar um preço aleatório entre R$ 5 e R$ 30
    const price = parseFloat((Math.random() * 25 + 5).toFixed(2));
    
    // Determinar o nome do produto com base no código de barras
    if (barcode.startsWith("789")) { // Produtos típicos brasileiros
      const productNames = [
        "Arroz Integral Premium",
        "Feijão Carioca",
        "Café Torrado e Moído",
        "Açúcar Cristal",
        "Biscoito Cream Cracker",
        "Leite Integral",
        "Óleo de Soja",
        "Molho de Tomate",
        "Detergente Líquido",
        "Sabonete em Barra"
      ];
      
      const nameIndex = parseInt(barcode.substring(5, 7)) % productNames.length;
      const brandNames = ["Qualitá", "Taeq", "Carrefour", "Dia", "Nestlé", "Ypê", "Pão de Açúcar"];
      const brandIndex = parseInt(barcode.substring(3, 5)) % brandNames.length;
      
      mockResponse = {
        name: `${brandNames[brandIndex]} ${productNames[nameIndex]}`,
        category,
        price
      };
    } else {
      // Produtos genéricos para outros códigos
      mockResponse = {
        name: `Produto ${barcode.substring(0, 6)}`,
        category,
        price
      };
    }
    
    // Armazenar no cache
    productCache[barcode] = mockResponse;
    
    console.log("Produto encontrado:", mockResponse);
    return mockResponse;
    
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
} 