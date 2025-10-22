import { useState, useRef } from "react";
import { Product, WeightOption, ProductCategory } from "../lib/types";
import { formatCurrency, parseCSV, calculateRetailPrices, parseBRNumber, parsePercentBR, normalizeKey } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Plus, Upload, Edit, Trash2, Eye, EyeOff, PackageX, PackageCheck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductManagementProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export function ProductManagement({ products, onUpdateProducts }: ProductManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    sku: "",
    categoria: "Castanhas" as ProductCategory,
    descricao: "",
    preco_compra: "",
    imagem_url: "",
    unidade: "kg",
    emEstoque: true,
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      sku: "",
      categoria: "Castanhas" as ProductCategory,
      descricao: "",
      preco_compra: "",
      imagem_url: "",
      unidade: "kg",
      emEstoque: true,
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const precoCompra = parseFloat(formData.preco_compra);
    if (isNaN(precoCompra) || precoCompra <= 0) {
      toast.error("Preço de Compra inválido");
      return;
    }

    const defaultMargin = 35;
    const prices = calculateRetailPrices(precoCompra, defaultMargin);

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      sku: formData.sku,
      nome: formData.nome,
      categoria: formData.categoria,
      descricao: formData.descricao,
      preco_compra: precoCompra,
      prices,
      imagem_url: formData.imagem_url,
      unidade: formData.unidade,
      ativo: editingProduct?.ativo ?? true,
      emEstoque: formData.emEstoque,
      availableWeights: ["200g", "500g", "1kg"],
    };

    if (editingProduct) {
      const updatedProducts = products.map(p => p.id === editingProduct.id ? newProduct : p);
      onUpdateProducts(updatedProducts);
      toast.success("Produto atualizado com sucesso!");
    } else {
      onUpdateProducts([...products, newProduct]);
      toast.success("Produto adicionado com sucesso!");
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      sku: product.sku,
      categoria: product.categoria,
      descricao: product.descricao,
      preco_compra: product.preco_compra.toString(),
      imagem_url: product.imagem_url,
      unidade: product.unidade,
      emEstoque: product.emEstoque,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    onUpdateProducts(updatedProducts);
    toast.success("Produto removido com sucesso!");
  };

  const handleToggleActive = (id: string) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, ativo: !p.ativo } : p
    );
    onUpdateProducts(updatedProducts);
    const product = products.find(p => p.id === id);
    toast.success(`Produto ${product?.ativo ? 'desativado' : 'ativado'} com sucesso!`);
  };

  const handleToggleStock = (id: string) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, emEstoque: !p.emEstoque } : p
    );
    onUpdateProducts(updatedProducts);
    const product = products.find(p => p.id === id);
    toast.success(`Produto ${product?.emEstoque ? 'marcado como fora de estoque' : 'marcado como em estoque'}!`);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const data = parseCSV(csvText);

        const getVal = (obj: any, candidates: string[]) => {
          for (const k of Object.keys(obj)) {
            const nk = normalizeKey(k);
            const hit = candidates.find(c => nk === normalizeKey(c));
            if (hit) return obj[k];
          }
          return undefined;
        };

        // Build a helper to reuse IDs by SKU and avoid duplicates
        const existingBySku = new Map(products.map(p => [String(p.sku).trim(), p] as const));
        const seenSku = new Set<string>();

        const newProducts: Product[] = data.map((row, index) => {
          const nome = getVal(row, ["nome", "produto"]) || "Sem nome";
          const rawprecoCompra = getVal(row, ["preco_compra", "Preço de Compra", "Preço de compra", "custo", "Preço base"]);
          const rawprecoVenda = getVal(row, ["Preço_venda", "preço de venda", "Preço de venda", "venda", "1kg"]);
          const rawMargem = getVal(row, ["margem", "lucro", "lucro %", "% lucro", "margem %"]);
          let precoCompra = parseBRNumber(rawprecoCompra);
          const precoVenda = parseBRNumber(rawprecoVenda);
          let margem = parsePercentBR(rawMargem);
          if ((isNaN(margem) || margem === 0) && !isNaN(precoCompra) && precoCompra > 0 && !isNaN(precoVenda) && precoVenda > 0) {
            margem = (precoVenda / precoCompra - 1) * 100;
          }
          if (isNaN(margem) || margem <= 0) margem = 35;
          if ((isNaN(precoCompra) || precoCompra <= 0) && !isNaN(precoVenda) && !isNaN(margem)) {
            precoCompra = precoVenda / (1 + margem / 100);
          }
          const finalPrecoCompra = isNaN(precoCompra) ? 0 : precoCompra;
          const prices = calculateRetailPrices(finalPrecoCompra, margem);

          const categoria = (getVal(row, ["categoria"]) as ProductCategory) || "Castanhas";
          const descricao = getVal(row, ["descricao", "descrição"]) || "";
          const sku = (getVal(row, ["sku"]) || `SKU-${Date.now()}-${index}`).toString().trim();
          const imagem_url = getVal(row, ["imagem_url", "imagem", "url imagem"]) || "";
          const unidade = "kg";
          const emEstoqueStr = getVal(row, ["emestoque", "em_estoque", "estoque"]) as string | undefined;
          const emEstoque = emEstoqueStr ? !(emEstoqueStr === "false" || emEstoqueStr === "0") : true;

          // Reuse existing ID for same SKU (prevents duplicates on repeated imports)
          const reuse = existingBySku.get(sku);
          // Deterministic ID by SKU when new (so multiple imports of the same CSV don't create duplicates)
          const deterministicId = `p-${sku.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()}`;

          // Ensure we don't create two entries for same SKU within the same CSV
          if (seenSku.has(sku)) {
            // If duplicate line for same SKU appears in CSV, skip creating a second product
            return null as unknown as Product;
          }
          seenSku.add(sku);

          const product: Product = {
            id: reuse?.id ?? deterministicId,
            sku,
            nome,
            categoria,
            descricao,
            preco_compra: finalPrecoCompra,
            prices,
            imagem_url,
            unidade,
            ativo: reuse?.ativo ?? true,
            emEstoque: reuse?.emEstoque ?? emEstoque,
            availableWeights: ["200g", "500g", "1kg"],
            margem,
          };
          return product;
        });

        const filtered = newProducts.filter(Boolean) as Product[];
        onUpdateProducts([...products, ...filtered]);
        toast.success(`${newProducts.length} produtos importados com sucesso!`);
      } catch (error) {
        toast.error("Erro ao importar CSV. Verifique o formato do arquivo.");
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Cadastrar Produtos</CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie o catálogo de produtos da loja
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-border"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço de Compra</TableHead>
                  <TableHead>Pesos</TableHead>
                  <TableHead>Visível</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice((page - 1) * pageSize, page * pageSize).map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={product.imagem_url}
                            alt={product.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-foreground">{product.nome}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.descricao}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {product.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.preco_compra)}/{product.unidade}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.availableWeights.map((weight) => (
                          <Badge key={weight} variant="secondary" className="text-xs">
                            {weight}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.ativo}
                          onCheckedChange={() => handleToggleActive(product.id)}
                        />
                        {product.ativo ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.emEstoque}
                          onCheckedChange={() => handleToggleStock(product.id)}
                        />
                        {product.emEstoque ? (
                          <PackageCheck className="w-4 h-4 text-primary" />
                        ) : (
                          <PackageX className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ← Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page} de {Math.max(1, Math.ceil(products.length / pageSize))}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= Math.ceil(products.length / pageSize)}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima →
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preencha os dados do produto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value as ProductCategory })}
                >
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Castanhas">Castanhas</SelectItem>
                    <SelectItem value="Temperos">Temperos</SelectItem>
                    <SelectItem value="Frutas Desidratadas">Frutas Desidratadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_compra">Preço de Compra (por kg) *</Label>
                <Input
                  id="preco_compra"
                  type="number"
                  step="0.01"
                  value={formData.preco_compra}
                  onChange={(e) => setFormData({ ...formData, preco_compra: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="bg-input-background border-border"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem_url">URL da Imagem</Label>
              <Input
                id="imagem_url"
                type="url"
                value={formData.imagem_url}
                onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                className="bg-input-background border-border"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2 p-4 border border-border rounded-lg bg-muted/30">
              <Switch
                id="emEstoque"
                checked={formData.emEstoque}
                onCheckedChange={(checked) => setFormData({ ...formData, emEstoque: checked })}
              />
              <Label htmlFor="emEstoque" className="cursor-pointer flex items-center gap-2">
                {formData.emEstoque ? (
                  <PackageCheck className="w-4 h-4 text-primary" />
                ) : (
                  <PackageX className="w-4 h-4 text-destructive" />
                )}
                <span>{formData.emEstoque ? "Produto em estoque" : "Produto fora de estoque"}</span>
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingProduct ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}










