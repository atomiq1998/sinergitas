import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";
  const agency = searchParams.get("agency") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};
  if (auth.role === "USER") where.userId = auth.userId;
  if (agency) where.agency = { contains: agency };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate);
    if (endDate) (where.date as Record<string, Date>).lte = new Date(endDate);
  }

  const reports = await prisma.report.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { date: "desc" },
  });

  const byStatus: Record<string, number> = {};
  const agencyMap: Record<string, number> = {};
  const periodMap: Record<string, number> = {};

  for (const r of reports) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    agencyMap[r.agency] = (agencyMap[r.agency] || 0) + 1;

    const d = new Date(r.date);
    let key: string;
    if (period === "day") {
      key = format(d, "dd MMM yyyy", { locale: localeId });
    } else if (period === "week") {
      key = format(startOfWeek(d, { weekStartsOn: 1 }), "'Minggu' w MMM yyyy", { locale: localeId });
    } else {
      key = format(startOfMonth(d), "MMMM yyyy", { locale: localeId });
    }
    periodMap[key] = (periodMap[key] || 0) + 1;
  }

  const byAgency = Object.entries(agencyMap)
    .map(([agencyName, count]) => ({ agency: agencyName, count }))
    .sort((a, b) => b.count - a.count);

  const byPeriod = Object.entries(periodMap)
    .map(([periodLabel, count]) => ({ period: periodLabel, count }))
    .reverse();

  return NextResponse.json({
    total: reports.length,
    byStatus,
    byAgency,
    byPeriod,
    reports,
  });
}
