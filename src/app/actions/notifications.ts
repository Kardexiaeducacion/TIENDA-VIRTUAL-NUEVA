"use server";
import { notifyUser, notifyAdmins } from "@/utils/notifications";

export async function sendNotification(userId: string, type: string, title: string, body: string, orderId?: string) {
  await notifyUser(userId, type, title, body, orderId);
}

export async function sendAdminNotification(type: string, title: string, body: string, orderId?: string) {
  await notifyAdmins(type, title, body, orderId);
}
