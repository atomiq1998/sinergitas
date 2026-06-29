import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Report } from "@/types";

function formatDate(date: string) {
  return format(new Date(date), "dd MMM yyyy", { locale: localeId });
}

export function exportToExcel(reports: Report[], filename = "rekap-laporan-sinergitas") {
  const rows = reports.map((r, i) => ({
    No: i + 1,
    "Nama Kegiatan": r.activityName,
    Tanggal: formatDate(r.date),
    Lokasi: r.location,
    Instansi: r.agency,
    Deskripsi: r.description,
    Status: r.status,
    Pelapor: r.user?.name ?? "-",
    "Dibuat Pada": formatDate(r.createdAt),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(reports: Report[], title = "Rekapitulasi Laporan Kegiatan Sinergitas") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Diekspor: ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: localeId })}`, 14, 22);
  doc.text(`Total laporan: ${reports.length}`, 14, 28);

  autoTable(doc, {
    startY: 34,
    head: [["No", "Kegiatan", "Tanggal", "Lokasi", "Instansi", "Status", "Pelapor"]],
    body: reports.map((r, i) => [
      i + 1,
      r.activityName,
      formatDate(r.date),
      r.location,
      r.agency,
      r.status,
      r.user?.name ?? "-",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save("rekap-laporan-sinergitas.pdf");
}
