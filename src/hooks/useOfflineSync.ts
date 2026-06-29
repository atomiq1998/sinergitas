"use client";

import { useEffect, useState, useCallback } from "react";
import { offlineDb, generateLocalId } from "@/lib/offlineDb";
import { useAuth } from "@/contexts/AuthContext";
import type { ReportFormData } from "@/types";

export function useOfflineSync() {
  const { user, token } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = useCallback(async () => {
    if (!offlineDb) return;
    const count = await offlineDb.reports.where("synced").equals(0).count();
    setPendingCount(count);
  }, []);

  const syncPending = useCallback(async () => {
    if (!offlineDb || !token || !navigator.onLine) return;
    setSyncing(true);
    try {
      const pending = await offlineDb.reports.where("synced").equals(0).toArray();
      if (pending.length === 0) return;

      const res = await fetch("/api/reports/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reports: pending }),
      });

      if (res.ok) {
        const { synced } = await res.json();
        for (const item of synced) {
          await offlineDb.reports.where("localId").equals(item.localId).modify({
            synced: 1,
            serverId: item.serverId,
          });
        }
        await updatePendingCount();
      }
    } finally {
      setSyncing(false);
    }
  }, [token, updatePendingCount]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => {
      setIsOnline(true);
      syncPending();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    updatePendingCount();
    if (navigator.onLine) syncPending();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [syncPending, updatePendingCount]);

  const saveOfflineReport = async (data: ReportFormData, status: "DRAFT" | "SUBMITTED" = "SUBMITTED") => {
    if (!offlineDb || !user) return null;
    const now = new Date().toISOString();
    const localId = data.clientId || generateLocalId();
    const existing = await offlineDb.reports.where("localId").equals(localId).first();

    const record = {
      localId,
      userId: user.id,
      ...data,
      status,
      synced: 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (existing?.id) {
      await offlineDb.reports.update(existing.id, record);
    } else {
      await offlineDb.reports.add(record);
    }
    await updatePendingCount();
    return localId;
  };

  const saveDraft = async (data: ReportFormData) => {
    if (!offlineDb || !user) return;
    const localId = data.clientId || generateLocalId();
    const now = new Date().toISOString();
    const existing = await offlineDb.drafts.where("localId").equals(localId).first();
    const draft = { localId, userId: user.id, data: { ...data, clientId: localId }, updatedAt: now };
    if (existing?.id) {
      await offlineDb.drafts.update(existing.id, draft);
    } else {
      await offlineDb.drafts.add(draft);
    }
    return localId;
  };

  const getDraft = async (localId: string) => {
    if (!offlineDb) return null;
    return offlineDb.drafts.where("localId").equals(localId).first();
  };

  return {
    isOnline,
    syncing,
    pendingCount,
    syncPending,
    saveOfflineReport,
    saveDraft,
    getDraft,
    updatePendingCount,
  };
}
