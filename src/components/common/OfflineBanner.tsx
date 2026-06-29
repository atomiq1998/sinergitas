"use client";

import { Wifi, WifiOff, RefreshCw, Download } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const { isOnline, syncing, pendingCount, syncPending } = useOfflineSync();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt = deferredPrompt as any;
    prompt.prompt();
    await prompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <div className="space-y-2">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 border border-amber-200">
          <WifiOff size={16} />
          Mode offline — data akan disinkronkan saat online
          {pendingCount > 0 && <span className="font-medium">({pendingCount} menunggu sync)</span>}
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800 border border-blue-200">
          <span className="flex items-center gap-2">
            <Wifi size={16} />
            {pendingCount} laporan menunggu sinkronisasi
          </span>
          <button
            onClick={syncPending}
            disabled={syncing}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-white text-xs hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      )}

      {showInstall && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800 border border-green-200">
          <span className="flex items-center gap-2">
            <Download size={16} />
            Install aplikasi ke perangkat Anda
          </span>
          <button
            onClick={handleInstall}
            className="rounded bg-green-600 px-3 py-1 text-white text-xs hover:bg-green-700"
          >
            Install
          </button>
        </div>
      )}
    </div>
  );
}
