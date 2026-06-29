import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole, hashPassword } from "@/lib/auth";
import { userSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!hasRole(auth, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = getUserFromRequest(request);
  if (!hasRole(auth, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, role } = parsed.data;
    if (!password) {
      return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, email, password: hashPassword(password), role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
