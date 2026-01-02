import { vi, describe, expect, it, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/app/actions/auth";
import { finishBook } from "@/app/actions/reader";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    readingProgress: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/app/actions/auth", () => ({
  getUserFromToken: vi.fn(),
}));

describe("finishBook", () => {
  const mockBookId = "book-456";
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await finishBook(mockBookId);

    expect(getUserFromToken).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      message: "You need to be logged in",
    });
    expect(prisma.readingProgress.update).not.toHaveBeenCalled();
  });

  it("returns failure if prisma.update throws", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.readingProgress.update).mockRejectedValueOnce(
      new Error("db error"),
    );

    const result = await finishBook(mockBookId);

    expect(result).toEqual({
      success: false,
      message: "Could not mark book as finished",
    });
  });

  it("finishes book", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.readingProgress.update).mockResolvedValueOnce({} as any);

    const result = await finishBook(mockBookId);

    expect(prisma.readingProgress.update).toHaveBeenCalledWith({
      where: {
        userId_bookId: {
          userId: mockUser.id,
          bookId: mockBookId,
        },
      },
      data: {
        finished: true,
      },
    });
    expect(result).toEqual({
      success: true,
      message: "Book finished",
    });
  });
});