'use server';

import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "./auth";
import { getUserPurchasedBooks } from "./user";
import { revalidatePath } from "next/cache";

export async function processCheckout(bookIds: string[]){
  const payload = await getUserFromToken();
  if (!payload) {
    return {success: false, message: 'You need to be logged in'}
  }

  const userId = payload.id

  const purchasedBooks = await getUserPurchasedBooks(userId);

  const purchasedIds = purchasedBooks.map(pb => pb.book.id);
  const alreadyOwned = bookIds.filter(id => purchasedIds.includes(id));

  if (alreadyOwned.length > 0) {
    return { success: false, message: "You have already purchased one or more of these books"};
  }

  try {
    await prisma.purchasedBook.createMany({
      data: bookIds.map((id) => ({
        userId,
        bookId: id
      })),
      skipDuplicates: true,
    });

    await prisma.checkoutSession.create({
      data: {
        userId,
        validUntil: new Date(Date.now() + 1000 * 30)
      }
    });

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        bookId: { in: bookIds }
      }
    });

    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        bookId: { in: bookIds }
      }
    });

    revalidatePath('/', 'layout');

    return { success: true }
  } catch {
    return { success: false, message: "Unable to complete checkout" };
  }
}

export async function validateCheckoutSession(userId: string) {
  return await prisma.checkoutSession.findFirst({
    where: {
      userId,
      validUntil: { gte: new Date() }
    }
  });
}