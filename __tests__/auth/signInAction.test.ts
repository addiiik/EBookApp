import { vi, describe, it, expect, beforeEach } from "vitest";
import * as authActions from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi. fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare:  vi.fn(),
    hash: vi.fn(),
  },
}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

vi.mock("jose", () => {
  const mockSignJWT = class {
    setProtectedHeader() {
      return this;
    }
    setExpirationTime() {
      return this;
    }
    sign() {
      return Promise.resolve("mock-jwt-token");
    }
  };

  return {
    SignJWT: mockSignJWT,
    jwtVerify: vi.fn(),
  };
});

describe("signInAction", () => {
  const validFormData = {
    email: "test@example.com",
    password: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if validation fails", async () => {
    const invalidFormData = { ...validFormData, password: "" };

    const result = await authActions.signInAction(invalidFormData as any);

    expect(result.success).toBe(false);
    expect(typeof result. message).toBe("string");
    expect(prisma.user. findUnique).not.toHaveBeenCalled();
  });

  it("fails if user not found", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce(null);

    const result = await authActions. signInAction(validFormData as any);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: validFormData.email },
    });
    expect(result).toEqual({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("fails if password invalid", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce({
      id: "user-1",
      password: "hashed",
    });
    (bcrypt.compare as any).mockResolvedValueOnce(false);

    const result = await authActions.signInAction(validFormData as any);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      validFormData.password,
      "hashed",
    );
    expect(result).toEqual({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("succeeds and calls storeUserToken", async () => {
    (prisma.user. findUnique as any).mockResolvedValueOnce({
      id: "user-1",
      password: "hashed",
    });
    (bcrypt.compare as any).mockResolvedValueOnce(true);

    const result = await authActions.signInAction(validFormData as any);

    expect(result).toEqual({
      success: true,
      message: "Signed in successfully",
    });

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token",
      expect.any(Object),
    );
  });
});