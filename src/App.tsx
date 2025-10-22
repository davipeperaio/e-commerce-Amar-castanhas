import { useState, useEffect } from "react";
import { PublicStorefront } from "./components/PublicStorefront";
import { LoginPage } from "./components/LoginPage";
import { ProductManagement } from "./components/ProductManagement";
import { RetailMargins } from "./components/RetailMargins";
import { WholesaleMargins } from "./components/WholesaleMargins";
import { ExpenseManagement } from "./components/ExpenseManagement";
import { mockProducts, defaultRetailMargins, defaultWholesaleMargins, mockExpenses } from "./lib/mockData";
import { supabase, isSupabaseEnabled } from "./lib/supabase";
import { Product, CartItem, RetailMargin, WholesaleMargins as WholesaleMarginsType, WeightOption, Expense, Customer, Sale } from "./lib/types";
import { CustomerManagement } from "./components/CustomerManagement";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [retailMargins, setRetailMargins] = useState<RetailMargin[]>(defaultRetailMargins);
  const [wholesaleMargins, setWholesaleMargins] = useState<WholesaleMarginsType[]>(defaultWholesaleMargins);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Check for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(storedUser);
      setIsAuthenticated(true);
      setShowAdmin(true);
    }
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
        if (!p.error && p.data) setProducts(p.data as Product[]);
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

  // Persist helpers (upsert); fallback to state-only when Supabase disabled
  const persistProducts = async (items: Product[]) => {
    setProducts(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      await supabase.from("products").upsert(items as any, { onConflict: "id" });
    } catch (e) { console.error(e); }
  };

  const persistRetailMargins = async (items: RetailMargin[]) => {
    setRetailMargins(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      const rows = items.map(i => ({ product_id: i.productId, margem: i.margem }));
      await supabase.from("retail_margins").upsert(rows as any, { onConflict: "product_id" });
    } catch (e) { console.error(e); }
  };

  const persistWholesaleMargins = async (items: WholesaleMarginsType[]) => {
    setWholesaleMargins(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      await supabase.from("wholesale_margins").upsert(items as any, { onConflict: "product_id" });
    } catch (e) { console.error(e); }
  };

  const persistExpenses = async (items: Expense[]) => {
    setExpenses(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      const rows = items.map(i => ({ ...i, data: (i.data as any)?.toISOString?.() ?? i.data }));
      await supabase.from("expenses").upsert(rows as any, { onConflict: "id" });
    } catch (e) { console.error(e); }
  };

  const persistCustomers = async (items: Customer[]) => {
    setCustomers(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      const rows = items.map(i => ({ ...i, created_at: (i.createdAt as any)?.toISOString?.() ?? i.createdAt }));
      await supabase.from("customers").upsert(rows as any, { onConflict: "id" });
    } catch (e) { console.error(e); }
  };

  const persistSales = async (items: Sale[]) => {
    setSales(items);
    if (!isSupabaseEnabled || !supabase) return;
    try {
      const rows = items.map(i => ({ ...i, date: (i.date as any)?.toISOString?.() ?? i.date, customer_id: i.customerId ?? null }));
      await supabase.from("sales").upsert(rows as any, { onConflict: "id" });
    } catch (e) { console.error(e); }
  };
  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    setIsAuthenticated(true);
    setShowAdmin(true);
    localStorage.setItem("currentUser", email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser("");
    setShowAdmin(false);
    localStorage.removeItem("currentUser");
    setCurrentTab("products");
  };

  const handleAddToCart = (product: Product, weight: WeightOption) => {
    const existingItemIndex = cart.findIndex(
      item => item.product.id === product.id && item.weight === weight
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
    if (!isAuthenticated) {
      // Just show the login modal - we'll use the LoginPage as a modal-like overlay
      setShowAdmin(true);
    } else {
      setShowAdmin(true);
    }
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
                <h2 className="text-foreground">Dashboard Administrativo</h2>
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
