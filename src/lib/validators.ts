import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const userSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  role: z.enum(["ADMIN", "USER", "VIEWER"]),
});

export const reportSchema = z.object({
  activityName: z.string().min(3, "Nama kegiatan minimal 3 karakter"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  location: z.string().min(2, "Lokasi wajib diisi"),
  agency: z.string().min(2, "Instansi wajib diisi"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  attachments: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  clientId: z.string().optional(),
});

export const reportUpdateSchema = reportSchema.partial().extend({
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
});
