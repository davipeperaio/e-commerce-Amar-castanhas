import { useState } from "react";
import { Product } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Grid3x3, List, ShoppingCart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface StorefrontPageProps {
  products: Product[];
}

export function StorefrontPage({
  products,
}: StorefrontPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    "grid",
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[#3d3426]">Amar Castanhas</h1>
              <p className="text-sm text-muted-foreground">
                Produtos naturais
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary text-primary-foreground">
                0
              </Badge>
            </Button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} produtos disponíveis
            </p>
            <div className="flex gap-2">
              <Button
                variant={
                  viewMode === "grid" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Grade
              </Button>
              <Button
                variant={
                  viewMode === "list" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                <List className="w-4 h-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const salePrice = product.prices["1kg"];
              return (
                <Card
                  key={product.sku}
                  className="overflow-hidden hover:shadow-lg transition-shadow border-border"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={product.imagem_url}
                      alt={product.nome}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* Desconto removido: campo nÃ£o existe no tipo Product */}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {product.categoria}
                      </p>
                      <h3 className="text-foreground mt-1">
                        {product.nome}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      <p className="text-primary">
                        {formatCurrency(salePrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Preço base:{" "}
                        {formatCurrency(product.preco_compra)}
                      </p>
                    </div>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Adicionar ao Carrinho
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const salePrice = product.prices["1kg"];
              return (
                <Card
                  key={product.sku}
                  className="overflow-hidden hover:shadow-md transition-shadow border-border"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback
                          src={product.imagem_url}
                          alt={product.nome}
                          className="w-full h-full object-cover"
                        />
                        {/* Desconto removido: campo nÃ£o existe no tipo Product */}
                      </div>
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {product.categoria}
                              </p>
                              <h3 className="text-foreground mt-1">
                                {product.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                SKU: {product.sku}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary">
                                {formatCurrency(salePrice)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Base:{" "}
                                {formatCurrency(
                                  product.preco_compra,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Adicionar ao Carrinho
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

