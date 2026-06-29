import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole } from "@/lib/auth";
import { reportUpdateSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!report) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
  if (!hasRole(auth, ["ADMIN", "VIEWER"]) && report.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ report });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.report.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  const isOwner = existing.userId === auth.userId;
  const isAdmin = hasRole(auth, ["ADMIN"]);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = reportUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) data.date = new Date(parsed.data.date);

    if (!isAdmin && parsed.data.status && parsed.data.status !== existing.status) {
      if (!["DRAFT", "SUBMITTED"].includes(parsed.data.status)) {
        return NextResponse.json({ error: "Tidak dapat mengubah status ini" }, { status: 403 });
      }
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await prisma.notification.create({
        data: {
          userId: existing.userId,
          title: "Status Laporan Diperbarui",
          message: `Laporan "${report.activityName}" status: ${report.status}`,
          type: "STATUS_UPDATE",
        },
      });
    }

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.report.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  if (!hasRole(auth, ["ADMIN"]) && existing.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.report.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
