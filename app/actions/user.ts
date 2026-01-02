'use server';

import { prisma } from "@/lib/prisma";
import { CartItemWithBook, WishlistItemWithBook } from "@/types/book";

export async function getUserAllPurchasedBooks(userId: string) {
  return prisma.purchasedBook.findMany({
    where: { userId },
    include: {
      book: true
    },
    orderBy: {purchasedAt: 'desc'},
  });
}

export async function getUserPurchasedBooks(userId: string) {
  return await prisma.purchasedBook.findMany({
    where: { userId },
    include: {
      book: { select: { id: true } }
    },
  });
}

export async function getUserInfo(userId: string) {
  return prisma.user.findUnique({
    where: {id: userId},
    select: {
      name: true,
      email: true
    }
  })
}

export async function getUserCartItems(userId: string): Promise<CartItemWithBook[]> {
  const purchasedBooks = await getUserPurchasedBooks(userId);
  const purchasedIds = purchasedBooks.map(pb => pb.book.id);

  if (purchasedIds.length > 0) {
    await prisma.cartItem.deleteMany({
      where: {
        userId,
        bookId: { in: purchasedIds }
      }
    });
  }

  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      book: true
    },
    orderBy: {
      book: {
        title: "asc"
      }
    }
  });
}

export async function getUserWishlistItems(userId: string): Promise<WishlistItemWithBook[]> {
  const purchasedBooks = await getUserPurchasedBooks(userId);
  const purchasedIds = purchasedBooks.map(pb => pb.book.id);

  if (purchasedIds.length > 0) {
    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        bookId: { in: purchasedIds }
      }
    });
  }
  
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      book: true
    },
    orderBy: {
      book: {
        title: 'asc',
      }
    }
  })
}

export async function getUserWishlistCount(userId: string){
  return prisma.wishlistItem.count({
    where: {
      userId: userId,
    },
  });
}

export async function getUserCartItemCount(userId: string) {
  return prisma.cartItem.count({
    where: {
      userId: userId,
    },
  });
}