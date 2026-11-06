import React, { useState, useEffect } from 'react';
import { Coins, Check, AlertCircle } from 'lucide-react';
import type { StudioStats } from '../types/cine3d';

export default function CreditsPanel() {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [availableInput, setAvailableInput] = useState('');
  const [saved, setSaved] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/studio/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setAvailableInput(String(data.available_credits));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveBudget = async () => {
    const val = Math.max(0, Number(availableInput) || 0);
    try {
      const res = await fetch('/api/studio/set-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!stats) return null;

  const now = new Date();
  const resetMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetLabel = `1° ${resetMonth.toLocaleDateString('it-IT', { month: 'long' })}`;

  return (
    <section className="mt-8 bg-[#121218] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-heading font-semibold text-white">
          <Coins className="h-5 w-5 text-amber-400" />
          <span>Crediti Studio & Budget Video</span>
        </h2>
        <span className="text-xs text-neutral-400 font-mono">
          Il piano si azzera ogni mese · prossimo reset: {resetLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Consumato */}
        <div className="bg-[#181824] border border-neutral-800/80 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
            Consumato (video)
          </span>
          <p className="text-2xl font-bold text-white font-mono">{stats.consumed_credits} crediti</p>
          <p className="text-xs text-neutral-400">Clip già generate in tutte le serie animate.</p>
        </div>

        {/* In sospeso */}
        <div className="bg-[#181824] border border-neutral-800/80 rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
            Serve per le clip in sospeso
          </span>
          <p className="text-2xl font-bold text-amber-300 font-mono">~{stats.pending_credits} crediti</p>
          <p className="text-xs text-neutral-400">Stima indicativa per le inquadrature ancora da produrre.</p>
        </div>

        {/* Disponibili */}
        <div className="bg-[#181824] border border-neutral-800/80 rounded-xl p-4 space-y-2">
          <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">
            Disponibili nel piano
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={availableInput}
              onChange={e => setAvailableInput(e.target.value)}
              onBlur={handleSaveBudget}
              className="w-24 bg-[#101018] border border-neutral-700 focus:border-amber-400 rounded-lg px-2.5 py-1 text-sm font-mono text-white focus:outline-none"
            />
            <span className="text-[11px] text-neutral-400">
              {saved ? <span className="text-emerald-400 flex items-center gap-1 font-semibold"><Check className="h-3.5 w-3.5" /> salvato</span> : 'clicca fuori per salvare'}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {stats.available_credits >= stats.pending_credits
              ? `Copertura completa per le inquadrature programmate.`
              : `Mancano circa ${stats.pending_credits - stats.available_credits} crediti.`}
          </p>
        </div>
      </div>
    </section>
  );
}
