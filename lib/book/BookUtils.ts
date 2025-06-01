import { prisma } from '@/lib/prisma';

export async function checkIfBookPurchased(userId: string | null, bookId: string): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const purchasedBook = await prisma.purchasedBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
    
    return !!purchasedBook;
  } catch (error) {
    console.error('Error checking book purchase status:', error);
    return false;
  }
}

export async function getUserPurchasedBookIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  
  try {
    const purchasedBooks = await prisma.purchasedBook.findMany({
      where: { userId },
      select: { bookId: true }
    });
    
    return new Set(purchasedBooks.map(book => book.bookId));
  } catch (error) {
    console.error('Error fetching user purchased books:', error);
    return new Set();
  }
}

export async function checkMultipleBooksPurchased(userId: string | null, bookIds: string[]): Promise<Set<string>> {
  if (!userId || bookIds.length === 0) return new Set();
  
  try {
    const purchasedBooks = await prisma.purchasedBook.findMany({
      where: {
        userId,
        bookId: { in: bookIds }
      },
      select: { bookId: true }
    });
    
    return new Set(purchasedBooks.map(book => book.bookId));
  } catch (error) {
    console.error('Error checking multiple books purchase status:', error);
    return new Set();
  }
}