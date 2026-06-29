# Sinergitas PWA - Sistem Rekapitulasi Laporan Kegiatan

Progressive Web App untuk rekapitulasi laporan kegiatan sinergitas dengan dukungan offline-first, sinkronisasi otomatis, dan dashboard monitoring.

## Fitur

- **Input Laporan** — Form kegiatan dengan auto-save draft, validasi, upload dokumentasi
- **Rekapitulasi Otomatis** — Agregasi per hari/minggu/bulan & instansi, export Excel/PDF
- **Dashboard Monitoring** — Statistik, grafik tren, filter dinamis
- **Manajemen User** — Role Admin, User, Viewer dengan JWT authentication
- **Offline Sync** — Input tanpa internet, sync otomatis via IndexedDB
- **Notifikasi** — Reminder input & update status laporan
- **Search & Filter** — Tanggal, instansi, status, keyword

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, PWA (Service Worker)
- **Backend:** Next.js API Routes (REST)
- **Database:** SQLite + Prisma ORM
- **Offline:** Dexie (IndexedDB)
- **Charts:** Recharts
- **Export:** xlsx, jsPDF

## Instalasi

```bash
cd sinergitas-pwa
npm install
npm run db:setup
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun Demo

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@sinergitas.id    | admin123   |
| User   | user@sinergitas.id     | user123    |
| Viewer | viewer@sinergitas.id   | viewer123  |

## Scripts

| Command           | Deskripsi                    |
|-------------------|------------------------------|
| `npm run dev`     | Development server           |
| `npm run build`   | Production build             |
| `npm run db:setup`| Migrate DB + seed data       |
| `npm run db:seed` | Seed data demo               |

## Struktur Role

- **Admin** — Kelola user, setujui/tolak laporan, export rekap
- **User** — Buat & kelola laporan sendiri
- **Viewer** — Lihat dashboard & laporan (read-only)

## PWA

Aplikasi dapat di-install ke home screen (mobile/desktop). Mode offline aktif untuk input laporan — data tersimpan lokal dan disinkronkan saat koneksi tersedia.

## Environment

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```
"# sinergitas" 
