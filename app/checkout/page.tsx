import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Building } from 'lucide-react';
import { revalidatePath } from 'next/cache';

async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { book: { title: 'asc' } },
  });
}

async function checkout(userId: string) {
  'use server';

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
  });

  if (!cartItems.length) return;

  const data = cartItems.map((item) => ({
    userId,
    bookId: item.bookId,
  }));

  const bookIds = cartItems.map((item) => item.bookId);

  await prisma.$transaction([
    prisma.purchasedBook.createMany({
      data,
      skipDuplicates: true,
    }),
    prisma.cartItem.deleteMany({ where: { userId } }),
    prisma.wishlistItem.deleteMany({
      where: {
        userId,
        bookId: { in: bookIds },
      },
    }),
  ]);

  revalidatePath('/checkout');
  
  const bookIdsParam = bookIds.join(',');
  redirect(`/checkout/success?books=${bookIdsParam}`);
}

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin?redirect=/checkout');
  }

  const userId = session.user.id;
  const cartItems = await getCartItems(userId);

  if (cartItems.length === 0) {
    redirect('/cart');
  }

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.book.discountedPrice ?? item.book.price;
    return total + price;
  }, 0);

  return (
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
                    <div className="text-right flex-shrink-0">
                      {hasDiscount ? (
                        <div>
                          <span className="text-sm font-semibold">${price.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ${item.book.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold">${price.toFixed(2)}</span>
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
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-6 sticky top-34">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
              <p className="text-blue-800">
                <strong>Digital Delivery:</strong> Your ebooks will be available for reading immediately after purchase.
              </p>
            </div>

            <form action={checkout.bind(null, userId)}>
              <Button type="submit" className="w-full" size="lg">
                Complete Purchase
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-3">
              By completing your purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}