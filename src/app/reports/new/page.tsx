"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { generateLocalId } from "@/lib/offlineDb";
import type { ReportStatus } from "@/types";

export default function NewReportPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { isOnline, saveOfflineReport, saveDraft } = useOfflineSync();
  const [form, setForm] = useState({
    activityName: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    agency: "",
    description: "",
    attachments: "",
    clientId: generateLocalId(),
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDraftSaved(false);
  };

  const autoSave = useCallback(async () => {
    if (!form.activityName && !form.description) return;
    await saveDraft({ ...form, status: "DRAFT" });
    setDraftSaved(true);
  }, [form, saveDraft]);

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(autoSave, 3000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [form, autoSave]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update("attachments", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submit = async (asDraft: boolean) => {
    setError("");
    setSubmitting(true);
    try {
      const status: ReportStatus = asDraft ? "DRAFT" : "SUBMITTED";
      const payload = { ...form, status };

      if (!isOnline) {
        await saveOfflineReport(payload, status);
        router.push("/reports");
        return;
      }

      const res = await authFetch(token, "/api/reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/reports/${data.report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Link href="/reports" className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Laporan</h1>
        <p className="text-sm text-gray-500">
          Isi form kegiatan sinergitas {draftSaved && <span className="text-green-600">· Draft tersimpan</span>}
        </p>
      </div>

      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        <div className="space-y-4">
          <Field label="Nama Kegiatan *" value={form.activityName} onChange={(v) => update("activityName", v)} />
          <Field label="Tanggal *" type="date" value={form.date} onChange={(v) => update("date", v)} />
          <Field label="Lokasi *" value={form.location} onChange={(v) => update("location", v)} />
          <Field label="Instansi Terkait *" value={form.agency} onChange={(v) => update("agency", v)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi *</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Jelaskan kegiatan yang dilakukan..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dokumentasi (Foto/File)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:bg-gray-50">
              <Upload size={20} />
              <span>Klik untuk upload (max 2MB)</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
            </label>
            {form.attachments && (
              <p className="mt-1 text-xs text-green-600">File terlampir</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => submit(true)}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <Save size={18} />
            Simpan Draft
          </button>
          <button
            onClick={() => submit(false)}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={18} />
            {submitting ? "Mengirim..." : "Kirim Laporan"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
