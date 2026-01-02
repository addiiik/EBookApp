'use client';

import { Badge } from "@/components/ui/badge";
import { Building, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPricePLN } from "@/lib/utils";
import { CartItemWithBook } from "@/types/book"
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { processCheckout } from "@/app/actions/checkout";

interface CheckoutProps {
  cartItems: CartItemWithBook[]
}

export default function Checkout({cartItems }: CheckoutProps){
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.book.discountedPrice ?? item.book.price;
    return total + price;
  }, 0);

  const subtotal = totalPrice;

  const serviceFee = subtotal * 0.02;

  const taxRate = 0.05;
  const tax = subtotal * taxRate;

  const finalTotal = subtotal + serviceFee + tax;

  async function proceedCheckout() {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const bookIds = cartItems.map(item => item.book.id);

    try {
      const result = await processCheckout(bookIds);
      if (result.success) {
        router.push('/checkout/success');
      }
      else {
        toast.error(result.message);
        setIsLoading(false);
      }
    } catch (error: any) {
      toast.error("Something went wrong");
      setIsLoading(false);
    } 
  }

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-hidden">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Review your order and choose a payment method</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Order Items</h2>
                <Badge variant="outline">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const price = item.book.discountedPrice ?? item.book.price;
                  const hasDiscount = item.book.discountedPrice !== null;
                  
                  return (
                    <div key={item.id} className="flex justify-between items-start py-3 border-b last:border-b-0 gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          by {item.book.author} • {item.book.category}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Digital</p>
                      </div>
                      <div className="text-right shrink-0">
                        {hasDiscount ? (
                          <div>
                            <span className="text-sm font-semibold">{formatPricePLN(price)}</span>
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              {formatPricePLN(item.book.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold">{formatPricePLN(price)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    defaultChecked 
                    className="text-primary focus:ring-primary"
                  />
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, American Express</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="blik" 
                    className="text-primary focus:ring-primary"
                  />
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">BLIK</div>
                    <div className="text-sm text-muted-foreground">Fast Polish mobile payment</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="przelewy24" 
                    className="text-primary focus:ring-primary"
                  />
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Przelewy24</div>
                    <div className="text-sm text-muted-foreground">Bank transfers & fast online payments</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="payu" 
                    className="text-primary focus:ring-primary"
                  />
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">PayU</div>
                    <div className="text-sm text-muted-foreground">Popular payment provider in Poland</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="paypal" 
                    className="text-primary focus:ring-primary"
                  />
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-muted-foreground">Pay with your PayPal account</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="apple" 
                    className="text-primary focus:ring-primary"
                  />
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Apple Pay</div>
                    <div className="text-sm text-muted-foreground">Quick and secure payment</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="google" 
                    className="text-primary focus:ring-primary"
                  />
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Google Pay</div>
                    <div className="text-sm text-muted-foreground">Fast checkout with Google</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-muted/30 rounded-lg p-6 sticky top-34">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPricePLN(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Service Fee (2%)</span>
                    <span>{formatPricePLN(serviceFee)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tax (5% VAT - Poland)</span>
                    <span>{formatPricePLN(tax)}</span>
                  </div>

                  <hr className="my-3" />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatPricePLN(finalTotal)}</span>
                  </div>
                </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                <p className="text-blue-800">
                  <strong>Digital Delivery:</strong> Your e-books will be available for reading immediately after purchase.
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={proceedCheckout}>
                Complete Purchase
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}