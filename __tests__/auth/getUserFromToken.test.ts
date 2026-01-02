import { vi, describe, it, expect, beforeEach } from "vitest";
import { getUserFromToken } from "@/app/actions/auth";
import { jwtVerify } from "jose";

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

vi.mock("jose", async () => {
  const actual: any = await vi.importActual("jose");
  return {
    ...actual,
    jwtVerify: vi.fn(),
  };
});

describe("getUserFromToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null if there is no auth_token cookie", async () => {
    mockCookieStore.get.mockReturnValueOnce(undefined);

    const result = await getUserFromToken();

    expect(result).toBeNull();
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("returns null if jwtVerify throws", async () => {
    mockCookieStore.get.mockReturnValueOnce({ value: "invalid-token" });
    (jwtVerify as any).mockRejectedValueOnce(new Error("invalid token"));

    const result = await getUserFromToken();

    expect(jwtVerify).toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns payload if jwtVerify succeeds", async () => {
    const fakeToken = "valid-token";
    const payload = { id: "user-1", email: "test@example.com" };
    mockCookieStore.get.mockReturnValueOnce({ value: fakeToken });

    (jwtVerify as any).mockResolvedValueOnce({ payload });

    const result = await getUserFromToken();

    expect(jwtVerify).toHaveBeenCalledTimes(1);
    expect(jwtVerify).toHaveBeenCalledWith(fakeToken, expect.anything());
    expect(result).toEqual(payload);
  });
});