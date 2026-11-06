import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, CheckCircle2, AlertTriangle, ExternalLink, Clipboard, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import type { ApiKeyEntry } from '../types/cine3d';

interface GoogleApiKeyManagerProps {
  onKeyAddedOrUpdated?: () => void;
}

export default function GoogleApiKeyManager({ onKeyAddedOrUpdated }: GoogleApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Primary input box state
  const [keyInput, setKeyInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [autoOverwrite, setAutoOverwrite] = useState(true);
  const [savingKey, setSavingKey] = useState(false);

  // New backup key modal / section toggle
  const [showAddBackup, setShowAddBackup] = useState(false);
  const [backupKeyInput, setBackupKeyInput] = useState('');
  const [backupLabelInput, setBackupLabelInput] = useState('');

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
        setActiveKeyId(data.active_key_id || null);
        setIsPaused(Boolean(data.is_paused));
        setPauseReason(data.pause_reason || null);
      }
    } catch (e) {
      console.error('Error fetching API keys', e);
    }
  };

  useEffect(() => {
    fetchKeys();
    const interval = setInterval(fetchKeys, 5000);
    return () => clearInterval(interval);
  }, []);

  // One-click paste from clipboard
  const handlePasteClipboard = async (target: 'primary' | 'backup') => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().startsWith('AIza')) {
        if (target === 'primary') {
          setKeyInput(text.trim());
          // Auto-trigger save and activate
          saveAndActivateKey(text.trim(), labelInput || 'Chiave Principale Google AI', autoOverwrite);
        } else {
          setBackupKeyInput(text.trim());
        }
      } else if (text) {
        if (target === 'primary') setKeyInput(text.trim());
        else setBackupKeyInput(text.trim());
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or not supported:', err);
    }
  };

  // Auto-save and activation
  const saveAndActivateKey = async (rawKey: string, label: string, overwrite: boolean) => {
    if (!rawKey.trim()) {
      setErrorMsg('Inserisci una chiave Google AI Studio.');
      return;
    }

    setSavingKey(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: rawKey.trim(),
          label: label.trim() || `Chiave Google AI #${keys.length + 1}`,
          overwrite
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore nel salvataggio della chiave.');
      }

      setSuccessMsg('Chiave salvata, verificata e attivata con successo nel pool!');
      setKeyInput('');
      setLabelInput('');
      setBackupKeyInput('');
      setBackupLabelInput('');
      setShowAddBackup(false);
      await fetchKeys();
      onKeyAddedOrUpdated?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Errore di connessione a Google AI Studio.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchKeys();
        onKeyAddedOrUpdated?.();
      }
    } catch (e) {
      console.error('Error deleting key', e);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const res = await fetch(`/api/keys/set-active/${id}`, { method: 'POST' });
      if (res.ok) {
        await fetchKeys();
        onKeyAddedOrUpdated?.();
      }
    } catch (e) {
      console.error('Error setting active key', e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100">
      {/* Header Info */}
      <div className="border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
              Gestione Chiavi API Google AI Studio
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Inserisci una o più chiavi gratuite di Google AI Studio. Quando una chiave esaurisce i token, il sistema passa automaticamente alla successiva senza interrompere la produzione video.
            </p>
          </div>
        </div>
      </div>

      {/* Quota Exhaustion Alert (if paused) */}
      {isPaused && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-amber-300">
                Quote Token Google AI Studio Momentaneamente Esaurite
              </div>
              <div className="text-xs text-neutral-300 mt-0.5">
                Il lavoro è stato congelato in sicurezza senza perdere nulla di quanto già sviluppato. Attendi il ripristino automatico oppure inserisci una nuova chiave qui sotto per riprendere immediatamente.
              </div>
            </div>
          </div>
          <button
            onClick={() => handlePasteClipboard('primary')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition"
          >
            <Clipboard className="h-3.5 w-3.5" />
            Incolla e Riprendi
          </button>
        </div>
      )}

      {/* Primary Key Box */}
      <div className="bg-[#12121a] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Box Inserimento Chiave API</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Salvataggio e attivazione automatica
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-neutral-400 mb-1 block">
              Chiave API Google AI Studio (inizia solitamente con <code className="text-amber-400">AIzaSy...</code>)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Incolla qui la tua API Key di Google AI Studio..."
                  className="w-full bg-[#0a0a0f] border border-neutral-700 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition pr-10 font-mono"
                />
              </div>

              {/* One-Click Paste Button */}
              <button
                type="button"
                onClick={() => handlePasteClipboard('primary')}
                className="px-4 py-2.5 rounded-xl bg-[#1a1a24] hover:bg-[#222230] text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0"
                title="Incolla direttamente dagli appunti"
              >
                <Clipboard className="h-4 w-4" />
                <span>Incolla da Appunti</span>
              </button>

              {/* Save & Activate Button */}
              <button
                type="button"
                disabled={savingKey || !keyInput.trim()}
                onClick={() => saveAndActivateKey(keyInput, labelInput, autoOverwrite)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-amber-500/20 shrink-0"
              >
                {savingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                <span>Salva e Attiva</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="overwriteCheck"
                checked={autoOverwrite}
                onChange={(e) => setAutoOverwrite(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <label htmlFor="overwriteCheck" className="cursor-pointer">
                Sovrascrittura automatica di attivazione (imposta come attiva primaria)
              </label>
            </div>

            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Etichetta facoltativa (es. Chiave Account 1)"
              className="bg-[#0a0a0f] border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-300 w-52 outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/50 p-2.5 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 p-2.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Button to add additional backup keys */}
        <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAddBackup(!showAddBackup)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium transition"
          >
            <Plus className="h-4 w-4" />
            <span>Aggiungi nuova chiave di riserva (Failover illimitato)</span>
          </button>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>Recupera la tua API Key su Google AI Studio</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Additional Backup Key Form (if toggled) */}
        {showAddBackup && (
          <div className="p-4 rounded-xl bg-[#0a0a0f] border border-neutral-800 space-y-3 mt-3 animate-in fade-in">
            <div className="text-xs font-semibold text-neutral-300">
              Aggiungi Chiave di Riserva Aggiuntiva
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={backupKeyInput}
                onChange={(e) => setBackupKeyInput(e.target.value)}
                placeholder="Incolla chiave di riserva..."
                className="flex-1 bg-[#121218] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white font-mono outline-none"
              />
              <button
                type="button"
                onClick={() => handlePasteClipboard('backup')}
                className="px-3 py-2 bg-[#1a1a24] text-xs text-neutral-300 rounded-lg border border-neutral-700 flex items-center gap-1.5 hover:bg-[#252535]"
              >
                <Clipboard className="h-3 w-3" />
                Incolla
              </button>
              <button
                type="button"
                onClick={() => saveAndActivateKey(backupKeyInput, backupLabelInput || `Chiave Riserva #${keys.length + 1}`, false)}
                className="px-4 py-2 bg-neutral-200 hover:bg-white text-neutral-950 font-bold text-xs rounded-lg transition"
              >
                Salva come Riserva
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys Pool List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 font-heading">
            Pool Chiavi Registrate ({keys.length})
          </h3>
          <span className="text-xs text-neutral-400">
            Failover attivo in tempo reale
          </span>
        </div>

        {keys.length === 0 ? (
          <div className="bg-[#121218] border border-neutral-800/80 rounded-xl p-6 text-center text-neutral-400 text-xs">
            Nessuna chiave personalizzata registrata. Incolla la tua prima chiave sopra per iniziare la produzione illimitata.
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => {
              const isActive = k.status === 'active';
              const isExhausted = k.status === 'exhausted';
              const isStandby = k.status === 'standby';

              return (
                <div
                  key={k.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : isExhausted
                      ? 'bg-red-950/20 border-red-800/40 text-neutral-300'
                      : 'bg-[#121218] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : isExhausted
                          ? 'bg-red-900/40 text-red-400'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Key className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {k.label}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ATTIVA
                          </span>
                        )}
                        {isStandby && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            IN RISERVA
                          </span>
                        )}
                        {isExhausted && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            QUOTA ESAURITA (429)
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
                        {k.masked_key} • Richieste eseguite: {k.calls_count || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => handleSetActive(k.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                      >
                        Imposta Attiva
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition"
                      title="Rimuovi chiave"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explanatory Help Card with Direct Google AI Studio Link */}
      <div className="bg-[#121218] border border-neutral-800/80 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Come ottenere una chiave Google AI Studio gratuita
        </h4>
        <ol className="text-xs text-neutral-400 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Visita la pagina ufficiale di Google AI Studio cliccando il link sottostante.</li>
          <li>Accedi con il tuo account Google gratuito.</li>
          <li>Clicca su <strong>"Get API key"</strong> e poi su <strong>"Create API key"</strong>.</li>
          <li>Copia la chiave generata e incollala nel box sopra. Puoi inserirne quante ne vuoi!</li>
        </ol>

        <div className="pt-2">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-2 rounded-xl transition"
          >
            <span>🔗 Recupera la tua API Key su Google AI Studio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
