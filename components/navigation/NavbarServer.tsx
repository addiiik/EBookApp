import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navigation/Navbar';

async function getWishlistCount(userId: string): Promise<number> {
  try {
    const count = await prisma.wishlistItem.count({
      where: {
        userId: userId,
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to fetch wishlist count:', error);
    return 0;
  }
}

async function getCartItemCount(userId: string): Promise<number> {
  try {
    const count = await prisma.cartItem.count({
      where: {
        userId: userId,
      },
    });
    return count;
  } catch (error) {
    console.error('Failed to fetch cart items count:', error);
    return 0;
  }
}

export async function NavbarServer() {
  const session = await auth();
  const wishlistCount = session?.user?.id ? await getWishlistCount(session.user.id) : 0;
  const cartItemsCount = session?.user?.id ? await getCartItemCount(session.user.id) : 0;

  return (
    <Navbar 
      session={session}
      wishlistCount={wishlistCount}
      cartItemsCount={cartItemsCount}
    />
  );
}