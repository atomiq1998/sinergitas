"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Trash2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import type { Report, ReportStatus } from "@/types";

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Terkirim",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    authFetch(token, `/api/reports/${id}`)
      .then((r) => r.json())
      .then((d) => setReport(d.report))
      .finally(() => setLoading(false));
  }, [token, id]);

  const updateStatus = async (status: ReportStatus) => {
    const res = await authFetch(token, `/api/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setReport(data.report);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus laporan ini?")) return;
    await authFetch(token, `/api/reports/${id}`, { method: "DELETE" });
    router.push("/reports");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout>
        <p className="text-center text-gray-500">Laporan tidak ditemukan</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link href="/reports" className="mb-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.activityName}</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(report.date), "dd MMMM yyyy", { locale: localeId })} · {report.agency}
            </p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {statusLabels[report.status]}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Lokasi" value={report.location} />
          <Info label="Instansi" value={report.agency} />
          <Info label="Pelapor" value={report.user?.name ?? "-"} />
          <Info label="Dibuat" value={format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: localeId })} />
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Deskripsi</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{report.description}</p>
        </div>

        {report.attachments && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Dokumentasi</h3>
            {report.attachments.startsWith("data:image") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={report.attachments} alt="Dokumentasi" className="max-h-64 rounded-lg border" />
            ) : (
              <p className="text-sm text-blue-600">File terlampir</p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {hasRole(["ADMIN"]) && (
            <>
              <button onClick={() => updateStatus("APPROVED")} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                Setujui
              </button>
              <button onClick={() => updateStatus("REJECTED")} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                Tolak
              </button>
            </>
          )}
          {hasRole(["ADMIN", "USER"]) && (
            <button onClick={handleDelete} className="flex items-center gap-1 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 size={16} /> Hapus
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
