import { useState } from "react";
import { Product, ChangeHistory } from "../lib/mockData";
import { calculateSalePrice, formatCurrency, formatPercentage, validateMargin, deriveMarginFromPrices } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowUpDown, Percent, CheckCircle2, AlertCircle, History } from "lucide-react";

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  history: ChangeHistory[];
  onAddHistory: (entry: ChangeHistory) => void;
  currentUser: string;
}

export function AdminDashboard({ products, onUpdateProducts, history, onAddHistory, currentUser }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Product>("sku");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [globalMargin, setGlobalMargin] = useState("");
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * modifier;
    }
    return 0;
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getMargin = (p: Product) => {
    const m = (p as any).margem as number | undefined;
    return m ?? deriveMarginFromPrices(p.preco_compra, p.prices);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.sku);
    setEditValue(getMargin(product).toString());
    setError("");
  };

  const handleSaveEdit = () => {
    if (!editingId) return;

    const marginValue = parseFloat(editValue);
    const validation = validateMargin(marginValue);

    if (!validation.valid) {
      setError(validation.error || "Valor inválido");
      return;
    }

    const updatedProducts = products.map((p) => {
      if (p.sku === editingId) {
        onAddHistory({
          id: Date.now().toString(),
          timestamp: new Date(),
          user: currentUser,
          action: "Margem alterada",
          sku: p.sku,
          oldValue: getMargin(p),
          newValue: marginValue,
        });
        return { ...(p as any), margem: marginValue } as Product;
      }
      return p;
    });

    onUpdateProducts(updatedProducts);
    setEditingId(null);
    setEditValue("");
    setError("");
    toast.success("Margem atualizada com sucesso!");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setError("");
  };

  const handleApplyGlobalMargin = () => {
    const marginValue = parseFloat(globalMargin);
    const validation = validateMargin(marginValue);

    if (!validation.valid) {
      setError(validation.error || "Valor inválido");
      return;
    }

    const updatedProducts = products.map((p) => {
      onAddHistory({
        id: `${Date.now()}-${p.sku}`,
        timestamp: new Date(),
        user: currentUser,
        action: "Margem global aplicada",
        sku: p.sku,
        oldValue: getMargin(p),
        newValue: marginValue,
      });
      return { ...(p as any), margem: marginValue } as Product;
    });

    onUpdateProducts(updatedProducts);
    setShowGlobalDialog(false);
    setGlobalMargin("");
    setError("");
    toast.success(`Margem de ${formatPercentage(marginValue)} aplicada a todos os produtos!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[#3d3426]">Dashboard Administrativo</h1>
              <p className="text-sm text-muted-foreground">Gestão de produtos e margens de lucro</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowHistoryDialog(true)}
                className="border-border"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button
                onClick={() => setShowGlobalDialog(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Percent className="w-4 h-4 mr-2" />
                Margem Global
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, SKU ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-input-background border-border"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("sku")}
                      className="hover:bg-transparent p-0"
                    >
                      SKU
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("nome")}
                      className="hover:bg-transparent p-0"
                    >
                      Nome
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("preco_compra")}
                      className="hover:bg-transparent p-0 ml-auto flex"
                    >
                      Preço de Compra
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("margem")}
                      className="hover:bg-transparent p-0 ml-auto flex"
                    >
                      Margem (%)
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Preço de Venda</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.map((product) => {
                  const isEditing = editingId === product.sku;
                  const salePrice = calculateSalePrice(product.preco_compra, getMargin(product));

                  return (
                    <TableRow key={product.sku} className="hover:bg-muted/30">
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-foreground">{product.nome}</div>
                          <div className="text-xs text-muted-foreground">{product.categoria}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.preco_compra)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 text-right bg-input-background border-border"
                              step="0.1"
                              min="0"
                              autoFocus
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        ) : (
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={getMargin(product)}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-primary"
                            >
                              {formatPercentage(getMargin(product))}
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={salePrice}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="text-foreground"
                          >
                            {formatCurrency(salePrice)}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(product)}
                          >
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Global Margin Dialog */}
      <Dialog open={showGlobalDialog} onOpenChange={setShowGlobalDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Aplicar Margem Global</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta margem será aplicada a todos os {products.length} produtos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="global-margin">Margem (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="global-margin"
                  type="number"
                  value={globalMargin}
                  onChange={(e) => setGlobalMargin(e.target.value)}
                  placeholder="Ex: 35"
                  className="bg-input-background border-border"
                  step="0.1"
                  min="0"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGlobalDialog(false);
                setGlobalMargin("");
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApplyGlobalMargin}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Aplicar a Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Histórico de Alterações</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Últimas {history.length} alterações realizadas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma alteração registrada ainda</p>
            ) : (
              history.slice().reverse().map((entry) => (
                <Card key={entry.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-foreground">{entry.action}</p>
                        {entry.sku && (
                          <p className="text-sm text-muted-foreground mt-1">
                            SKU: {entry.sku}
                            {entry.oldValue !== undefined && entry.newValue !== undefined && (
                              <span className="ml-2">
                                {formatPercentage(entry.oldValue)} → {formatPercentage(entry.newValue)}
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Por: {entry.user}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
