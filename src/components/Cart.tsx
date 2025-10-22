import { useState } from "react";
import { CartItem, PaymentMethod } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Minus, Plus, Trash2, CreditCard, Smartphone, Banknote } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface CartProps {
  cart: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
  onCheckout?: (data: { items: CartItem[]; total: number; paymentMethod: PaymentMethod; installments?: number; date: Date }) => void;
}

export function Cart({ cart, onUpdateCart, onCheckout }: CartProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [installments, setInstallments] = useState<number>(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    
    onUpdateCart(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    onUpdateCart(newCart);
    toast.success("Item removido do carrinho");
  };

  const total = cart.reduce((sum, item) => {
    return sum + item.product.prices[item.weight] * item.quantity;
  }, 0);

  const handleFinalizePurchase = () => {
    if (cart.length === 0) {
      toast.error("Seu carrinho estÃ¡ vazio");
      return;
    }

    try { onCheckout?.({ items: cart, total, paymentMethod, installments: showInstallments ? installments : undefined, date: new Date() }); } catch (e) { console.error(e); }
    setShowSuccessDialog(true);
    
    // Clear cart after successful purchase
    setTimeout(() => {
      onUpdateCart([]);
      setShowSuccessDialog(false);
      toast.success("Pedido realizado com sucesso!");
    }, 2000);
  };

  const maxInstallments = 10;
  const showInstallments = paymentMethod === "credit" && total > 300;

  return (
    <div className="flex flex-col h-full">
      {cart.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Seu carrinho estÃ¡ vazio</p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione produtos para continuar
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {cart.map((item, index) => {
              const itemPrice = item.product.prices[item.weight];
              const subtotal = itemPrice * item.quantity;

              return (
                <Card key={`${item.product.id}-${item.weight}`} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.imagem_url}
                          alt={item.product.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-foreground truncate">{item.product.nome}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Peso: {item.weight}
                            </p>
                            <p className="text-sm text-primary mt-1">
                              {formatCurrency(itemPrice)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(index, -1)}
                              className="h-8 w-8"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(index, 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-foreground">
                            {formatCurrency(subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Payment & Checkout */}
          <div className="border-t border-border pt-6 space-y-6">
            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Forma de Pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Smartphone className="w-4 h-4 text-primary" />
                    PIX
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-4 h-4 text-primary" />
                    CrÃ©dito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Banknote className="w-4 h-4 text-primary" />
                    DÃ©bito
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Installments */}
            {showInstallments && (
              <div className="space-y-2">
                <Label>Parcelamento</Label>
                <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x de {formatCurrency(total / num)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Total */}
            <div className="space-y-2">
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              {showInstallments && installments > 1 && (
                <p className="text-xs text-muted-foreground text-right">
                  {installments}x de {formatCurrency(total / installments)}
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleFinalizePurchase}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Finalizar Compra
            </Button>
          </div>
        </>
      )}

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Pedido Confirmado!</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Seu pedido foi realizado com sucesso. Obrigado pela preferência!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary hover:bg-primary/90 text-primary-foreground">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

