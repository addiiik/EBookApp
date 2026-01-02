import { vi, describe, expect, it, beforeEach } from "vitest";
import { toggleBookCartState } from "@/app/actions/book";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/app/actions/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cartItem: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/app/actions/auth", () => ({
  getUserFromToken: vi.fn(),
}));

describe("toggleBookCartState", () => {
  const mockUser = { id: "user-123" };
  const bookId = "book-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await toggleBookCartState(bookId);

    expect(getUserFromToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "You need to be logged in",
      inCart: false,
    });
    expect(prisma.cartItem.findFirst).not.toHaveBeenCalled();
  });

  it("removes item from cart if it already exists", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    (prisma.cartItem.findFirst as any).mockResolvedValueOnce({
      id: "cart-1",
    });
    (prisma.cartItem.delete as any).mockResolvedValueOnce({});

    const result = await toggleBookCartState(bookId);

    expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUser.id, bookId },
    });

    expect(prisma.cartItem.delete).toHaveBeenCalledWith({
      where: { id: "cart-1" },
    });

    expect(result).toEqual({
      success: true,
      message: "Removed from cart",
      inCart: false,
    });
  });

  it("adds item to cart if it does not exist", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    (prisma.cartItem.findFirst as any).mockResolvedValueOnce(null);
    (prisma.cartItem.create as any).mockResolvedValueOnce({});

    const result = await toggleBookCartState(bookId);

    expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
      where: { userId: mockUser.id, bookId },
    });

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: { userId: mockUser.id, bookId },
    });

    expect(result).toEqual({
      success: true,
      message: "Added to cart",
      inCart: true,
    });
  });
});