"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { FileText, CheckCircle, Clock, Building2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import type { Report } from "@/types";

interface DashboardData {
  totalReports: number;
  statusGroups: { status: string; count: number }[];
  recentReports: Report[];
  trend: { date: string; count: number }[];
  topAgencies: { agency: string; count: number }[];
}

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Terkirim",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    authFetch(token, "/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [token]);

  const trendData =
    data?.trend.map((t) => ({
      ...t,
      label: format(new Date(t.date), "dd MMM", { locale: localeId }),
    })) ?? [];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Monitoring kegiatan sinergitas</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FileText className="text-blue-600" />}
              label="Total Laporan"
              value={data?.totalReports ?? 0}
              color="border-blue-200 bg-blue-50"
            />
            <StatCard
              icon={<CheckCircle className="text-green-600" />}
              label="Disetujui"
              value={data?.statusGroups.find((s) => s.status === "APPROVED")?.count ?? 0}
              color="border-green-200 bg-green-50"
            />
            <StatCard
              icon={<Clock className="text-amber-600" />}
              label="Menunggu"
              value={data?.statusGroups.find((s) => s.status === "SUBMITTED")?.count ?? 0}
              color="border-amber-200 bg-amber-50"
            />
            <StatCard
              icon={<Building2 className="text-purple-600" />}
              label="Instansi Aktif"
              value={data?.topAgencies.length ?? 0}
              color="border-purple-200 bg-purple-50"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">Tren Aktivitas (30 Hari)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-800">Top Instansi</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.topAgencies ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agency" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold text-gray-800">Laporan Terbaru</h2>
              <Link href="/reports" className="text-sm text-blue-600 hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="divide-y">
              {(data?.recentReports ?? []).length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-500">Belum ada laporan</p>
              ) : (
                data?.recentReports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{r.activityName}</p>
                      <p className="text-xs text-gray-500">
                        {r.agency} · {format(new Date(r.date), "dd MMM yyyy", { locale: localeId })}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
