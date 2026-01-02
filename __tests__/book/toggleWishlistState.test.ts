import { vi, describe, expect, it, beforeEach } from "vitest";
import { toggleWishlistState } from "@/app/actions/book";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/app/actions/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    wishlistItem: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/app/actions/auth", () => ({
  getUserFromToken: vi.fn(),
}));

describe("toggleWishlistState", () => {
  const mockUser = { id: "user-123" };
  const bookId = "book-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await toggleWishlistState(bookId);

    expect(getUserFromToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "You need to be logged in",
      wishlisted: false,
    });
    expect(prisma.wishlistItem.findFirst).not.toHaveBeenCalled();
  });

  it("removes item from wishlist if it already exists", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    (prisma.wishlistItem.findFirst as any).mockResolvedValueOnce({
      id: "wishlist-1",
    });

    (prisma.wishlistItem.delete as any).mockResolvedValueOnce({});

    const result = await toggleWishlistState(bookId);

    expect(prisma.wishlistItem.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUser.id, bookId },
    });

    expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
      where: { id: "wishlist-1" },
    });

    expect(result).toEqual({
      success: true,
      message: "Removed from wishlist",
      wishlisted: false,
    });
  });

  it("adds item to wishlist if it does not exist", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    (prisma.wishlistItem.findFirst as any).mockResolvedValueOnce(null);
    (prisma.wishlistItem.create as any).mockResolvedValueOnce({});

    const result = await toggleWishlistState(bookId);

    expect(prisma.wishlistItem.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUser.id, bookId },
    });

    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: { userId: mockUser.id, bookId },
    });

    expect(result).toEqual({
      success: true,
      message: "Added to wishlist",
      wishlisted: true,
    });
  });
});