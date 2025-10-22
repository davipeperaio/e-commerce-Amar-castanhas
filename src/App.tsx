import { useState, useEffect } from "react";
import { PublicStorefront } from "./components/PublicStorefront";
import { LoginPage } from "./components/LoginPage";
import { ProductManagement } from "./components/ProductManagement";
import { RetailMargins } from "./components/RetailMargins";
import { WholesaleMargins } from "./components/WholesaleMargins";
import { ExpenseManagement } from "./components/ExpenseManagement";
import { mockProducts, defaultRetailMargins, defaultWholesaleMargins, mockExpenses } from "./lib/mockData";
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
            setSales((prev) => [
              {
                id: `s-${Date.now()}`,
                date,
                customerId: null,
                valor: total,
                origem: "loja",
                observacoes: `${paymentMethod}${installments ? ` ${installments}x` : ""}`,
              },
              ...prev,
            ]);
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
                onUpdateProducts={setProducts}
              />
            )}
            {currentTab === "retail" && (
              <RetailMargins
                products={products}
                margins={retailMargins}
                onUpdateMargins={setRetailMargins}
                onUpdateProducts={setProducts}
              />
            )}
            {currentTab === "wholesale" && (
              <WholesaleMargins
                products={products}
                margins={wholesaleMargins}
                onUpdateMargins={setWholesaleMargins}
              />
            )}
            {currentTab === "expenses" && (
              <ExpenseManagement
                expenses={expenses}
                onUpdateExpenses={setExpenses}
              />
            )}
            {currentTab === "customers" && (
              <CustomerManagement
                customers={customers}
                sales={sales}
                onUpdateCustomers={setCustomers}
                onUpdateSales={setSales}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
