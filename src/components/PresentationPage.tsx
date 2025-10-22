import { Product } from "../lib/mockData";
import { formatCurrency, deriveMarginFromPrices } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { FileDown, FileSpreadsheet, Leaf } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PresentationPageProps {
  products: Product[];
}

export function PresentationPage({ products }: PresentationPageProps) {
  const handleExportPDF = () => {
    toast.success("Funcionalidade de exportação PDF será implementada em breve!");
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["SKU", "Nome", "Categoria", "Preço de Venda", "Margem"];
    const rows = products.map((p) => [
      p.sku,
      p.nome,
      p.categoria,
      p.prices["1kg"].toFixed(2),
      deriveMarginFromPrices(p.preco_compra, p.prices).toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `produtos_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Lista exportada com sucesso!");
  };

  const totalProducts = products.length;
  const averageMargin =
    products.reduce((sum, p) => sum + deriveMarginFromPrices(p.preco_compra, p.prices), 0) / totalProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4ede0] via-[#faf8f5] to-[#e8dcc8]">
      {/* Header */}
      <header className="border-b border-[#d4b896]/30 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-[#3d3426]">Lista de Apresentação</h1>
                <p className="text-sm text-muted-foreground">
                  Catálogo de produtos para clientes
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="border-border"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#d4b896]/30 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-primary mt-2">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card className="border-[#d4b896]/30 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Margem Média</p>
              <p className="text-primary mt-2">{averageMargin.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card className="border-[#d4b896]/30 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Data de Geração</p>
              <p className="text-primary mt-2">
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card className="border-[#d4b896]/30 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wide">
                      Produto
                    </th>
                    <th className="text-left p-4 text-sm text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Categoria
                    </th>
                    <th className="text-right p-4 text-sm text-muted-foreground uppercase tracking-wide">
                      Preço
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const salePrice = product.prices["1kg"];
                    return (
                      <tr
                        key={product.sku}
                        className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                          index % 2 === 0 ? "bg-card/50" : "bg-transparent"
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <ImageWithFallback
                                src={product.imagem_url}
                                alt={product.nome}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-foreground">{product.nome}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                SKU: {product.sku}
                              </p>
                              {/* Desconto removido: campo não existe no tipo Product */}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary"
                          >
                            {product.categoria}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-primary">
                            {formatCurrency(salePrice)}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="mt-6 border-[#d4b896]/30 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  <strong>Castanhas Premium</strong> - Produtos naturais e selecionados
                </p>
                <Separator className="my-3 bg-border" />
                <p className="text-xs text-muted-foreground">
                  Todos os nossos produtos são cuidadosamente selecionados para garantir
                  a melhor qualidade e sabor. Preços sujeitos a alteração sem aviso
                  prévio. Entre em contato para pedidos em grandes quantidades.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Documento gerado em: {new Date().toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
