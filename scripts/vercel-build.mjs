import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

run("prisma generate");

const dbUrl = process.env.DATABASE_URL ?? "";

if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
  console.log("Running prisma migrate deploy...");
  try {
    run("prisma migrate deploy");
  } catch {
    console.warn(
      "\n⚠️  prisma migrate deploy gagal (build tetap lanjut).\n" +
        "   Pastikan DATABASE_URL valid di Vercel Environment Variables.\n" +
        "   Jalankan manual: DATABASE_URL=... npx prisma migrate deploy\n"
    );
  }
} else {
  console.warn(
    "\n⚠️  DATABASE_URL PostgreSQL belum diset — skip migrate deploy.\n" +
      "   Set di Vercel → Settings → Environment Variables\n"
  );
}

run("next build");
