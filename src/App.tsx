import { useState, useEffect, useRef } from "react";
import { PublicStorefront } from "./components/PublicStorefront";
import { LoginPage } from "./components/LoginPage";
import { ProductManagement } from "./components/ProductManagement";
import { RetailMargins } from "./components/RetailMargins";
import { WholesaleMargins } from "./components/WholesaleMargins";
import { ExpenseManagement } from "./components/ExpenseManagement";
// Removed mock data; load from Supabase or start empty
import { supabase, isSupabaseEnabled } from "./lib/supabase";
import { Product, CartItem, RetailMargin, WholesaleMargins as WholesaleMarginsType, WeightOption, Expense, Customer, Sale } from "./lib/types";
import { CustomerManagement } from "./components/CustomerManagement";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Package, Users, Briefcase, LogOut, Menu, X, Store, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type AdminTab = "products" | "retail" | "wholesale" | "expenses" | "customers";

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [currentTab, setCurrentTab] = useState<AdminTab>("products");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [retailMargins, setRetailMargins] = useState<RetailMargin[]>([]);
  const [wholesaleMargins, setWholesaleMargins] = useState<WholesaleMarginsType[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const productsSaveSeq = useRef(0);

  // Local session fallback
  useEffect(() => {
    // restore last selected admin tab
    try {
      const savedTab = localStorage.getItem("currentTab") as AdminTab | null;
      if (savedTab) setCurrentTab(savedTab);
    } catch {}
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(storedUser);
      setIsAuthenticated(true);
      setShowAdmin(true);
    }
  }, []);

  // persist selected admin tab
  useEffect(() => {
    try { localStorage.setItem("currentTab", currentTab); } catch {}
  }, [currentTab]);

  // Supabase auth listener
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.email ?? "");
        setIsAuthenticated(true);
      }
    })();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (sess?.user) {
        setCurrentUser(sess.user.email ?? "");
        setIsAuthenticated(true);
      } else {
        setCurrentUser("");
        setIsAuthenticated(false);
        localStorage.removeItem("currentUser");
      }
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  // Load data from Supabase if configured
  useEffect(() => {
    (async () => {
      if (!isSupabaseEnabled || !supabase) return;
      try {
        const [p, rm, wm, ex, cu, sa] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("retail_margins").select("*"),
          supabase.from("wholesale_margins").select("*"),
          supabase.from("expenses").select("*"),
          supabase.from("customers").select("*"),
          supabase.from("sales").select("*"),
        ]);
        if (!p.error && p.data) {
          const mapped = (p.data as any[]).map((row) => ({
            id: row.id,
            sku: row.sku,
            nome: row.nome,
            categoria: row.categoria,
            descricao: row.descricao ?? "",
            preco_compra: Number(row.preco_compra),
            prices: row.prices,
            imagem_url: row.imagem_url ?? "",
            unidade: row.unidade ?? "kg",
            ativo: row.ativo ?? true,
            emEstoque: row.em_estoque ?? true,
            availableWeights: row.available_weights ?? ["200g", "500g", "1kg"],
          })) as Product[];
          setProducts(mapped);
        }
        if (!rm.error && rm.data) setRetailMargins((rm.data as any[]).map(r => ({ productId: r.product_id, margem: Number(r.margem) })));
        if (!wm.error && wm.data) setWholesaleMargins(wm.data as unknown as WholesaleMarginsType[]);
        if (!ex.error && ex.data) setExpenses((ex.data as any[]).map(e => ({ ...e, data: new Date(e.data) })) as Expense[]);
        if (!cu.error && cu.data) setCustomers((cu.data as any[]).map(c => ({ ...c, createdAt: new Date(c.created_at) })) as Customer[]);
        if (!sa.error && sa.data) setSales((sa.data as any[]).map(s => ({ ...s, date: new Date(s.date), customerId: s.customer_id })) as Sale[]);
      } catch (e) {
        console.error("Failed to load data from Supabase", e);
      }
    })();
  }, []);

  // Persist helpers
  const persistProducts = async (items: Product[]) => {
    // Sequence gate to avoid race conditions and UI flicker
    const seq = ++productsSaveSeq.current;
    // Optimistic UI update
    setProducts(items);
    // compute deletions (present before, absent now)
    const prev = products;
    if (!isSupabaseEnabled || !supabase) return;
    const prevIds = new Set(prev.map(p => p.id));
    const nextIds = new Set(items.map(p => p.id));
    const removedIds = [...prevIds].filter(id => !nextIds.has(id));
    if (removedIds.length) {
      const del = await supabase.from("products").delete().in("id", removedIds);
      if (del.error) {
        toast.error(`Erro ao excluir produtos: ${del.error.message}`);
        console.error("Erro ao excluir produtos:", del.error);
      }
    }
    const rows = items.map((p) => ({
      id: p.id,
      sku: p.sku,
      nome: p.nome,
      categoria: p.categoria,
      descricao: p.descricao ?? "",
      preco_compra: p.preco_compra,
      prices: p.prices,
      imagem_url: p.imagem_url ?? "",
      unidade: p.unidade ?? "kg",
      ativo: p.ativo,
      em_estoque: p.emEstoque,
      available_weights: p.availableWeights,
    }));
    const resp = await supabase.from("products").upsert(rows as any, { onConflict: "id" });
    if (resp.error) {
      toast.error(`Erro ao salvar produtos: ${resp.error.message}`);
      console.error("Erro ao salvar produtos:", resp.error);
    } else {
      // Read-after-write to keep estado = banco, evitando divergência após CSV/import
      const fresh = await supabase.from("products").select("*");
      if (!fresh.error && fresh.data) {
        // Ignore stale responses
        if (seq !== productsSaveSeq.current) return;
        let mapped = (fresh.data as any[]).map((row) => ({
          id: row.id,
          sku: row.sku,
          nome: row.nome,
          categoria: row.categoria,
          descricao: row.descricao ?? "",
          preco_compra: Number(row.preco_compra),
          prices: row.prices,
          imagem_url: row.imagem_url ?? "",
          unidade: row.unidade ?? "kg",
          ativo: row.ativo ?? true,
          emEstoque: row.em_estoque ?? true,
          availableWeights: row.available_weights ?? ["200g", "500g", "1kg"],
        })) as Product[];

        // Deduplicar por SKU: manter apenas 1 por SKU (prioriza os IDs presentes em 'items')
        const keepIds = new Set(items.map(p => p.id));
        const bySku = new Map<string, Product[]>();
        for (const p of mapped) {
          const arr = bySku.get(p.sku) || [];
          arr.push(p);
          bySku.set(p.sku, arr);
        }
        const toKeep: Product[] = [];
        const toDeleteIds: string[] = [];
        for (const [sku, arr] of bySku) {
          if (arr.length === 1) { toKeep.push(arr[0]); continue; }
          const preferred = arr.find(p => keepIds.has(p.id)) || arr[0];
          toKeep.push(preferred);
          for (const p of arr) if (p.id !== preferred.id) toDeleteIds.push(p.id);
        }
        if (toDeleteIds.length) {
          const delDup = await supabase.from("products").delete().in("id", toDeleteIds);
          if (delDup.error) console.warn("Falha ao limpar duplicatas por SKU:", delDup.error);
          mapped = toKeep;
        }
        setProducts(mapped);
      }
      toast.success("Produtos salvos no banco com sucesso!");
    }
  };

  const persistRetailMargins = async (items: RetailMargin[]) => {
    setRetailMargins(items);
    if (!isSupabaseEnabled || !supabase) return;
    const rows = items.map(i => ({ product_id: i.productId, margem: i.margem }));
    const resp = await supabase.from("retail_margins").upsert(rows as any, { onConflict: "product_id" });
    if (resp.error) {
      toast.error(`Erro ao salvar margens de varejo: ${resp.error.message}`);
      console.error("Erro ao salvar varejo:", resp.error);
    } else {
      toast.success("Margens de varejo salvas!");
    }
  };

  const persistWholesaleMargins = async (items: WholesaleMarginsType[]) => {
    setWholesaleMargins(items);
    if (!isSupabaseEnabled || !supabase) return;
    const rows = items.map((m) => ({
      product_id: m.productId,
      margem_3kg: m.margem_3kg,
      margem_5kg: m.margem_5kg,
      margem_10kg: m.margem_10kg,
    }));
    const resp = await supabase.from("wholesale_margins").upsert(rows as any, { onConflict: "product_id" });
    if (resp.error) {
      toast.error(`Erro ao salvar margens de atacado: ${resp.error.message}`);
      console.error("Erro ao salvar atacado:", resp.error);
    } else {
      toast.success("Margens de atacado salvas!");
    }
  };

  const persistExpenses = async (items: Expense[]) => {
    const prev = expenses;
    setExpenses(items);
    if (!isSupabaseEnabled || !supabase) return;
    const prevIds = new Set(prev.map(e => e.id));
    const nextIds = new Set(items.map(e => e.id));
    const removedIds = [...prevIds].filter(id => !nextIds.has(id));
    if (removedIds.length) {
      const del = await supabase.from("expenses").delete().in("id", removedIds);
      if (del.error) {
        toast.error(`Erro ao excluir gastos: ${del.error.message}`);
        console.error("Erro ao excluir gastos:", del.error);
      }
    }
    const rows = items.map(e => ({ ...e, data: e.data.toISOString() }));
    const resp = await supabase.from("expenses").upsert(rows as any, { onConflict: "id" });
    if (resp.error) {
      toast.error(`Erro ao salvar gastos: ${resp.error.message}`);
      console.error("Erro ao salvar gastos:", resp.error);
    } else {
      toast.success("Gastos salvos!");
    }
  };

  const persistCustomers = async (items: Customer[]) => {
    const prev = customers;
    setCustomers(items);
    if (!isSupabaseEnabled || !supabase) return;
    const prevIds = new Set(prev.map(c => c.id));
    const nextIds = new Set(items.map(c => c.id));
    const removedIds = [...prevIds].filter(id => !nextIds.has(id));
    if (removedIds.length) {
      const del = await supabase.from("customers").delete().in("id", removedIds);
      if (del.error) {
        toast.error(`Erro ao excluir clientes: ${del.error.message}`);
        console.error("Erro ao excluir clientes:", del.error);
      }
    }
    const rows = items.map((c) => ({
      id: c.id,
      nome: c.nome,
      endereco: c.endereco ?? null,
      telefone: c.telefone ?? null,
      ativo: c.ativo,
      created_at: c.createdAt.toISOString(),
    }));
    const resp = await supabase.from("customers").upsert(rows as any, { onConflict: "id" });
    if (resp.error) {
      toast.error(`Erro ao salvar clientes: ${resp.error.message}`);
      console.error("Erro ao salvar clientes:", resp.error);
    } else {
      toast.success("Clientes salvos!");
    }
  };

  const persistSales = async (items: Sale[]) => {
    const prev = sales;
    setSales(items);
    if (!isSupabaseEnabled || !supabase) return;
    const prevIds = new Set(prev.map(s => s.id));
    const nextIds = new Set(items.map(s => s.id));
    const removedIds = [...prevIds].filter(id => !nextIds.has(id));
    if (removedIds.length) {
      const del = await supabase.from("sales").delete().in("id", removedIds);
      if (del.error) {
        toast.error(`Erro ao excluir vendas: ${del.error.message}`);
        console.error("Erro ao excluir vendas:", del.error);
      }
    }
    const rows = items.map(s => ({
      id: s.id,
      date: s.date.toISOString(),
      customer_id: s.customerId ?? null,
      valor: s.valor,
      origem: s.origem,
      observacoes: s.observacoes ?? null,
    }));
    const resp = await supabase.from("sales").upsert(rows as any, { onConflict: "id" });
    if (resp.error) {
      toast.error(`Erro ao salvar vendas: ${resp.error.message}`);
      console.error("Erro ao salvar vendas:", resp.error);
    } else {
      toast.success("Vendas salvas!");
    }
  };

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUser(email);
    setShowAdmin(true);
    localStorage.setItem("currentUser", email);
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseEnabled && supabase) await supabase.auth.signOut();
    } catch {}
    setIsAuthenticated(false);
    setCurrentUser("");
    setShowAdmin(false);
    localStorage.removeItem("currentUser");
    setCurrentTab("products");
  };

  const handleAddToCart = (product: Product, weight: WeightOption) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.weight === weight
    );
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { product, weight, quantity: 1 }]);
    }
  };

  const handleShowLogin = () => {
    setShowAdmin(true);
  };

  // If not authenticated and trying to access admin
  if (showAdmin && !isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onBackToStore={() => setShowAdmin(false)} />;
  }

  // Public storefront
  if (!showAdmin) {
    return (
      <>
        <Toaster />
        <PublicStorefront
          products={products}
          onLogin={handleShowLogin}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateCart={setCart}
          onCheckout={({ items, total, paymentMethod, installments, date }) => {
            const sale: Sale = {
              id: `s-${Date.now()}`,
              date,
              customerId: null,
              valor: total,
              origem: "loja",
              observacoes: `${paymentMethod}${installments ? ` ${installments}x` : ""}`,
            };
            const next = [sale, ...sales];
            persistSales(next);
          }}
        />
      </>
    );
  }

  // Admin dashboard
  const adminTabs = [
    { id: "products" as AdminTab, label: "Cadastrar Produtos", icon: Package },
    { id: "retail" as AdminTab, label: "Clientes Varejo", icon: Users },
    { id: "wholesale" as AdminTab, label: "Clientes Atacado", icon: Briefcase },
    { id: "expenses" as AdminTab, label: "Controle de Gastos", icon: TrendingDown },
    { id: "customers" as AdminTab, label: "Clientes e Vendas", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-foreground font-bold text-lg sm:text-xl tracking-wide leading-tight">Amar Castanhas</h2>
                <p className="text-xs text-muted-foreground">{currentUser}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setCurrentTab(tab.id)}
                    className={
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
              <div className="h-6 w-px bg-border mx-2" />
              <Button
                variant="ghost"
                onClick={() => setShowAdmin(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Store className="w-4 h-4 mr-2" />
                Ver Loja
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        setCurrentTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full justify-start ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </Button>
                  );
                })}
                <div className="h-px bg-border my-2" />
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowAdmin(false);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Ver Loja
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === "products" && (
              <ProductManagement
                products={products}
                onUpdateProducts={persistProducts}
              />
            )}
            {currentTab === "retail" && (
              <RetailMargins
                products={products}
                margins={retailMargins}
                onUpdateMargins={persistRetailMargins}
                onUpdateProducts={persistProducts}
              />
            )}
            {currentTab === "wholesale" && (
              <WholesaleMargins
                products={products}
                margins={wholesaleMargins}
                onUpdateMargins={persistWholesaleMargins}
              />
            )}
            {currentTab === "expenses" && (
              <ExpenseManagement
                expenses={expenses}
                onUpdateExpenses={persistExpenses}
              />
            )}
            {currentTab === "customers" && (
              <CustomerManagement
                customers={customers}
                sales={sales}
                onUpdateCustomers={persistCustomers}
                onUpdateSales={persistSales}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
