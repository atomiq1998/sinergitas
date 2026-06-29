"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Search, Plus, Filter } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import type { Report, ReportStatus } from "@/types";

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

export default function ReportsPage() {
  const { token, hasRole } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [agency, setAgency] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (agency) params.set("agency", agency);
    if (status) params.set("status", status);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await authFetch(token, `/api/reports?${params}`);
    const data = await res.json();
    setReports(data.reports ?? []);
    setLoading(false);
  }, [token, keyword, agency, status, startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Laporan</h1>
          <p className="text-sm text-gray-500">Kelola laporan kegiatan sinergitas</p>
        </div>
        {hasRole(["ADMIN", "USER"]) && (
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Tambah Laporan
          </Link>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari kegiatan, lokasi, deskripsi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-3 rounded-lg border bg-white p-4 sm:grid-cols-4">
            <input
              type="text"
              placeholder="Instansi"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Semua Status</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">Tidak ada laporan ditemukan</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Kegiatan</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Lokasi</th>
                  <th className="px-6 py-3">Instansi</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Pelapor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/reports/${r.id}`} className="font-medium text-blue-600 hover:underline">
                        {r.activityName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(r.date), "dd MMM yyyy", { locale: localeId })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{r.location}</td>
                    <td className="px-6 py-4 text-gray-600">{r.agency}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[r.status as ReportStatus]}`}>
                        {statusLabels[r.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{r.user?.name ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
