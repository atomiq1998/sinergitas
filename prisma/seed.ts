import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = [
    { name: "Administrator", email: "admin@sinergitas.id", password: "admin123", role: "ADMIN" },
    { name: "Staff Operasional", email: "user@sinergitas.id", password: "user123", role: "USER" },
    { name: "Manager Viewer", email: "viewer@sinergitas.id", password: "viewer123", role: "VIEWER" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashPassword(u.password),
        role: u.role,
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { email: "user@sinergitas.id" } });
  if (!user) return;

  const sampleReports = [
    {
      activityName: "Koordinasi Lintas Instansi",
      date: new Date("2026-06-15"),
      location: "Jakarta Pusat",
      agency: "Kementerian A",
      description: "Rapat koordinasi sinergitas antar instansi terkait program prioritas nasional.",
      status: "APPROVED",
    },
    {
      activityName: "Sosialisasi Program Sinergitas",
      date: new Date("2026-06-20"),
      location: "Bandung",
      agency: "Pemerintah Daerah B",
      description: "Kegiatan sosialisasi program sinergitas kepada stakeholder daerah.",
      status: "SUBMITTED",
    },
    {
      activityName: "Monitoring Lapangan",
      date: new Date("2026-06-25"),
      location: "Surabaya",
      agency: "Kementerian C",
      description: "Monitoring implementasi kegiatan sinergitas di wilayah timur Indonesia.",
      status: "SUBMITTED",
    },
    {
      activityName: "Workshop Capacity Building",
      date: new Date("2026-06-28"),
      location: "Yogyakarta",
      agency: "Lembaga D",
      description: "Pelatihan peningkatan kapasitas tim operasional dalam pelaporan kegiatan.",
      status: "DRAFT",
    },
  ];

  const existing = await prisma.report.count();
  if (existing === 0) {
    for (const r of sampleReports) {
      await prisma.report.create({
        data: { ...r, userId: user.id },
      });
    }
  }

  console.log("Seed selesai!");
  console.log("Admin: admin@sinergitas.id / admin123");
  console.log("User: user@sinergitas.id / user123");
  console.log("Viewer: viewer@sinergitas.id / viewer123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
