import { getUserWishlistItems } from "@/app/actions/user";
import { Badge } from "@/components/ui/badge";
import BookComponent from "@/components/ui/book";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserFromToken } from "@/app/actions/auth";

export default async function WishlistPage() {
  const payload = await getUserFromToken();
  if (!payload) {
    redirect("/auth/signin");
  }
  const wishlistItems = await getUserWishlistItems(payload.id);

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4 fill-current" />
          <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Save books you're interested in to your wishlist!
          </p>
          <Button asChild>
            <Link href="/">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <Badge variant={'outline'}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'book' : 'books'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <BookComponent 
            key={item.id} 
            book={item.book} 
            showWishlistButton={true}
          />
        ))}
      </div>
    </div>
  );
}