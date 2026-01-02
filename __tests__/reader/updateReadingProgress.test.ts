import { vi, describe, expect, it, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/app/actions/auth";
import { updateReadingProgress } from "@/app/actions/reader";

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

describe("updateReadingProgress", () => {
  const mockUser = { id: "user-123" };
  const mockBookId = "book-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if user is not logged in", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(null);

    const result = await updateReadingProgress(mockBookId, 10);

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

    const result = await updateReadingProgress(mockBookId, 10);

    expect(result).toEqual({
      success: false,
      message: "Could not update progress",
    });
  });

  it("uses safePage = 1 when page is less than 1", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.readingProgress.update).mockResolvedValueOnce({} as any);

    const result = await updateReadingProgress(mockBookId, 0);

    expect(prisma.readingProgress.update).toHaveBeenCalledWith({
      where: {
        userId_bookId: {
          userId: mockUser.id,
          bookId: mockBookId,
        },
      },
      data: {
        page: 1,
      },
    });
    expect(result).toEqual({
      success: true,
      message: "Progress updated",
    });
  });

  it("updates reading progress with provided page when page >= 1", async () => {
    vi.mocked(getUserFromToken).mockResolvedValueOnce(mockUser as any);
    vi.mocked(prisma.readingProgress.update).mockResolvedValueOnce({} as any);

    const result = await updateReadingProgress(mockBookId, 42);

    expect(prisma.readingProgress.update).toHaveBeenCalledWith({
      where: {
        userId_bookId: {
          userId: mockUser.id,
          bookId: mockBookId,
        },
      },
      data: {
        page: 42,
      },
    });
    expect(result).toEqual({
      success: true,
      message: "Progress updated",
    });
  });
});