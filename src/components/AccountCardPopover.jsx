import React from 'react';
import { X, ExternalLink, Clock, Minus, RotateCcw, Edit3, Sparkles } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function AccountCardPopover({
  account,
  isRecommended,
  onClose,
  onOpenUrl,
  onUpdateQuota,
  onEdit
}) {
  if (!account) return null;

  const percent = Math.min(100, Math.max(0, account.quotaPercent ?? 0));

  const getRenewalString = () => {
    if (account.renewalDays > 0) {
      return `Renova em ${account.renewalDays} d ${account.renewalHours || 0} h`;
    }
    if (account.renewalHours > 0) {
      return `Renova em ${account.renewalHours} h`;
    }
    if (account.renewalTotalMinutes > 0) {
      const h = Math.floor(account.renewalTotalMinutes / 60);
      const m = account.renewalTotalMinutes % 60;
      return h > 0 ? `Renova em ${h} h ${m} min` : `Renova em ${m} min`;
    }
    return 'Cota renovada agora';
  };

  const getBarColor = (p) => {
    if (p <= 10) return 'from-rose-500 via-red-500 to-amber-500 shadow-rose-500/50';
    if (p <= 30) return 'from-amber-500 via-orange-500 to-yellow-400 shadow-amber-500/50';
    return 'from-sky-400 via-blue-500 to-indigo-600 shadow-blue-500/50';
  };

  const getTextColor = (p) => {
    if (p <= 10) return 'text-rose-400';
    if (p <= 30) return 'text-amber-400';
    return 'text-sky-300';
  };

  return (
    <div
      className="relative w-[324px] rounded-[28px] p-5 text-slate-100 shadow-2xl transition-all duration-200"
      style={{
        background: 'linear-gradient(145deg, rgba(16, 23, 44, 0.96) 0%, rgba(8, 12, 25, 0.98) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
      }}
    >
      {/* Resvori speech bubble arrow pointing directly to the dock ring */}
      <div
        className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-l-[10px] border-l-[#10172c] drop-shadow-md pointer-events-none"
      />
      {/* Recommended Banner */}
      {isRecommended && (
        <div className="mb-3.5 flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>IA Recomendada para usar agora</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-lg border border-white/10">
            <AIIcon type={account.iconType || account.type} className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-snug text-white">
              {account.name}
            </h3>
            <p className="text-xs font-medium text-slate-400">{account.provider || 'OpenAI · Codex'}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Fechar card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quota & Progress Bar (matching screenshot layout) */}
      <div className="mt-5 space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-slate-300">{account.periodLabel || 'Semana'}</span>
          <span className={`font-bold ${getTextColor(percent)} text-sm`}>
            {percent}% disponível
          </span>
        </div>

        {/* Progress Bar with neon glow */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950/80 p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percent)} shadow-sm transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Renewal Countdown */}
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
        <Clock className="w-4 h-4 text-sky-400" />
        <span>{getRenewalString()}</span>
      </div>

      {/* Verification footer */}
      <div className="mt-2.5 text-xs font-medium text-zinc-400 px-1">
        Verificado às {account.lastChecked || 'Agora'} · a cada {account.checkIntervalSec || 60} s
      </div>

      {/* Divider */}
      <div className="my-3.5 border-t border-white/10" />

      {/* Quick Usage Adjusters */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <button
          onClick={() => onUpdateQuota(account.id, Math.max(0, percent - 5))}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer border border-white/5"
          title="Diminuir 5% da cota ao enviar prompts"
        >
          <Minus className="w-3.5 h-3.5" /> -5%
        </button>
        <button
          onClick={() => onUpdateQuota(account.id, 100)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-200 transition-colors cursor-pointer border border-white/5"
          title="Resetar cota para 100%"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset 100%
        </button>
        <button
          onClick={() => onEdit(account)}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200 transition-colors cursor-pointer border border-white/5"
          title="Editar dados desta conta"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons: Dedicated Isolated Session & Browser Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAccountWindow ? onOpenAccountWindow(account) : onOpenUrl(account.url)}
          className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/25 group"
          title="Abre uma janela independente que mantém o login desta conta salvo para sempre!"
        >
          <span>Abrir Conta (Login Salvo)</span>
          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        <button
          onClick={() => onOpenUrl(account.url)}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title="Abrir no seu navegador padrão (Chrome/Edge)"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
