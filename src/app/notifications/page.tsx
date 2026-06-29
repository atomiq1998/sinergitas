"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Plus } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import AppLayout from "@/components/layout/AppLayout";
import { authFetch, useAuth } from "@/contexts/AuthContext";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!token) return;
    const res = await authFetch(token, "/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const markAllRead = async () => {
    await authFetch(token, "/api/notifications", {
      method: "POST",
      body: JSON.stringify({ action: "markAllRead" }),
    });
    fetchNotifications();
  };

  const createReminder = async () => {
    await authFetch(token, "/api/notifications", {
      method: "POST",
      body: JSON.stringify({ action: "reminder" }),
    });
    fetchNotifications();
  };

  const typeIcons: Record<string, string> = {
    REMINDER: "🔔",
    STATUS_UPDATE: "📋",
    SYSTEM: "⚙️",
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-sm text-gray-500">Reminder & update status laporan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={createReminder}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <Plus size={16} />
            Buat Reminder
          </button>
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <CheckCheck size={16} />
            Tandai Dibaca
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-sm text-gray-500">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-4 px-6 py-4 ${!n.read ? "bg-blue-50/50" : ""}`}
              >
                <span className="text-2xl">{typeIcons[n.type] ?? "📌"}</span>
                <div className="flex-1">
                  <p className={`font-medium ${!n.read ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {format(new Date(n.createdAt), "dd MMM yyyy HH:mm", { locale: localeId })}
                  </p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
