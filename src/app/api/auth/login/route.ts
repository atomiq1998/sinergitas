import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { signToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "USER" | "VIEWER",
      name: user.name,
    });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
