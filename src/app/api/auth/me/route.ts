import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
