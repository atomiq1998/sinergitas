import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: auth.userId, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await request.json();

  if (action === "markAllRead") {
    await prisma.notification.updateMany({
      where: { userId: auth.userId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "reminder") {
    await prisma.notification.create({
      data: {
        userId: auth.userId,
        title: "Reminder Input Laporan",
        message: "Jangan lupa mengisi laporan kegiatan sinergitas hari ini.",
        type: "REMINDER",
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
}

export async function PATCH(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await prisma.notification.updateMany({
    where: { id, userId: auth.userId },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
