import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import type { UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "sinergitas-jwt-secret";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return request.cookies.get("token")?.value ?? null;
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function hasRole(user: TokenPayload | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
