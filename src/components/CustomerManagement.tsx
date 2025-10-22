import { useMemo, useState } from "react";
import { Customer, Sale } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Users, ShoppingBag } from "lucide-react";

interface CustomerManagementProps {
  customers: Customer[];
  sales: Sale[];
  onUpdateCustomers: (customers: Customer[]) => void;
  onUpdateSales: (sales: Sale[]) => void;
}

export function CustomerManagement({ customers, sales, onUpdateCustomers, onUpdateSales }: CustomerManagementProps) {
  const [tab, setTab] = useState<"clientes" | "vendas">("clientes");

  const formatPhoneBR = (value?: string) => {
    if (!value) return "-";
    const d = value.replace(/\D/g, "");
    const digits = d.startsWith("55") && d.length > 11 ? d.slice(2) : d;
    if (digits.length >= 11) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6,10)}`;
    }
    if (digits.length === 9) {
      return `${digits.slice(0,5)}-${digits.slice(5)}`;
    }
    if (digits.length === 8) {
      return `${digits.slice(0,4)}-${digits.slice(4)}`;
    }
    return value;
  };

  // Customer form
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({ nome: "", endereco: "", telefone: "" });

  const resetCustomerForm = () => {
    setCustomerForm({ nome: "", endereco: "", telefone: "" });
    setEditingCustomer(null);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = customerForm.nome.trim();
    if (!nome) { toast.error("Informe o nome do cliente"); return; }
    if (editingCustomer) {
      const updated = customers.map(c => c.id === editingCustomer.id ? { ...editingCustomer, ...customerForm } : c);
      onUpdateCustomers(updated);
      toast.success("Cliente atualizado!");
    } else {
      const newCustomer: Customer = {
        id: `c-${Date.now()}`,
        nome,
        endereco: customerForm.endereco || undefined,
        telefone: customerForm.telefone || undefined,
        ativo: true,
        createdAt: new Date(),
      };
      onUpdateCustomers([newCustomer, ...customers]);
      toast.success("Cliente adicionado!");
    }
    setShowCustomerDialog(false);
    resetCustomerForm();
  };

  const handleDeleteCustomer = (id: string) => {
    const hasSales = sales.some(s => s.customerId === id);
    if (hasSales) { toast.error("Não é possível remover: existem vendas vinculadas."); return; }
    onUpdateCustomers(customers.filter(c => c.id !== id));
    toast.success("Cliente removido");
  };

  const handleToggleActive = (id: string) => {
    onUpdateCustomers(customers.map(c => c.id === id ? { ...c, ativo: !c.ativo } : c));
  };

  // Sales form
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [saleForm, setSaleForm] = useState<{ customerId: string | "loja"; valor: string; observacoes: string }>(
    { customerId: "loja", valor: "", observacoes: "" }
  );

  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(saleForm.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) { toast.error("Informe um valor válido"); return; }
    const saleBase = {
      customerId: saleForm.customerId === "loja" ? null : saleForm.customerId,
      valor,
      observacoes: saleForm.observacoes || undefined,
    };
    if (editingSale) {
      const updated = sales.map(s => s.id === editingSale.id ? { ...editingSale, ...saleBase } : s);
      onUpdateSales(updated);
      toast.success("Venda atualizada!");
    } else {
      const newSale: Sale = {
        id: `s-${Date.now()}`,
        date: new Date(),
        origem: saleForm.customerId === "loja" ? "loja" : "manual",
        ...saleBase,
      };
      onUpdateSales([newSale, ...sales]);
      toast.success("Venda registrada!");
    }
    setShowSaleDialog(false);
    setEditingSale(null);
    setSaleForm({ customerId: "loja", valor: "", observacoes: "" });
  };

  const handleDeleteSale = (id: string) => {
    onUpdateSales(sales.filter(s => s.id !== id));
    toast.success("Venda removida");
  };

  const customersById = useMemo(() => Object.fromEntries(customers.map(c => [c.id, c])), [customers]);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Clientes e Vendas
              </CardTitle>
              <CardDescription className="text-muted-foreground">Cadastre clientes e registre vendas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setTab("clientes"); setShowCustomerDialog(true); }} className="border-border">
                <Plus className="w-4 h-4 mr-2" /> Novo Cliente
              </Button>
              <Button onClick={() => { setTab("vendas"); setShowSaleDialog(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ShoppingBag className="w-4 h-4 mr-2" /> Nova Venda
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
                <TabsTrigger value="vendas">Vendas</TabsTrigger>
              </TabsList>
              <TabsContent value="clientes">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Clientes</CardTitle>
                    <CardDescription className="text-muted-foreground">{customers.length} cadastrados</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Nome</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Telefone/WhatsApp</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((c) => (
                            <TableRow key={c.id} className="hover:bg-muted/30">
                              <TableCell>{c.nome}</TableCell>
                              <TableCell>{c.endereco || "-"}</TableCell>
                              <TableCell>{formatPhoneBR(c.telefone)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="outline" onClick={() => { setEditingCustomer(c); setCustomerForm({ nome: c.nome, endereco: c.endereco || "", telefone: c.telefone || "" }); setShowCustomerDialog(true); }}>Editar</Button>
                                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(c.id)}>{c.ativo ? "Desativar" : "Ativar"}</Button>
                                  <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCustomer(c.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {customers.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum cliente cadastrado</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="vendas">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Vendas</CardTitle>
                    <CardDescription className="text-muted-foreground">{sales.length} registro(s)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales.map((s) => (
                            <TableRow key={s.id} className="hover:bg-muted/30">
                              <TableCell>{new Date(s.date).toLocaleString("pt-BR")}</TableCell>
                              <TableCell>{s.customerId ? (customersById[s.customerId]?.nome || "-") : "Loja"}</TableCell>
                              <TableCell className="text-right">{formatCurrency(s.valor)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button size="sm" variant="outline" onClick={() => { setEditingSale(s); setSaleForm({ customerId: s.customerId || "loja", valor: String(s.valor), observacoes: s.observacoes || "" }); setShowSaleDialog(true); }}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSale(s.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {sales.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma venda registrada</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      {/* Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingCustomer ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Preencha os dados do cliente</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCustomer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" required value={customerForm.nome} onChange={(e) => setCustomerForm({ ...customerForm, nome: e.target.value })} className="bg-input-background border-border"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={customerForm.endereco} onChange={(e) => setCustomerForm({ ...customerForm, endereco: e.target.value })} className="bg-input-background border-border"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                <Input id="telefone" value={customerForm.telefone} onChange={(e) => setCustomerForm({ ...customerForm, telefone: e.target.value })} className="bg-input-background border-border"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowCustomerDialog(false); resetCustomerForm(); }}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingCustomer ? "Salvar" : "Adicionar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sale Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={setShowSaleDialog}>
        <DialogContent className="max-w-xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingSale ? "Editar Venda" : "Nova Venda"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Informe os dados da venda</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSale} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={saleForm.customerId} onValueChange={(v) => setSaleForm({ ...saleForm, customerId: v })}>
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja">Loja (sem cliente)</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input id="valor" type="number" step="0.01" min="0" value={saleForm.valor} onChange={(e) => setSaleForm({ ...saleForm, valor: e.target.value })} required className="bg-input-background border-border"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea id="obs" rows={2} value={saleForm.observacoes} onChange={(e) => setSaleForm({ ...saleForm, observacoes: e.target.value })} className="bg-input-background border-border"/>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowSaleDialog(false); setEditingSale(null); }}>Cancelar</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{editingSale ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
