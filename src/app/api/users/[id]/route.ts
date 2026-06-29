import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, hasRole, hashPassword } from "@/lib/auth";
import { userSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!hasRole(auth, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = userSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data: Record<string, string> = {};
    if (parsed.data.name) data.name = parsed.data.name;
    if (parsed.data.email) data.email = parsed.data.email;
    if (parsed.data.role) data.role = parsed.data.role;
    if (parsed.data.password) data.password = hashPassword(parsed.data.password);

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!hasRole(auth, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (auth?.userId === params.id) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }
}
