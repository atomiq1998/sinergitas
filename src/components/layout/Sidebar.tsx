"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "USER", "VIEWER"] },
  { href: "/reports", label: "Laporan", icon: FileText, roles: ["ADMIN", "USER", "VIEWER"] },
  { href: "/reports/new", label: "Tambah Laporan", icon: PlusCircle, roles: ["ADMIN", "USER"] },
  { href: "/rekapitulasi", label: "Rekapitulasi", icon: BarChart3, roles: ["ADMIN", "USER", "VIEWER"] },
  { href: "/notifications", label: "Notifikasi", icon: Bell, roles: ["ADMIN", "USER", "VIEWER"] },
  { href: "/users", label: "Manajemen User", icon: Users, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(false);

  const filtered = navItems.filter((item) => hasRole(item.roles as ("ADMIN" | "USER" | "VIEWER")[]));

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Sinergitas</h1>
            <p className="text-xs text-blue-200">Rekap Laporan Kegiatan</p>
          </div>

          <nav className="flex-1 space-y-1">
            {filtered.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active ? "bg-white/20 font-medium" : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/20 pt-4">
            <div className="mb-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-blue-200">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
