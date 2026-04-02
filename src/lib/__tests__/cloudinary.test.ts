import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to define mock variables before vi.mock is hoisted
const { mockUploadStream, mockUploadStreamEnd } = vi.hoisted(() => ({
  mockUploadStreamEnd: vi.fn(),
  mockUploadStream: vi.fn(),
}));

// Mock cloudinary before importing the module
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: mockUploadStream,
    },
  },
}));

import { uploadImage } from "../cloudinary";
import { v2 as cloudinary } from "cloudinary";

describe("uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUploadStream.mockReturnValue({
      end: mockUploadStreamEnd,
    });
  });

  it("rejects files larger than 5MB", async () => {
    const largeFile = {
      arrayBuffer: async () => new ArrayBuffer(6 * 1024 * 1024), // 6MB
      type: "image/jpeg",
      name: "large.jpg",
    };

    await expect(uploadImage(largeFile)).rejects.toThrow(
      "Image size must be less than 5MB"
    );

    // Should not attempt upload
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  it("rejects non-image file types", async () => {
    const nonImageFile = {
      arrayBuffer: async () => new ArrayBuffer(100),
      type: "application/pdf",
      name: "document.pdf",
    };

    await expect(uploadImage(nonImageFile)).rejects.toThrow(
      "Only image files are allowed"
    );

    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  it("rejects files with non-image MIME types", async () => {
    const textFile = {
      arrayBuffer: async () => new ArrayBuffer(100),
      type: "text/plain",
      name: "readme.txt",
    };

    await expect(uploadImage(textFile)).rejects.toThrow(
      "Only image files are allowed"
    );
  });

  it("accepts valid image files and returns URL", async () => {
    const mockUrl = "https://res.cloudinary.com/test/image.jpg";

    // Simulate successful upload via callback
    mockUploadStream.mockImplementationOnce((_options, callback) => {
      // Simulate async callback
      setTimeout(() => callback(null, { secure_url: mockUrl }), 0);
      return { end: mockUploadStreamEnd };
    });

    const validFile = {
      arrayBuffer: async () => new ArrayBuffer(100),
      type: "image/png",
      name: "photo.png",
    };

    const result = await uploadImage(validFile);

    expect(result).toBe(mockUrl);
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "ig-clone",
        upload_preset: "ig_clone_preset",
      }),
      expect.any(Function)
    );
  });

  it("rejects when cloudinary upload fails", async () => {
    const mockError = new Error("Upload failed");

    mockUploadStream.mockImplementationOnce((_options, callback) => {
      setTimeout(() => callback(mockError, null), 0);
      return { end: mockUploadStreamEnd };
    });

    const validFile = {
      arrayBuffer: async () => new ArrayBuffer(100),
      type: "image/jpeg",
      name: "photo.jpg",
    };

    await expect(uploadImage(validFile)).rejects.toThrow("Upload failed");
  });

  it("accepts various image MIME types", async () => {
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    for (const type of imageTypes) {
      mockUploadStream.mockImplementationOnce((_options, callback) => {
        setTimeout(() => callback(null, { secure_url: "https://example.com/img" }), 0);
        return { end: mockUploadStreamEnd };
      });

      const file = {
        arrayBuffer: async () => new ArrayBuffer(100),
        type,
        name: `test.${type.split("/")[1]}`,
      };

      await expect(uploadImage(file)).resolves.toBe("https://example.com/img");
    }
  });
});
