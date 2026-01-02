import { vi, describe, expect, it, beforeEach } from "vitest";
import { processCheckout } from "@/app/actions/checkout";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserFromToken } from "@/app/actions/auth";
import { getUserPurchasedBooks } from "@/app/actions/user";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    purchasedBook: {
      createMany: vi.fn(),
    },
    checkoutSession: {
      create: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    wishlistItem: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/app/actions/auth", () => ({
  getUserFromToken: vi.fn(),
}));

vi.mock("@/app/actions/user", () => ({
  getUserPurchasedBooks: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("processCheckout", () => {
  const mockUser = { id: "user-123" };
  const bookIds = ["book-1", "book-2"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await processCheckout(bookIds);

    expect(getUserFromToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "You need to be logged in",
    });
    expect(prisma.purchasedBook.createMany).not.toHaveBeenCalled();
  });

  it("fails if user already owns one or more of the requested books", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(getUserPurchasedBooks).mockResolvedValueOnce([
      { book: { id: "book-2" } },
    ] as any);

    const result = await processCheckout(bookIds);

    expect(getUserPurchasedBooks).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual({
      success: false,
      message: "You have already purchased one or more of these books",
    });
    expect(prisma.purchasedBook.createMany).not.toHaveBeenCalled();
  });

  it("returns failure if any db operation throws", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(getUserPurchasedBooks).mockResolvedValueOnce([] as any);

    (prisma.purchasedBook.createMany as any).mockRejectedValueOnce(
      new Error("db error"),
    );

    const result = await processCheckout(bookIds);

    expect(result).toEqual({
      success: false,
      message: "Unable to complete checkout",
    });
  });

  it("creates purchasedBooks, checkoutSession, deletes cart & wishlist items, and revalidates path", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(getUserPurchasedBooks).mockResolvedValueOnce([] as any);

    (prisma.purchasedBook.createMany as any).mockResolvedValueOnce({});
    (prisma.checkoutSession.create as any).mockResolvedValueOnce({});
    (prisma.cartItem.deleteMany as any).mockResolvedValueOnce({});
    (prisma.wishlistItem.deleteMany as any).mockResolvedValueOnce({});

    const result = await processCheckout(bookIds);

    expect(prisma.purchasedBook.createMany).toHaveBeenCalledWith({
      data: bookIds.map((id) => ({
        userId: mockUser.id,
        bookId: id,
      })),
      skipDuplicates: true,
    });

    expect(prisma.checkoutSession.create).toHaveBeenCalled();
    expect(prisma.checkoutSession.create).toHaveBeenCalledWith({
      data: {
        userId: mockUser.id,
        validUntil: expect.any(Date),
      },
    });

    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: mockUser.id,
        bookId: { in: bookIds },
      },
    });

    expect(prisma.wishlistItem.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: mockUser.id,
        bookId: { in: bookIds },
      },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");

    expect(result).toEqual({ success: true });
  });
});