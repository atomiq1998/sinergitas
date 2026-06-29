import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole } from "@/lib/auth";
import { reportSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const agency = searchParams.get("agency") || "";
  const status = searchParams.get("status") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};

  if (!hasRole(auth, ["ADMIN", "VIEWER"])) {
    where.userId = auth.userId;
  }

  if (keyword) {
    where.OR = [
      { activityName: { contains: keyword } },
      { description: { contains: keyword } },
      { location: { contains: keyword } },
    ];
  }
  if (agency) where.agency = { contains: agency };
  if (status) where.status = status;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate);
  }

  const reports = await prisma.report.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasRole(auth, ["VIEWER"])) {
    return NextResponse.json({ error: "Viewer tidak dapat membuat laporan" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { activityName, date, location, agency, description, attachments, status, clientId } =
      parsed.data;

    if (clientId) {
      const existing = await prisma.report.findUnique({ where: { clientId } });
      if (existing) {
        return NextResponse.json({ report: existing });
      }
    }

    const report = await prisma.report.create({
      data: {
        userId: auth.userId,
        activityName,
        date: new Date(date),
        location,
        agency,
        description,
        attachments: attachments || null,
        status: status || "SUBMITTED",
        clientId: clientId || null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (status === "SUBMITTED") {
      await prisma.notification.create({
        data: {
          userId: auth.userId,
          title: "Laporan Terkirim",
          message: `Laporan "${activityName}" berhasil dikirim.`,
          type: "STATUS_UPDATE",
        },
      });
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
