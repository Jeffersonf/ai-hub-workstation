import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  FileCheck,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

export function WorkspaceExportModal({
  isOpen,
  onClose,
  accounts,
  settings,
  onRestoreAll
}) {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const gatherBackupPayload = () => {
    let promptHistory = [];
    let customPersonas = [];
    let scratchpadNotes = '';

    try {
      const h = localStorage.getItem('ai_hub_prompt_history');
      if (h) promptHistory = JSON.parse(h);
    } catch (_) {}

    try {
      const p = localStorage.getItem('ai_hub_custom_personas');
      if (p) customPersonas = JSON.parse(p);
    } catch (_) {}

    try {
      const s = localStorage.getItem('ai_hub_scratchpad_content');
      if (s) scratchpadNotes = s;
    } catch (_) {}

    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      accounts: accounts || [],
      settings: settings || {},
      promptHistory,
      customPersonas,
      scratchpadNotes
    };
  };

  const handleDownloadJSON = () => {
    const payload = gatherBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-workstation-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playNotificationSound('ready');
  };

  const handleDownloadMarkdownNotes = () => {
    let notes = '';
    try {
      notes = localStorage.getItem('ai_hub_scratchpad_content') || '# Rascunhos do AI Hub\n\nNenhuma nota gravada.';
    } catch (_) {
      notes = '# Rascunhos do AI Hub\n';
    }

    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-hub-scratchpad-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playNotificationSound('ready');
  };

  const handleCopyBackupJSON = () => {
    const payload = gatherBackupPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    playNotificationSound('broadcast');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.accounts && !data.version) {
          throw new Error('Arquivo de backup inválido ou incompatível.');
        }

        if (data.promptHistory) {
          localStorage.setItem('ai_hub_prompt_history', JSON.stringify(data.promptHistory));
        }
        if (data.customPersonas) {
          localStorage.setItem('ai_hub_custom_personas', JSON.stringify(data.customPersonas));
        }
        if (data.scratchpadNotes) {
          localStorage.setItem('ai_hub_scratchpad_content', data.scratchpadNotes);
        }

        if (onRestoreAll) {
          onRestoreAll(data);
        }

        setImportStatus({ success: true, message: 'Backup restaurado com sucesso!' });
        playNotificationSound('ready');
      } catch (err) {
        setImportStatus({ success: false, message: `Erro ao importar: ${err.message}` });
        playNotificationSound('limit');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Backup & Portabilidade Completa</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Zero Lock-in
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exporte ou migre todas as suas contas, personas, notas e prompts em 1 clique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          {importStatus && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
              }`}
            >
              <FileCheck className="w-4 h-4 shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="p-4 rounded-2xl bg-[#0b101e] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Exportar Tudo (Backup Completo)
              </span>
              <span className="text-xs text-zinc-400">Formato Universal JSON</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Gera um arquivo com suas {accounts?.length || 0} contas, personas de IA, notas do Scratchpad e biblioteca de prompts.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Backup JSON</span>
              </button>
              <button
                onClick={handleCopyBackupJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Dados JSON'}</span>
              </button>
            </div>
          </div>

          {/* Export Scratchpad Only */}
          <div className="p-4 rounded-2xl bg-[#0b101e] border border-white/10 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Exportar Bloco de Notas em Markdown (.md)
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exporta somente suas anotações e códigos salvos no formato Markdown limpo para usar no Obsidian, Notion ou VS Code.
            </p>
            <button
              onClick={handleDownloadMarkdownNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all cursor-pointer mt-1"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Baixar Notas (.md)</span>
            </button>
          </div>

          {/* Import / Restore */}
          <div className="p-4 rounded-2xl bg-[#0b101e] border border-white/10 space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
              Restaurar de Backup Anterior
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Selecione um arquivo `.json` de backup gerado anteriormente para restaurar tudo instantaneamente.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-sky-200 hover:text-white text-xs font-semibold border border-blue-500/40 transition-all cursor-pointer mt-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar Arquivo de Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Security badge */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Local no seu computador (Zero envio para servidores)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
