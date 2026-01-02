import { vi, describe, it, expect, beforeEach } from "vitest";
import { signOutAction } from "@/app/actions/auth";

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

describe("signOutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes auth_token cookie and returns success", async () => {
    const result = await signOutAction();

    expect(mockCookieStore.delete).toHaveBeenCalledWith("auth_token");
    expect(result).toEqual({
      success: true,
      message: "Signed out successfully",
    });
  });
});