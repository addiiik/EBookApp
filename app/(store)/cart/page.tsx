import { getUserCartItems } from "@/app/actions/user";
import { Badge } from "@/components/ui/badge";
import BookComponent from "@/components/ui/book";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPricePLN } from "@/lib/utils";
import { getUserFromToken } from "@/app/actions/auth";

export default async function CartPage() {
  const payload = await getUserFromToken();
  if (!payload) {
    redirect("/auth/signin");
  }
  const cartItems = await getUserCartItems(payload.id);

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
            <Link href="/">Browse Books</Link>
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
                <span>{formatPricePLN(totalPrice)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPricePLN(totalPrice)}</span>
              </div>
            </div>

            <Button asChild className="w-full hover:cursor-default" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}