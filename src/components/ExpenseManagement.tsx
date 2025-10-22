import { useState } from "react";
import { Expense, ExpenseCategory } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface ExpenseManagementProps {
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const PALETTE = ['#4F6139','#BFAF90','#C7BCA5','#EFE9E1','#8DA67B','#DCD3C3','#9DB39B'];
const CATEGORY_COLORS: Record<string, string> = {
  Mercadoria: "#4F6139",
  Embalagens: "#BFAF90",
  Frete: "#C7BCA5",
  Outros: "#EFE9E1",
};

const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Mercadoria: "🛒",
  Embalagens: "📦",
  Frete: "🚚",
  Outros: "📌",
};

export function ExpenseManagement({ expenses, onUpdateExpenses }: ExpenseManagementProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  // Custom categories and month helpers
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('expense_custom_categories')||'[]'); } catch { return []; }
  });
  const [newCategory, setNewCategory] = useState("");
  const addCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    if (["Mercadoria","Embalagens","Frete","Outros",...customCategories].includes(name)) { toast.message('Categoria já existe'); return; }
    const next = [...customCategories, name];
    setCustomCategories(next);
    try { localStorage.setItem('expense_custom_categories', JSON.stringify(next)); } catch {}
    setNewCategory("");
    toast.success('Categoria adicionada');
  };

  const stepMonth = (delta: number) => {
    const months = availableMonths.filter((m) => m !== 'all');
    if (months.length === 0) return;
    if (selectedMonth === 'all' || !months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
      return;
    }
    const idx = months.indexOf(selectedMonth);
    const next = Math.min(Math.max(idx + delta, 0), months.length - 1);
    if (next !== idx) setSelectedMonth(months[next]);
  };
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    categoria: "Mercadoria" as ExpenseCategory,
    data: new Date().toISOString().split('T')[0],
    observacoes: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      valor: "",
      categoria: "Mercadoria" as ExpenseCategory,
      data: new Date().toISOString().split('T')[0],
      observacoes: "",
    });
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      nome: formData.nome,
      valor,
      categoria: formData.categoria,
      data: new Date(formData.data),
      observacoes: formData.observacoes || undefined,
    };

    if (editingExpense) {
      const updatedExpenses = expenses.map(e => e.id === editingExpense.id ? newExpense : e);
      onUpdateExpenses(updatedExpenses);
      toast.success("Gasto atualizado com sucesso!");
    } else {
      onUpdateExpenses([...expenses, newExpense]);
      toast.success("Gasto adicionado com sucesso!");
    }

    setShowAddDialog(false);
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      nome: expense.nome,
      valor: expense.valor.toString(),
      categoria: expense.categoria,
      data: expense.data.toISOString().split('T')[0],
      observacoes: expense.observacoes || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (id: string) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    onUpdateExpenses(updatedExpenses);
    toast.success("Gasto excluído com sucesso!");
  };

  // Filter expenses by selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.data);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month - 1;
  }).sort((a, b) => b.data.getTime() - a.data.getTime());

  // Calculate totals by category
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.categoria] = (acc[expense.categoria] || 0) + expense.valor;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.valor, 0);

  // Prepare chart data
  const chartData = Object.entries(categoryTotals).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
    percentage: ((valor / totalExpenses) * 100).toFixed(1),
  }));

  // Get available months from expenses
  // Months that actually have expenses (ascending)
  const availableMonths = Array.from(
    new Set(
      expenses.map(e => {
        const date = new Date(e.data);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort();

  // Ensure current month is present even when there are no expenses
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  if (!availableMonths.includes(currentMonth)) {
    availableMonths.push(currentMonth);
    availableMonths.sort();
  }
  // Add 'all' at the top for convenience
  if (!availableMonths.includes('all')) {
    availableMonths.unshift('all');
  }
  // If current selection is not available (e.g., after data change), snap to current month
  if (!availableMonths.includes(selectedMonth)) {
    setSelectedMonth(currentMonth);
  }

  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-primary" />
                Controle de Gastos
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Gerencie e monitore todos os gastos da loja
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => stepMonth(-1)} className="border-border">Anterior</Button>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-card border-border">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {month === 'all' ? 'Todos os meses' : formatMonthYear(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => stepMonth(1)} className="border-border">Próximo</Button>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Gasto
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Categories manager */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-input-background border-border"
              />
              <Button variant="outline" onClick={addCategory} className="border-border">Adicionar</Button>
            </div>
            {customCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {customCategories.map(c => (
                  <Badge key={c} variant="outline" className="border-border">{c}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total do Mês</p>
                <p className="text-primary mt-1">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {(["Mercadoria", "Embalagens", "Frete"] as ExpenseCategory[]).map(categoria => (
          <Card key={categoria} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{categoria}</p>
                  <p className="text-foreground mt-1">
                    {formatCurrency(categoryTotals[categoria] || 0)}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${CATEGORY_COLORS[categoria]}20` }}
                >
                  {CATEGORY_ICONS[categoria]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição por Categoria</CardTitle>
            <CardDescription className="text-muted-foreground">
              Visualização dos gastos do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Valor",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[320px] w-full max-w-[560px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || PALETTE[index % PALETTE.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>Nenhum gasto registrado neste mês</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Gastos do Mês</CardTitle>
            <CardDescription className="text-muted-foreground">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'registro' : 'registros'} em {formatMonthYear(selectedMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Nenhum gasto registrado neste mês
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(expense.data).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground">{expense.nome}</p>
                            {expense.observacoes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {expense.observacoes}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: CATEGORY_COLORS[expense.categoria],
                              color: CATEGORY_COLORS[expense.categoria],
                            }}
                          >
                            {CATEGORY_ICONS[expense.categoria]} {expense.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-foreground">
                            {formatCurrency(expense.valor)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(expense)}
                              className="border-border"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingExpense ? "Editar Gasto" : "Novo Gasto"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preencha os dados do gasto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Gasto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="bg-input-background border-border"
                  placeholder="Ex: Castanha de Caju - 50kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                  className="bg-input-background border-border"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value as ExpenseCategory })}
                >
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercadoria">Mercadoria</SelectItem>
                    <SelectItem value="Embalagens">Embalagens</SelectItem>
                    <SelectItem value="Frete">Frete</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="bg-input-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="bg-input-background border-border"
                rows={3}
                placeholder="Informações adicionais sobre o gasto..."
              />
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
                {editingExpense ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}




