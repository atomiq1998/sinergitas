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
- **Database:** PostgreSQL + Prisma ORM
- **Offline:** Dexie (IndexedDB)
- **Charts:** Recharts
- **Export:** xlsx, jsPDF

## Instalasi Lokal

1. Buat database PostgreSQL gratis di [Neon](https://neon.tech) atau [Supabase](https://supabase.com)
2. Salin connection string ke `.env`:

```bash
cp .env.example .env
# Edit DATABASE_URL dan JWT_SECRET
```

3. Jalankan:

```bash
npm install
npm run db:setup
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deploy ke Vercel

### 1. Siapkan PostgreSQL

Buat database di salah satu layanan ini (gratis):

- [Neon](https://neon.tech) (disarankan)
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)

### 2. Environment Variables di Vercel

Di **Project Settings → Environment Variables**, tambahkan:

| Variable | Contoh |
|----------|--------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | string acak panjang (min. 32 karakter) |

### 3. Deploy

Push ke GitHub dan import project di Vercel. Build otomatis menjalankan:

```
prisma generate → prisma migrate deploy → next build
```

### 4. Seed data (sekali)

Setelah deploy pertama, jalankan seed dari komputer lokal:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

## Akun Demo

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@sinergitas.id    | admin123   |
| User   | user@sinergitas.id     | user123    |
| Viewer | viewer@sinergitas.id   | viewer123  |

## Scripts

| Command              | Deskripsi                         |
|----------------------|-----------------------------------|
| `npm run dev`        | Development server                |
| `npm run build`      | Production build                  |
| `npm run vercel-build` | Build + migrate (untuk Vercel)  |
| `npm run db:setup`   | Migrate DB + seed data            |
| `npm run db:seed`    | Seed data demo                    |

## Struktur Role

- **Admin** — Kelola user, setujui/tolak laporan, export rekap
- **User** — Buat & kelola laporan sendiri
- **Viewer** — Lihat dashboard & laporan (read-only)

## PWA

Aplikasi dapat di-install ke home screen (mobile/desktop). Mode offline aktif untuk input laporan — data tersimpan lokal dan disinkronkan saat koneksi tersedia.

## Environment

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="your-secret-key"
```
