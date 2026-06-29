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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileSpreadsheet, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import { exportToExcel, exportToPDF } from "@/lib/export";
import type { RekapSummary } from "@/types";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RekapitulasiPage() {
  const { token } = useAuth();
  const [data, setData] = useState<RekapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [agency, setAgency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (agency) params.set("agency", agency);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await authFetch(token, `/api/rekapitulasi?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, period, agency, startDate, endDate]);

  const statusData = data
    ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi</h1>
          <p className="text-sm text-gray-500">Agregasi laporan per periode & instansi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => data && exportToExcel(data.reports)}
            disabled={!data?.reports.length}
            className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
          <button
            onClick={() => data && exportToPDF(data.reports)}
            disabled={!data?.reports.length}
            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4">
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="day">Per Hari</option>
          <option value="week">Per Minggu</option>
          <option value="month">Per Bulan</option>
        </select>
        <input
          type="text"
          placeholder="Filter instansi"
          value={agency}
          onChange={(e) => setAgency(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border bg-blue-50 p-6 text-center">
            <p className="text-4xl font-bold text-blue-900">{data?.total ?? 0}</p>
            <p className="text-sm text-blue-700">Total Laporan</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Per Periode</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.byPeriod ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold">Per Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Per Instansi</h2>
            <div className="space-y-2">
              {(data?.byAgency ?? []).map((item, i) => (
                <div key={item.agency} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-gray-500">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.agency}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${(item.count / (data?.total || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
