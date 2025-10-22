import { useState } from "react";
import { Product, WeightOption, CartItem, ProductCategory } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { normalizePtBrLabel } from "../lib/normalize";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Leaf, Search, ShoppingCart, User, PackageX, Percent, ChevronDown, Flame } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Cart } from "./Cart";

interface PublicStorefrontProps {
  products: Product[];
  onLogin: () => void;
  cart: CartItem[];
  onAddToCart: (product: Product, weight: WeightOption) => void;
  onUpdateCart: (items: CartItem[]) => void;
  onCheckout?: (data: { items: CartItem[]; total: number; paymentMethod: any; installments?: number; date: Date }) => void;
}

export function PublicStorefront({ products, onLogin, cart, onAddToCart, onUpdateCart, onCheckout }: PublicStorefrontProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWeights, setSelectedWeights] = useState<Record<string, WeightOption>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "Todos">("Todos");

  const activeProducts = products.filter(p => p.ativo);
  
  const filteredProducts = activeProducts.filter(
    (p) => {
      const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    }
  );

  const handleWeightChange = (productId: string, weight: WeightOption) => {
    setSelectedWeights(prev => ({ ...prev, [productId]: weight }));
  };

  const handleAddToCart = (product: Product) => {
    const weight = selectedWeights[product.id];
    if (!weight) return; // require explicit selection
    onAddToCart(product, weight);
    setCartOpen(true);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#4f613f]/20 bg-[#4f613f]/10 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src="/logo-amar-castanhas.png"
                alt="Amar Castanhas"
                className="w-12 h-12 object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-[#3d3426]">Amar Castanhas</h1>
                <p className="text-xs text-muted-foreground">Produtos naturais e selecionados</p>
              </div>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input-background border-border"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onLogin}
                className="border-border hidden sm:flex"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
              
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative border-border">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary text-primary-foreground">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg bg-card border-border">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Carrinho de Compras</SheetTitle>
                    <SheetDescription className="sr-only">
                      Gerencie os itens do seu carrinho
                    </SheetDescription>
                  </SheetHeader>
                  <Cart cart={cart} onUpdateCart={onUpdateCart} onCheckout={onCheckout} />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="icon"
                onClick={onLogin}
                className="sm:hidden"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search - Mobile */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input-background border-border"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="border-b border-border bg-card/50 sticky top-[73px] z-10">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ProductCategory | "Todos")}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50">
              <TabsTrigger value="Todos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Todos
              </TabsTrigger>
              <TabsTrigger value="Castanhas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Castanhas
              </TabsTrigger>
              <TabsTrigger value="Temperos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Temperos
              </TabsTrigger>
              <TabsTrigger value="Frutas Desidratadas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Frutas Desidratadas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#f4ede0] via-[#faf8f5] to-[#e8dcc8] py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="h-56 md:h-80 w-full flex items-center justify-center">
            <ImageWithFallback
              src="/hero-illustration.png"
              alt="Amar Castanhas — Produtos naturais premium"
              fallbackSrc="/logo-amar-castanhas.png"
              className="h-full w-auto max-w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const selectedWeight = selectedWeights[product.id];
            const price = selectedWeight ? product.prices[selectedWeight] : undefined;
            const isDisabled = !product.emEstoque || !selectedWeight;

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border group">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={product.imagem_url}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {product.categoria}
                  </Badge>
                  {!product.emEstoque && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                        <PackageX className="w-5 h-5" />
                        <span>Indisponível</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-foreground">{normalizePtBrLabel(product.nome)}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {product.descricao}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Quantidade:</label>
                    <Select
                      value={selectedWeight ?? undefined}
                      onValueChange={(value) => handleWeightChange(product.id, value as WeightOption)}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.availableWeights.map((weight) => (
                          <SelectItem key={weight} value={weight}>
                            {weight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2">
                    <p className="text-primary">
                      {price !== undefined ? formatCurrency(price) : "—"}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={isDisabled}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDisabled ? (
                      <>Selecione a quantidade</>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}



