import { useState } from "react";
import { Product, WholesaleMargins as WholesaleMarginsType } from "../lib/types";
import { formatCurrency, formatPercentage, validateMargin, calculateWholesalePrice } from "../lib/utils";
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

interface WholesaleMarginsProps {
  products: Product[];
  margins: WholesaleMarginsType[];
  onUpdateMargins: (margins: WholesaleMarginsType[]) => void;
}

export function WholesaleMargins({ products, margins, onUpdateMargins }: WholesaleMarginsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editField, setEditField] = useState<"3kg" | "5kg" | "10kg" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [globalMargins, setGlobalMargins] = useState({ "3kg": "", "5kg": "", "10kg": "" });
  const [showGlobalDialog, setShowGlobalDialog] = useState(false);
  const [error, setError] = useState("");

  const getMargins = (productId: string) => {
    return margins.find(m => m.productId === productId) || {
      productId,
      margem_3kg: 25,
      margem_5kg: 22,
      margem_10kg: 18,
    };
  };

  const handleEditClick = (productId: string, field: "3kg" | "5kg" | "10kg") => {
    setEditingId(productId);
    setEditField(field);
    const productMargins = getMargins(productId);
    const marginKey = `margem_${field}` as keyof WholesaleMarginsType;
    setEditValue(productMargins[marginKey].toString());
    setError("");
  };

  const handleSaveEdit = () => {
    if (!editingId || !editField) return;

    const marginValue = parseFloat(editValue);
    const validation = validateMargin(marginValue);

    if (!validation.valid) {
      setError(validation.error || "Valor inválido");
      return;
    }

    const marginKey = `margem_${editField}` as keyof WholesaleMarginsType;
    const updatedMargins = margins.map(m =>
      m.productId === editingId ? { ...m, [marginKey]: marginValue } : m
    );
    onUpdateMargins(updatedMargins);

    setEditingId(null);
    setEditField(null);
    setEditValue("");
    setError("");
    toast.success("Margem atualizada com sucesso!");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditField(null);
    setEditValue("");
    setError("");
  };

  const handleApplyGlobalMargins = () => {
    const margin3kg = parseFloat(globalMargins["3kg"]);
    const margin5kg = parseFloat(globalMargins["5kg"]);
    const margin10kg = parseFloat(globalMargins["10kg"]);

    const validations = [
      validateMargin(margin3kg),
      validateMargin(margin5kg),
      validateMargin(margin10kg),
    ];

    const invalidValidation = validations.find(v => !v.valid);
    if (invalidValidation) {
      setError(invalidValidation.error || "Valor inválido");
      return;
    }

    const updatedMargins = margins.map(m => ({
      ...m,
      margem_3kg: margin3kg,
      margem_5kg: margin5kg,
      margem_10kg: margin10kg,
    }));
    onUpdateMargins(updatedMargins);

    setShowGlobalDialog(false);
    setGlobalMargins({ "3kg": "", "5kg": "", "10kg": "" });
    setError("");
    toast.success("Margens globais aplicadas com sucesso!");
  };

    const handleExportPDF = () => {
  try {
    const rows = products.map(p => {
      const m = getMargins(p.id);
      return {
        nome: p.nome,
        p10: formatCurrency(calculateWholesalePrice(p.preco_compra, 10, m.margem_10kg)),
        p5: formatCurrency(calculateWholesalePrice(p.preco_compra, 5, m.margem_5kg)),
        p3: formatCurrency(calculateWholesalePrice(p.preco_compra, 3, m.margem_3kg)),
      };
    });

    const date = new Date().toLocaleDateString('pt-BR');
    const title = 'Tabela de Preços - Atacado';
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
            <th class="right">10kg</th>
            <th class="right">5kg</th>
            <th class="right">3kg</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.nome}</td>
              <td class="right">${r.p10}</td>
              <td class="right">${r.p5}</td>
              <td class="right">${r.p3}</td>
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
    toast.error('Falha ao gerar o PDF do atacado');
  }
};

    

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">Clientes Atacado</CardTitle>
              <CardDescription className="text-muted-foreground">
                Defina margens de lucro para vendas no atacado (3kg, 5kg, 10kg)
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
                Margens Globais
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
                  <TableHead className="text-right">Preço Compra (kg)</TableHead>
                  <TableHead className="text-right">Margem 10kg (%)</TableHead>
                  <TableHead className="text-right">Preço 10kg</TableHead>
                  <TableHead className="text-right">Margem 5kg (%)</TableHead>
                  <TableHead className="text-right">Preço 5kg</TableHead>
                  <TableHead className="text-right">Margem 3kg (%)</TableHead>
                  <TableHead className="text-right">Preço 3kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const productMargins = getMargins(product.id);
                  const price10kg = calculateWholesalePrice(product.preco_compra, 10, productMargins.margem_10kg);
                  const price5kg = calculateWholesalePrice(product.preco_compra, 5, productMargins.margem_5kg);
                  const price3kg = calculateWholesalePrice(product.preco_compra, 3, productMargins.margem_3kg);

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

                      {/* 10kg */}
                      <TableCell className="text-right">
                        {editingId === product.id && editField === "10kg" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 text-right bg-input-background border-border"
                              step="0.1"
                              min="0"
                              autoFocus
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="p-1 h-auto hover:bg-muted"
                            onClick={() => handleEditClick(product.id, "10kg")}
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={productMargins.margem_10kg}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="text-primary"
                              >
                                {formatPercentage(productMargins.margem_10kg)}
                              </motion.span>
                            </AnimatePresence>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={price10kg}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(price10kg)}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>

                      {/* 5kg */}
                      <TableCell className="text-right">
                        {editingId === product.id && editField === "5kg" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 text-right bg-input-background border-border"
                              step="0.1"
                              min="0"
                              autoFocus
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="p-1 h-auto hover:bg-muted"
                            onClick={() => handleEditClick(product.id, "5kg")}
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={productMargins.margem_5kg}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="text-primary"
                              >
                                {formatPercentage(productMargins.margem_5kg)}
                              </motion.span>
                            </AnimatePresence>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={price5kg}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(price5kg)}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>

                      {/* 3kg */}
                      <TableCell className="text-right">
                        {editingId === product.id && editField === "3kg" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 text-right bg-input-background border-border"
                              step="0.1"
                              min="0"
                              autoFocus
                            />
                            <span className="text-muted-foreground text-xs">%</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            className="p-1 h-auto hover:bg-muted"
                            onClick={() => handleEditClick(product.id, "3kg")}
                          >
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={productMargins.margem_3kg}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="text-primary"
                              >
                                {formatPercentage(productMargins.margem_3kg)}
                              </motion.span>
                            </AnimatePresence>
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={price3kg}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {formatCurrency(price3kg)}
                          </motion.div>
                        </AnimatePresence>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Save/Cancel buttons for inline edit */}
          {editingId && (
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Global Margins Dialog */}
      <Dialog open={showGlobalDialog} onOpenChange={setShowGlobalDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Aplicar Margens Globais - Atacado</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Estas margens serão aplicadas a todos os {products.length} produtos no atacado.
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
              <Label htmlFor="margin-10kg">Margem 10kg (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="margin-10kg"
                  type="number"
                  value={globalMargins["10kg"]}
                  onChange={(e) => setGlobalMargins({ ...globalMargins, "10kg": e.target.value })}
                  placeholder="Ex: 18"
                  className="bg-input-background border-border"
                  step="0.1"
                  min="0"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin-5kg">Margem 5kg (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="margin-5kg"
                  type="number"
                  value={globalMargins["5kg"]}
                  onChange={(e) => setGlobalMargins({ ...globalMargins, "5kg": e.target.value })}
                  placeholder="Ex: 22"
                  className="bg-input-background border-border"
                  step="0.1"
                  min="0"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="margin-3kg">Margem 3kg (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="margin-3kg"
                  type="number"
                  value={globalMargins["3kg"]}
                  onChange={(e) => setGlobalMargins({ ...globalMargins, "3kg": e.target.value })}
                  placeholder="Ex: 25"
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
                setGlobalMargins({ "3kg": "", "5kg": "", "10kg": "" });
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApplyGlobalMargins}
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

