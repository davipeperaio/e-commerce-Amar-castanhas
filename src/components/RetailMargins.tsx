import { useState } from "react";
import { Product, RetailMargin } from "../lib/types";
import { formatCurrency, formatPercentage, validateMargin, calculateRetailPrices } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Percent, FileDown, AlertCircle, CheckCircle2 } from "lucide-react";

interface RetailMarginsProps {
  products: Product[];
  margins: RetailMargin[];
  onUpdateMargins: (margins: RetailMargin[]) => void;
  onUpdateProducts: (products: Product[]) => void;
}

export function RetailMargins({ products, margins, onUpdateMargins, onUpdateProducts }: RetailMarginsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [globalMargin, setGlobalMargin] = useState("");
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [error, setError] = useState("");

  const getMargin = (productId: string) => {
    return margins.find(m => m.productId === productId)?.margem || 35;
  };

  const handleEditClick = (productId: string) => {
    setEditingId(productId);
    setEditValue(getMargin(productId).toString());
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

    // Update margins
    const updatedMargins = margins.map(m =>
      m.productId === editingId ? { ...m, margem: marginValue } : m
    );
    onUpdateMargins(updatedMargins);

    // Recalculate product prices
    const product = products.find(p => p.id === editingId);
    if (product) {
      const newPrices = calculateRetailPrices(product.preco_compra, marginValue);
      const updatedProducts = products.map(p =>
        p.id === editingId ? { ...p, prices: newPrices } : p
      );
      onUpdateProducts(updatedProducts);
    }

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

    // Update all margins
    const updatedMargins = margins.map(m => ({ ...m, margem: marginValue }));
    onUpdateMargins(updatedMargins);

    // Recalculate all product prices
    const updatedProducts = products.map(p => {
      const newPrices = calculateRetailPrices(p.preco_compra, marginValue);
      return { ...p, prices: newPrices };
    });
    onUpdateProducts(updatedProducts);

    setShowGlobalDialog(false);
    setGlobalMargin("");
    setError("");
    toast.success(`Margem de ${formatPercentage(marginValue)} aplicada a todos os produtos!`);
  };

    const handleExportPDF = () => {
  try {
    const rows = products.map(p => ({
      nome: p.nome,
      p1: formatCurrency(p.prices["1kg"]),
      p5: formatCurrency(p.prices["500g"]),
      p2: formatCurrency(p.prices["200g"]),
    }));

    const date = new Date().toLocaleDateString('pt-BR');
    const title = 'Tabela de Preços - Varejo';
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    :root { --green:#4f613f; --dark:#2b261c; --muted:#f1efe9; --border:#e0dccf; --card:#ffffff; }
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff;color:var(--dark);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
    .banner{background:var(--green);color:#fff;text-align:center;padding:28px 16px 22px 16px}
    .brand{font-size:36px;letter-spacing:2px;font-weight:700}
    .tag{margin-top:6px;font-size:12px;opacity:.9;letter-spacing:1px}
    .subtitle{margin-top:10px;font-size:18px;font-weight:600}
    .wrap{padding:18px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden}
    table{width:100%;border-collapse:collapse}
    thead th{background:var(--green);color:#fff;text-align:left;font-weight:600}
    th,td{border-bottom:1px solid var(--border);padding:10px 12px;font-size:12px}
    tbody tr:nth-child(even){background:var(--muted)}
    .right{text-align:right}
    @page{size:A4;margin:0}
  </style>
</head>
<body>
  <div class="banner">
    <div class="brand">AMAR CASTANHAS</div>
    <div class="tag">PRODUTOS NATURAIS</div>
    <div class="subtitle">${title}</div>
  </div>
  <div class="wrap">
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th class="right">1kg</th>
            <th class="right">500g</th>
            <th class="right">200g</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.nome}</td>
              <td class="right">${r.p1}</td>
              <td class="right">${r.p5}</td>
              <td class="right">${r.p2}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="margin-top:8px;color:#666;font-size:11px">Gerado em ${date}</div>
  </div>
  <script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) { toast.error('Não foi possível abrir a janela do PDF'); return; }
    w.document.open(); w.document.write(html); w.document.close();
  } catch (e) {
    console.error(e);
    toast.error('Falha ao gerar o PDF do varejo');
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Clientes Varejo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Defina margens de lucro para vendas no varejo
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                className="border-border"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Baixar PDF
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
        </CardHeader>
      </Card>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Preço Base (kg)</TableHead>
                  <TableHead className="text-right">Margem (%)</TableHead>
                  <TableHead className="text-right">Preço 200g</TableHead>
                  <TableHead className="text-right">Preço 500g</TableHead>
                  <TableHead className="text-right">Preço 1kg</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isEditing = editingId === product.id;
                  const margin = getMargin(product.id);

                  return (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="text-foreground">{product.nome}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
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
                              key={margin}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-primary"
                            >
                              {formatPercentage(margin)}
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={product.prices["200g"]}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(product.prices["200g"])}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={product.prices["500g"]}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(product.prices["500g"])}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={product.prices["1kg"]}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(product.prices["1kg"])}
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
                            onClick={() => handleEditClick(product.id)}
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
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Global Margin Dialog */}
      <Dialog open={showGlobalDialog} onOpenChange={setShowGlobalDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Aplicar Margem Global - Varejo</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta margem será aplicada a todos os {products.length} produtos no varejo.
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
    </div>
  );
}

