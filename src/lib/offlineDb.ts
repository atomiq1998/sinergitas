import Dexie, { type Table } from "dexie";
import type { ReportFormData, ReportStatus } from "@/types";

export interface OfflineReport extends ReportFormData {
  id?: number;
  localId: string;
  userId: string;
  status: ReportStatus;
  synced: number;
  serverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineDraft {
  id?: number;
  localId: string;
  userId: string;
  data: ReportFormData;
  updatedAt: string;
}

class SinergitasDB extends Dexie {
  reports!: Table<OfflineReport>;
  drafts!: Table<OfflineDraft>;
  syncQueue!: Table<{ id?: number; localId: string; action: string; payload: string; createdAt: string }>;

  constructor() {
    super("SinergitasDB");
    this.version(1).stores({
      reports: "++id, localId, userId, synced, status",
      drafts: "++id, localId, userId",
      syncQueue: "++id, localId, action",
    });
  }
}

export const offlineDb = typeof window !== "undefined" ? new SinergitasDB() : null;

export function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
