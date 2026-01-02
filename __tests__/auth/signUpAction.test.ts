import { vi, describe, it, expect, beforeEach } from "vitest";
import * as authActions from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique:  vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
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

vi. mock("jose", () => {
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
    jwtVerify:  vi.fn(),
  };
});

describe("signUpAction", () => {
  const validFormData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if validation fails", async () => {
    const invalidFormData = { ...validFormData, email: "not-an-email" };

    const result = await authActions.signUpAction(invalidFormData as any);

    expect(result.success).toBe(false);
    expect(typeof result.message).toBe("string");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("fails if passwords do not match", async () => {
    const wrongFormData = {
      ...validFormData,
      confirmPassword: "different",
    };

    const result = await authActions.signUpAction(wrongFormData as any);

    expect(result).toEqual({
      success: false,
      message: "Passwords do not match",
    });
  });

  it("fails if email already exists", async () => {
    (prisma.user.findUnique as any).mockResolvedValueOnce({ id: "user-1" });

    const result = await authActions.signUpAction(validFormData as any);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: validFormData.email },
    });
    expect(result).toEqual({
      success: false,
      message: "Email is already used",
    });
  });

  it("creates user, hashes password, and calls storeUserToken", async () => {
    (prisma.user. findUnique as any).mockResolvedValueOnce(null);
    (bcrypt.hash as any).mockResolvedValueOnce("hashed-password");
    (prisma.user.create as any).mockResolvedValueOnce({ id: "user-1" });

    const result = await authActions.signUpAction(validFormData as any);

    expect(bcrypt.hash).toHaveBeenCalledWith(validFormData.password, 10);
    expect(prisma. user.create).toHaveBeenCalledWith({
      data: {
        name: validFormData.name,
        email: validFormData.email,
        password: "hashed-password",
      },
    });

    expect(mockCookieStore. set).toHaveBeenCalledWith(
      "auth_token",
      "mock-jwt-token",
      expect.any(Object),
    );

    expect(result).toEqual({
      success: true,
      message: "Account created successfully!",
    });
  });
});