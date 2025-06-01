import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface WishlistButtonProps {
  bookId: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

async function isBookWishlisted(bookId: string, userId: string) {
  'use server'
  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_bookId: {
        userId: userId,
        bookId: bookId
      }
    }
  });
  
  return !!wishlistItem;
}

async function toggleWishlist(formData: FormData) {
  'use server'
  const bookId = formData.get('bookId') as string;
  const redirectPath = formData.get('redirectPath') as string | null;
  
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=${redirectPath || `/book/${bookId}`}`);
  }

  const userId = session.user.id;

  const existingWishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_bookId: {
        userId: userId,
        bookId: bookId
      }
    }
  });

  if (existingWishlistItem) {
    await prisma.wishlistItem.delete({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId
        }
      }
    });
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId: userId,
        bookId: bookId
      }
    });
  }

  revalidatePath(redirectPath || `/book/${bookId}`);
}

export default async function WishlistButton({ 
  bookId, 
  size = "default", 
  className = "",
}: WishlistButtonProps) {
  const session = await auth();
  const isWishlisted = session?.user?.id 
    ? await isBookWishlisted(bookId, session.user.id)
    : false;

  return (
    <form action={toggleWishlist}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="redirectPath" value={`/book/${bookId}`} />
      <Button 
        type="submit"
        variant={"outline"} 
        size={size}
        className={className}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </Button>
    </form>
  );
}