import { vi, describe, expect, it, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/app/actions/auth";
import { resetReadingProgress } from "@/app/actions/reader";

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

describe("resetReadingProgress", () => {
  const mockBookId = "book-456";
  const mockUser = { id: "user-123" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await resetReadingProgress(mockBookId);

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

    const result = await resetReadingProgress(mockBookId);

    expect(result).toEqual({
      success: false,
      message: "Could not reset progress",
    });
  });

  it("resets reading progress", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.readingProgress.update).mockResolvedValueOnce({} as any);

    const result = await resetReadingProgress(mockBookId);

    expect(prisma.readingProgress.update).toHaveBeenCalledWith({
      where: {
        userId_bookId: {
          userId: mockUser.id,
          bookId: mockBookId,
        },
      },
      data: {
        page: 1,
        finished: false,
      },
    });
    expect(result).toEqual({
      success: true,
      message: "Progress reset",
    });
  });
});