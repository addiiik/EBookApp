'use server';

import { prisma } from "@/lib/prisma";
import { Book } from "@/types/book";
import { getUserFromToken } from "./auth";

export async function getFeaturedBooks(): Promise<Book[]> {
  const today = new Date().toISOString().split("T")[0];

  return prisma.$queryRaw`
    SELECT * FROM "Book"
    ORDER BY md5(concat(${today}, "id"))
    LIMIT 4
  `;
}

export async function getBooksByCategory(category: string): Promise<Book[]> {
  return prisma.book.findMany({
    where: {
      category: category
    },
    orderBy: {
      title: 'asc'
    }
  });
}

export async function getBook(id: string) {
  return prisma.book.findUnique({
    where: {
      id: id
    }
  });
}

export async function getBookReader(id: string) {
  return prisma.book.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      title: true,
      author: true,
      pages: true,
    }
  });
}

export async function getSimilarBooks(category: string, currentBookId: string) {
  return prisma.book.findMany({
    where: {
      category: category,
      id: {
        not: currentBookId
      }
    },
    take: 4,
    orderBy: {
      rating: 'desc'
    }
  });
}

export async function getSearchResults(query: string): Promise<Book[]> {
  if (!query || query.trim() === '') return [];

  return prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [
      { rating: 'desc' },
      { title: 'asc' }
    ]
  });
}

export async function toggleWishlistState(bookId: string) {
  const payload = await getUserFromToken();
  if (!payload) {
    return {success: false, message: 'You need to be logged in', wishlisted: false}
  }

  const userId = payload.id

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId, bookId },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: {id: existing.id}
    })

    return { success: true, message: 'Removed from wishlist', wishlisted: false };
  }

  await prisma.wishlistItem.create({
    data: { userId, bookId },
  });

  return { success: true, message: 'Added to wishlist', wishlisted: true };
}

export async function toggleBookCartState(bookId: string) {
  const payload = await getUserFromToken();
  if (!payload) {
    return {success: false, message: 'You need to be logged in', inCart: false}
  }

  const userId = payload.id

  const existing = await prisma.cartItem.findFirst({
    where: { userId, bookId },
  });

  if (existing) {
    await prisma.cartItem.delete({
      where: { id: existing.id },
    });

    return { success: true, message: 'Removed from cart', inCart: false };
  }

  await prisma.cartItem.create({
    data: { userId, bookId },
  });

  return { success: true, message: 'Added to cart', inCart: true };
}

export async function getBookWishlistState(userId: string, bookId: string) {
  return !!(await prisma.wishlistItem.findUnique({
    where: { userId_bookId: { userId, bookId } }
  }));
}

export async function getBookCartState(userId: string, bookId: string) {
  return !!(await prisma.cartItem.findUnique({
    where: { userId_bookId: { userId, bookId } }
  }));
}

export async function checkBookPurchased(userId: string, bookId: string) {
  return !!(await prisma.purchasedBook.findUnique({
    where: { userId_bookId: { userId, bookId } }
  }));
}

export async function checkManyBooksPurchased(userId: string, bookIds: string[]) {
  const purchasedBooks = await prisma.purchasedBook.findMany({
    where: {
      userId,
      bookId: { in: bookIds },
    },
    select: { bookId: true },
  });

  return new Set(purchasedBooks.map((b) => b.bookId));
}