"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const notifications = await db.notification.findMany({
      where: {
        recipientId: session.user.id,
      },
      include: {
        issuer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limitar para performance
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Error fetching notifications" };
  }
}

export async function markNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    await db.notification.updateMany({
      where: {
        recipientId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating notifications:", error);
    return { success: false, error: "Error updating notifications" };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const notif = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.recipientId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Error deleting notification" };
  }
}
