'use client';

import React, { useState, useEffect } from 'react';
import { Download, Check, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setLeaderboardOptIn(json.data.leaderboardOptIn || false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleOptIn = async (newVal: boolean) => {
    setError(null);
    setLeaderboardOptIn(newVal);
    setSaving(true);
    try {
      const response = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboardOptIn: newVal }),
      });
      if (!response.ok) throw new Error('Unable to save your leaderboard preference.');
    } catch {
      // Revert on error
      setLeaderboardOptIn(!newVal);
      setError('We could not save that preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/session');
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error('Export unavailable');
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `songsprint-player-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Your export could not be prepared. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/session', { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json?.success) {
        setDeletedMsg(true);
        setLeaderboardOptIn(false);
        setDeleteConfirm(false);
      }
    } catch {
      setError('Your data was not deleted. Please try again before leaving this page.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-2xl mx-auto w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Privacy & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transparent data controls, privacy preferences, and music licensing disclosures.
        </p>
      </div>

      {deletedMsg && (
        <div role="status" className="w-full p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Your player records and leaderboard listings have been purged.</span>
        </div>
      )}
      {error && <p role="alert" className="w-full text-sm text-rose-300">{error}</p>}

      {/* Leaderboard Privacy Toggle */}
      <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base">Public Daily Leaderboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Allow your completed Daily scores and display name to appear on the public Daily Leaderboard. Off by default. You may opt out at any time.
            </p>
          </div>

          <button
            onClick={() => handleToggleOptIn(!leaderboardOptIn)}
            disabled={saving}
            aria-pressed={leaderboardOptIn}
            aria-label="Allow public Daily leaderboard listing"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              leaderboardOptIn ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                leaderboardOptIn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Export (GDPR / Transparency) */}
      <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-white text-base">Export Player Data</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md">
            Download a portable JSON archive of your streak records, session history, and settings.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 flex-shrink-0 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Audio Licensing & Terms Disclosure */}
      <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Lawful Audio & Content Policy</span>
        </div>
        <p className="leading-relaxed">
          SongSprint adheres strictly to music licensing laws. All audio samples provided in this application are certified Creative Commons (CC-BY 4.0), royalty-free, or licensed through approved provider integrations.
        </p>
        <p className="leading-relaxed">
          We never scrape, cache, host, or stream unlicensed commercial audio recordings. Audio playback is restricted to sub-second preview evaluation and cannot be downloaded or exported as full tracks.
        </p>
      </div>

      {/* Account / Session Deletion */}
      <div className="w-full glass-panel rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
        <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Delete Player Data</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Permanently delete your player profile, daily streak, and history. This action cannot be undone.
        </p>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors"
          >
            Delete My Player Record
          </button>
        ) : (
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-heading" aria-describedby="delete-description" className="rounded-2xl border border-rose-500/30 bg-slate-950/80 p-4 space-y-3">
            <p id="delete-heading" className="text-sm font-bold text-white">Permanently delete your player data?</p>
            <p id="delete-description" className="text-xs text-slate-400">This removes your profile, game history, streak, leaderboard listing, and this device&apos;s player session. Challenges you created are expired and anonymized.</p>
            <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              Confirm Permanent Deletion
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Cancel
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
