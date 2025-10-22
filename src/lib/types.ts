export type WeightOption = "200g" | "500g" | "1kg";
export type WholesaleWeight = "3kg" | "5kg" | "10kg";
export type PaymentMethod = "pix" | "credit" | "debit";
export type ProductCategory = "Castanhas" | "Temperos" | "Frutas Desidratadas";
export type ExpenseCategory = "Mercadoria" | "Embalagens" | "Frete" | "Outros";

export interface ProductPrice {
  "200g": number;
  "500g": number;
  "1kg": number;
}

export interface Product {
  id: string;
  sku: string;
  nome: string;
  categoria: ProductCategory;
  descricao: string;
  preco_compra: number; // Base price per kg
  prices: ProductPrice; // Calculated retail prices
  imagem_url: string;
  unidade: string;
  ativo: boolean;
  emEstoque: boolean; // Stock availability
  availableWeights: WeightOption[];
  margem?: number; // optional retail margin percentage (fallback to derived)
}

export interface RetailMargin {
  productId: string;
  margem: number; // percentage
}

export interface WholesaleMargins {
  productId: string;
  margem_3kg: number;
  margem_5kg: number;
  margem_10kg: number;
}

export interface CartItem {
  product: Product;
  weight: WeightOption;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  installments?: number;
  createdAt: Date;
}

export interface Expense {
  id: string;
  nome: string;
  valor: number;
  categoria: ExpenseCategory;
  data: Date;
  observacoes?: string;
}

// Customers and Sales
export interface Customer {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string; // phone or WhatsApp
  ativo: boolean;
  createdAt: Date;
}

export type SaleSource = "loja" | "manual";

export interface Sale {
  id: string;
  date: Date;
  customerId?: string | null;
  valor: number;
  origem: SaleSource;
  observacoes?: string;
}

export interface ChangeHistory {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  sku?: string;
  oldValue?: number;
  newValue?: number;
}
