import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import BookComponent from '@/components/BookComponent';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';
import { getUserPurchasedBookIds } from '@/lib/book/BookUtils';

interface CartItemWithBook {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    price: number;
    discountedPrice: number | null;
    rating: number;
  };
}

async function getCartItems(userId: string): Promise<CartItemWithBook[]> {
  'use server'
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      book: true,
    },
    orderBy: {
      book: {
        title: 'asc',
      },
    },
  });
}

export default async function CartPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=/wishlist`);
  }

  const [cartItems, purchasedBookIds] = await Promise.all([
   getCartItems(session.user.id),
   getUserPurchasedBookIds(session.user.id)
  ]);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Add some books to your cart to get started!
          </p>
          <Button asChild>
            <a href="/">Browse Books</a>
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.book.discountedPrice || item.book.price;
    return total + price;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <Badge variant={'outline'}>
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cartItems.map((item) => (
              <BookComponent 
                key={item.id} 
                book={item.book} 
                showWishlistButton={false}
                isPurchased={purchasedBookIds.has(item.book.id)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-6 sticky top-34">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>$0</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <Button asChild className="w-full hover:cursor-default" size="lg">
              <a href="/checkout">Proceed to Checkout</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}