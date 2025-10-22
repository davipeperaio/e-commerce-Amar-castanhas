import { Product, RetailMargin, WholesaleMargins, Expense, ChangeHistory } from "./types";
// src/lib/mockData.ts
export type { Product, RetailMargin, WholesaleMargins, Expense, ChangeHistory } from "./types";



export const mockProducts: Product[] = [
  {
    id: "1",
    sku: "CX-001",
    nome: "Castanha de Caju Premium",
    categoria: "Castanhas",
    descricao: "Castanha de caju selecionada, torrada e levemente salgada",
    preco_compra: 80.00, // per kg
    prices: {
      "200g": 21.60,
      "500g": 54.00,
      "1kg": 108.00,
    },
    imagem_url: "https://images.unsplash.com/photo-1626738740202-ce4e9c4ae674?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMG51dHMlMjBjYXNoZXdzfGVufDF8fHx8MTc2MTEzMjI1OHww&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "2",
    sku: "AMD-002",
    nome: "Amêndoas Orgânicas",
    categoria: "Castanhas",
    descricao: "Amêndoas naturais cultivadas organicamente, ricas em nutrientes",
    preco_compra: 95.00,
    prices: {
      "200g": 25.65,
      "500g": 64.13,
      "1kg": 128.25,
    },
    imagem_url: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbG1vbmRzJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjExMzIyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "3",
    sku: "NOZ-003",
    nome: "Nozes Chilenas",
    categoria: "Castanhas",
    descricao: "Nozes chilenas frescas, ideais para receitas e lanches",
    preco_compra: 120.00,
    prices: {
      "200g": 32.40,
      "500g": 81.00,
      "1kg": 162.00,
    },
    imagem_url: "https://images.unsplash.com/photo-1589752882051-69148918f193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWxudXRzJTIwb3JnYW5pY3xlbnwxfHx8fDE3NjExMzIyNTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: false,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "4",
    sku: "PST-004",
    nome: "Pistache Torrado",
    categoria: "Castanhas",
    descricao: "Pistache premium torrado e salgado, sabor incomparável",
    preco_compra: 145.00,
    prices: {
      "200g": 39.15,
      "500g": 97.88,
      "1kg": 195.75,
    },
    imagem_url: "https://images.unsplash.com/photo-1598110996285-54523b72be93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXN0YWNoaW9zJTIwbnV0c3xlbnwxfHx8fDE3NjExMzIyNTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "5",
    sku: "AVL-005",
    nome: "Avelãs Europeias",
    categoria: "Castanhas",
    descricao: "Avelãs selecionadas importadas da Europa",
    preco_compra: 105.00,
    prices: {
      "200g": 28.35,
      "500g": 70.88,
      "1kg": 141.75,
    },
    imagem_url: "https://images.unsplash.com/photo-1585536301151-2afb2fb1c960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXplbG51dHN8ZW58MXx8fHwxNzYxMTMyMjU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "6",
    sku: "CPA-006",
    nome: "Castanha do Pará",
    categoria: "Castanhas",
    descricao: "Castanha do Pará brasileira, rica em selênio",
    preco_compra: 75.00,
    prices: {
      "200g": 20.25,
      "500g": 50.63,
      "1kg": 101.25,
    },
    imagem_url: "https://images.unsplash.com/photo-1614807618553-35332e4de00d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBudXRzfGVufDF8fHx8MTc2MTEzMjI1OXww&ixlib=rb-4.1.0&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "7",
    sku: "TMP-001",
    nome: "Páprica Defumada",
    categoria: "Temperos",
    descricao: "Páprica defumada premium, ideal para carnes e risotos",
    preco_compra: 55.00,
    prices: {
      "200g": 14.85,
      "500g": 37.13,
      "1kg": 74.25,
    },
    imagem_url: "https://images.unsplash.com/photo-1596040033229-a0b34b7f5ec2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "8",
    sku: "TMP-002",
    nome: "Mix de Ervas Finas",
    categoria: "Temperos",
    descricao: "Blend de tomilho, alecrim, manjericão e orégano",
    preco_compra: 68.00,
    prices: {
      "200g": 18.36,
      "500g": 45.90,
      "1kg": 91.80,
    },
    imagem_url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "9",
    sku: "FRT-001",
    nome: "Manga Desidratada",
    categoria: "Frutas Desidratadas",
    descricao: "Manga desidratada naturalmente doce, sem açúcar adicionado",
    preco_compra: 42.00,
    prices: {
      "200g": 11.34,
      "500g": 28.35,
      "1kg": 56.70,
    },
    imagem_url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
  {
    id: "10",
    sku: "FRT-002",
    nome: "Cranberry Desidratado",
    categoria: "Frutas Desidratadas",
    descricao: "Cranberry desidratado, rico em antioxidantes",
    preco_compra: 65.00,
    prices: {
      "200g": 17.55,
      "500g": 43.88,
      "1kg": 87.75,
    },
    imagem_url: "https://images.unsplash.com/photo-1577003833154-a6b0b2d4fef0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    unidade: "kg",
    ativo: true,
    emEstoque: true,
    availableWeights: ["200g", "500g", "1kg"],
  },
];

export const defaultRetailMargins: RetailMargin[] = mockProducts.map(p => ({
  productId: p.id,
  margem: 35, // 35% default margin
}));

export const defaultWholesaleMargins: WholesaleMargins[] = mockProducts.map(p => ({
  productId: p.id,
  margem_3kg: 25,
  margem_5kg: 22,
  margem_10kg: 18,
}));

export const mockExpenses: Expense[] = [
  {
    id: "1",
    nome: "Castanha de Caju - 50kg",
    valor: 4000.00,
    categoria: "Mercadoria",
    data: new Date(2025, 9, 5), // October 5, 2025
    observacoes: "Fornecedor ABC Nuts"
  },
  {
    id: "2",
    nome: "Sacos Plásticos 1kg",
    valor: 450.00,
    categoria: "Embalagens",
    data: new Date(2025, 9, 8),
    observacoes: "500 unidades"
  },
  {
    id: "3",
    nome: "Transporte - Pedido #1234",
    valor: 280.00,
    categoria: "Frete",
    data: new Date(2025, 9, 10),
  },
  {
    id: "4",
    nome: "Amêndoas Importadas - 30kg",
    valor: 2850.00,
    categoria: "Mercadoria",
    data: new Date(2025, 9, 12),
    observacoes: "Importação Europa"
  },
  {
    id: "5",
    nome: "Etiquetas Personalizadas",
    valor: 320.00,
    categoria: "Embalagens",
    data: new Date(2025, 9, 15),
    observacoes: "1000 unidades"
  },
  {
    id: "6",
    nome: "Frete Correios - Múltiplos Pedidos",
    valor: 520.00,
    categoria: "Frete",
    data: new Date(2025, 9, 18),
  },
  {
    id: "7",
    nome: "Nozes - 25kg",
    valor: 3000.00,
    categoria: "Mercadoria",
    data: new Date(2025, 9, 20),
  },
  {
    id: "8",
    nome: "Caixas de Papelão",
    valor: 180.00,
    categoria: "Embalagens",
    data: new Date(2025, 8, 5), // September
  },
  {
    id: "9",
    nome: "Pistache - 20kg",
    valor: 2900.00,
    categoria: "Mercadoria",
    data: new Date(2025, 8, 10),
  },
  {
    id: "10",
    nome: "Frete Transportadora",
    valor: 450.00,
    categoria: "Frete",
    data: new Date(2025, 8, 15),
  },
];
