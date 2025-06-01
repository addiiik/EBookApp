import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface CartButtonProps {
  bookId: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  showText?: boolean;
}

async function isBookInCart(bookId: string, userId: string) {
  'use server'
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_bookId: {
        userId: userId,
        bookId: bookId
      }
    }
  });
  
  return !!cartItem;
}

async function toggleCart(formData: FormData) {
  'use server'
  const bookId = formData.get('bookId') as string;
  const redirectPath = formData.get('redirectPath') as string | null;
  
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/auth/signin?redirect=${redirectPath || `/book/${bookId}`}`);
  }

  const userId = session.user.id;

  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      userId_bookId: {
        userId: userId,
        bookId: bookId
      }
    }
  });

  if (existingCartItem) {
    await prisma.cartItem.delete({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId
        }
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: userId,
        bookId: bookId
      }
    });
  }

  revalidatePath(redirectPath || `/book/${bookId}`);
  revalidatePath('/cart');
}

export default async function CartButton({ 
  bookId, 
  size = "default", 
  className = "",
  variant = "default",
  showText = true
}: CartButtonProps) {
  const session = await auth();
  const isInCart = session?.user?.id 
    ? await isBookInCart(bookId, session.user.id)
    : false;

  return (
    <form action={toggleCart}>
      <input type="hidden" name="bookId" value={bookId} />
      <input type="hidden" name="redirectPath" value={`/book/${bookId}`} />
      <Button 
        type="submit"
        variant={isInCart ? "outline" : variant}
        size={size}
        className={className}
      >
        {isInCart ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {showText && "In Cart"}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {showText && "Add to Cart"}
          </>
        )}
      </Button>
    </form>
  );
}