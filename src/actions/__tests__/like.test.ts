import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth and db before importing the module
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { toggleLike } from "../like";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const mockedAuth = vi.mocked(auth);
const mockedFindUnique = vi.mocked(db.like.findUnique);
const mockedCreate = vi.mocked(db.like.create);
const mockedDelete = vi.mocked(db.like.delete);
const mockedRevalidatePath = vi.mocked(revalidatePath);

describe("toggleLike", () => {
  const mockPostId = "post-123";
  const mockUserId = "user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates like when none exists and returns liked: true", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: mockUserId, email: "test@example.com" },
    } as any);
    mockedFindUnique.mockResolvedValue(null);
    mockedCreate.mockResolvedValue({} as any);

    const result = await toggleLike(mockPostId);

    expect(result.liked).toBe(true);
    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        postId: mockPostId,
        userId: mockUserId,
      },
    });
    expect(mockedDelete).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("deletes like when one exists and returns liked: false", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: mockUserId, email: "test@example.com" },
    } as any);
    mockedFindUnique.mockResolvedValue({ id: "like-1" } as any);
    mockedDelete.mockResolvedValue({} as any);

    const result = await toggleLike(mockPostId);

    expect(result.liked).toBe(false);
    expect(mockedDelete).toHaveBeenCalledWith({
      where: {
        postId_userId: {
          postId: mockPostId,
          userId: mockUserId,
        },
      },
    });
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("throws error when user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(toggleLike(mockPostId)).rejects.toThrow("Unauthorized");

    expect(mockedFindUnique).not.toHaveBeenCalled();
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("throws error when session has no user id", async () => {
    mockedAuth.mockResolvedValue({
      user: { email: "test@example.com" },
    } as any);

    await expect(toggleLike(mockPostId)).rejects.toThrow("Unauthorized");

    expect(mockedFindUnique).not.toHaveBeenCalled();
  });

  it("is idempotent — toggling twice returns to original state", async () => {
    // First toggle: create like
    mockedAuth.mockResolvedValue({
      user: { id: mockUserId, email: "test@example.com" },
    } as any);
    mockedFindUnique.mockResolvedValueOnce(null);
    mockedCreate.mockResolvedValue({} as any);

    const result1 = await toggleLike(mockPostId);
    expect(result1.liked).toBe(true);

    // Second toggle: delete like
    mockedFindUnique.mockResolvedValueOnce({ id: "like-1" } as any);
    mockedDelete.mockResolvedValue({} as any);

    const result2 = await toggleLike(mockPostId);
    expect(result2.liked).toBe(false);
  });
});
