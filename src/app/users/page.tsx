"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import type { User, UserRole } from "@/types";

export default function UsersPage() {
  const { token, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" as UserRole });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    if (!token) return;
    const res = await authFetch(token, "/api/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (hasRole(["ADMIN"])) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!hasRole(["ADMIN"])) {
    return (
      <AppLayout>
        <p className="text-center text-gray-500 py-20">Akses ditolak — hanya Admin</p>
      </AppLayout>
    );
  }

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "USER" });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const method = editing ? "PUT" : "POST";
    const body = editing && !form.password
      ? { name: form.name, email: form.email, role: form.role }
      : form;

    const res = await authFetch(token, url, { method, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    resetForm();
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus user ini?")) return;
    await authFetch(token, `/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const startEdit = (user: User) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setShowForm(true);
  };

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    USER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-100 text-gray-700",
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola akun pengguna sistem</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">{editing ? "Edit User" : "User Baru"}</h2>
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Nama"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              placeholder={editing ? "Password baru (opsional)" : "Password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm"
              required={!editing}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Simpan
            </button>
            <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Bergabung</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy", { locale: localeId }) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(u)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
