"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    router.replace("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <FileText size={32} />
          </div>
          <h1 className="text-2xl font-bold">Sinergitas PWA</h1>
          <p className="mt-1 text-blue-200">Sistem Rekapitulasi Laporan Kegiatan</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl"
        >
          <h2 className="mb-6 text-lg font-semibold text-gray-800">Masuk ke Akun</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="nama@instansi.go.id"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Memproses..." : "Masuk"}
          </button>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-2">Akun Demo:</p>
            <p>Admin: admin@sinergitas.id / admin123</p>
            <p>User: user@sinergitas.id / user123</p>
            <p>Viewer: viewer@sinergitas.id / viewer123</p>
          </div>
        </form>
      </div>
    </div>
  );
}
