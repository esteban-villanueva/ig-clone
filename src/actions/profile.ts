"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update your profile" };
  }

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const image = formData.get("image") as File | null;

  if (!name || name.trim().length === 0) {
    return { error: "Name is required" };
  }

  try {
    let imageUrl: string | undefined;

    if (image && image.size > 0) {
      imageUrl = await uploadImage(image);
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        bio: bio?.trim() || null,
        ...(imageUrl && { image: imageUrl }),
      },
    });

    revalidatePath(`/profile/${session.user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}
