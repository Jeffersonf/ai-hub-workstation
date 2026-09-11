import React, { useState } from 'react';
import { X, Columns2, Sparkles, ExternalLink } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function SplitScreenModal({ isOpen, onClose, accounts, onLaunchSplit }) {
  const [leftId, setLeftId] = useState(accounts[0]?.id);
  const [rightId, setRightId] = useState(accounts[1]?.id || accounts[0]?.id);

  if (!isOpen) return null;

  const leftAccount = accounts.find((a) => a.id === leftId);
  const rightAccount = accounts.find((a) => a.id === rightId);

  const handleLaunch = () => {
    if (!leftAccount || !rightAccount) return;
    onLaunchSplit(leftAccount, rightAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Comparação Lado a Lado (Split-Screen)</h2>
              <p className="text-xs text-slate-400">Abra duas IAs simultaneamente em tela dividida 50/50</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Area */}
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Left Account */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-sky-400">IA da Esquerda (50%)</label>
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 text-white text-xs border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.provider})
                  </option>
                ))}
              </select>

              {leftAccount && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white">
                    <AIIcon type={leftAccount.iconType || leftAccount.type} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{leftAccount.name}</div>
                    <div className="text-xs text-zinc-400 font-mono">{leftAccount.quotaPercent}% cota disponível</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Account */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-indigo-400">IA da Direita (50%)</label>
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 text-white text-xs border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.provider})
                  </option>
                ))}
              </select>

              {rightAccount && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-white">
                    <AIIcon type={rightAccount.iconType || rightAccount.type} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{rightAccount.name}</div>
                    <div className="text-xs text-zinc-400 font-mono">{rightAccount.quotaPercent}% cota disponível</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleLaunch}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Columns2 className="w-4 h-4" />
            <span>Abrir Modo Comparação</span>
          </button>
        </div>
      </div>
    </div>
  );
}
