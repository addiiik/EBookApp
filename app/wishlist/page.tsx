import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BookComponent from '@/components/BookComponent';
import { Badge } from '@/components/ui/badge';
import { getUserPurchasedBookIds } from '@/lib/book/BookUtils';

interface WishlistItemWithBook {
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

async function getWishlistItems(userId: string): Promise<WishlistItemWithBook[]> {
  'use server'
  return await prisma.wishlistItem.findMany({
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

export default async function WishlistPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=/wishlist`);
  }

  const [wishlistItems, purchasedBookIds] = await Promise.all([
    getWishlistItems(session.user.id),
    getUserPurchasedBookIds(session.user.id)
  ]);

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
            <a href="/">Browse Books</a>
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
            isPurchased={purchasedBookIds.has(item.book.id)}
          />
        ))}
      </div>
    </div>
  );
}