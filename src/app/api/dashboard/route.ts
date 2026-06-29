import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const totalReports = await prisma.report.count(
    auth.role === "USER" ? { where: { userId: auth.userId } } : undefined
  );

  const statusGroups = await prisma.report.groupBy({
    by: ["status"],
    _count: { status: true },
    where: auth.role === "USER" ? { userId: auth.userId } : undefined,
  });

  const recentReports = await prisma.report.findMany({
    where: auth.role === "USER" ? { userId: auth.userId } : undefined,
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendReports = await prisma.report.findMany({
    where: {
      date: { gte: thirtyDaysAgo },
      ...(auth.role === "USER" ? { userId: auth.userId } : {}),
    },
    select: { date: true },
  });

  const trendMap: Record<string, number> = {};
  for (const r of trendReports) {
    const key = r.date.toISOString().split("T")[0];
    trendMap[key] = (trendMap[key] || 0) + 1;
  }

  const trend = Object.entries(trendMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const agencies = await prisma.report.groupBy({
    by: ["agency"],
    _count: { agency: true },
    where: auth.role === "USER" ? { userId: auth.userId } : undefined,
    orderBy: { _count: { agency: "desc" } },
    take: 5,
  });

  return NextResponse.json({
    totalReports,
    statusGroups: statusGroups.map((s) => ({ status: s.status, count: s._count.status })),
    recentReports,
    trend,
    topAgencies: agencies.map((a) => ({ agency: a.agency, count: a._count.agency })),
  });
}
