import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
  file: { arrayBuffer: () => Promise<ArrayBuffer>; type: string; name?: string }
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  const buffer = await file.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    throw new Error("Image size must be less than 5MB");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ig-clone",
        upload_preset: "ig_clone_preset",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(Buffer.from(buffer));
  });
}
