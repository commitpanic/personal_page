"use client";

import { useEffect, useState } from 'react';
import { qrzAPI } from '@/services/api';

type SyncState = {
  last_sync_at?: string | null;
  last_status?: string | null;
  last_error?: string | null;
};

export default function QrzMapPanel() {
  const [status, setStatus] = useState<SyncState | null>(null);
  const [embedCode, setEmbedCode] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const embedUrl = qrzAPI.getMapEmbedUrl();

  const loadStatus = async () => {
    try {
      setLoadingStatus(true);
      const nextStatus = await qrzAPI.getStatus();
      setStatus(nextStatus);
    } catch (error: any) {
      setMessage(error?.message || 'Nie udalo sie pobrac statusu QRZ.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadEmbedCode = async () => {
    try {
      const iframe = await qrzAPI.getEmbedCode();
      setEmbedCode(iframe);
    } catch (error: any) {
      setMessage(error?.message || 'Nie udalo sie pobrac kodu iframe.');
    }
  };

  useEffect(() => {
    loadStatus();
    loadEmbedCode();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setMessage('');
      const result = await qrzAPI.syncNow();
      setMessage(`Sync zakonczony. Imported: ${result.imported}, Updated: ${result.updated}, Skipped: ${result.skipped}.`);
      await loadStatus();
    } catch (error: any) {
      setMessage(error?.message || 'Synchronizacja QRZ nie powiodla sie.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyIframe = async () => {
    if (!embedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(embedCode);
      setMessage('Kod iframe skopiowany do schowka.');
    } catch {
      setMessage('Nie udalo sie skopiowac kodu iframe.');
    }
  };

  return (
    <section className="flex h-[420px] flex-col rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div>
          <h2 className="font-mono text-sm font-bold text-green-400 sm:text-base">QRZ Map</h2>
          <p className="font-mono text-xs text-gray-400">Mapa lacznosci i szybki podglad embed</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="rounded border border-green-500 px-3 py-1 font-mono text-xs text-green-300 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncing ? 'sync...' : 'sync now'}
          </button>
          <button
            type="button"
            onClick={handleCopyIframe}
            className="rounded border border-gray-600 px-3 py-1 font-mono text-xs text-gray-300 transition hover:bg-gray-800"
          >
            copy iframe
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-0 md:grid-cols-[1.5fr_1fr]">
        <div className="min-h-[240px] border-b border-gray-700 md:border-b-0 md:border-r">
          <iframe
            src={embedUrl}
            title="QRZ map embed"
            className="h-full w-full bg-black"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-3 p-4 font-mono text-xs text-gray-300">
          <div className="rounded border border-gray-700 bg-black/30 p-3">
            <div className="text-gray-500">Last sync</div>
            <div className="mt-1 text-green-300">
              {loadingStatus ? 'loading...' : status?.last_sync_at ? new Date(status.last_sync_at).toLocaleString() : 'never'}
            </div>
          </div>

          <div className="rounded border border-gray-700 bg-black/30 p-3">
            <div className="text-gray-500">Status</div>
            <div className="mt-1 text-green-300">{loadingStatus ? 'loading...' : status?.last_status || 'n/a'}</div>
            {status?.last_error ? <div className="mt-2 text-red-400">{status.last_error}</div> : null}
          </div>

          <div className="rounded border border-gray-700 bg-black/30 p-3">
            <div className="text-gray-500">Embed URL</div>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-cyan-300 hover:text-cyan-200"
            >
              {embedUrl}
            </a>
          </div>

          <div className="rounded border border-gray-700 bg-black/30 p-3">
            <div className="text-gray-500">Message</div>
            <div className="mt-1 min-h-10 text-gray-300">{message || 'Ustaw QRZ_API_KEY i uruchom sync, aby pobrac logi.'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}