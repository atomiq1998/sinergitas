import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole } from "@/lib/auth";

interface SyncReport {
  localId: string;
  activityName: string;
  date: string;
  location: string;
  agency: string;
  description: string;
  attachments?: string;
  status: string;
}

export async function POST(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasRole(auth, ["VIEWER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { reports } = (await request.json()) as { reports: SyncReport[] };
    const synced: { localId: string; serverId: string }[] = [];

    for (const item of reports) {
      const existing = await prisma.report.findUnique({
        where: { clientId: item.localId },
      });

      if (existing) {
        synced.push({ localId: item.localId, serverId: existing.id });
        continue;
      }

      const report = await prisma.report.create({
        data: {
          userId: auth.userId,
          activityName: item.activityName,
          date: new Date(item.date),
          location: item.location,
          agency: item.agency,
          description: item.description,
          attachments: item.attachments || null,
          status: item.status || "SUBMITTED",
          clientId: item.localId,
        },
      });

      synced.push({ localId: item.localId, serverId: report.id });
    }

    return NextResponse.json({ synced, count: synced.length });
  } catch {
    return NextResponse.json({ error: "Sync gagal" }, { status: 500 });
  }
}
