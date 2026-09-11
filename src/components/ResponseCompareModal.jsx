import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Columns2, ThumbsUp, FileText, ArrowRight } from 'lucide-react';
import { AIIcon } from './AIIcon';
import { playNotificationSound } from '../utils/audio';

export function ResponseCompareModal({
  isOpen,
  onClose,
  accounts,
  initialSlotA,
  initialSlotB,
  initialTextA = '',
  initialTextB = ''
}) {
  const [accountAId, setAccountAId] = useState(initialSlotA || accounts[0]?.id || '');
  const [accountBId, setAccountBId] = useState(initialSlotB || accounts[1]?.id || '');
  const [textA, setTextA] = useState(initialTextA);
  const [textB, setTextB] = useState(initialTextB);
  const [copiedSlot, setCopiedSlot] = useState(null);
  const [winnerSlot, setWinnerSlot] = useState(null);

  if (!isOpen) return null;

  const accA = accounts.find((a) => a.id === accountAId) || accounts[0];
  const accB = accounts.find((a) => a.id === accountBId) || accounts[1];

  const getStats = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const estTokens = Math.max(0, Math.round(chars / 3.2));
    const readingTimeSec = Math.max(1, Math.round((words / 200) * 60));
    return { chars, words, estTokens, readingTimeSec };
  };

  const statsA = getStats(textA);
  const statsB = getStats(textB);

  const handleCopy = (slot, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSlot(slot);
    playNotificationSound('broadcast');
    setTimeout(() => setCopiedSlot(null), 2000);
  };

  const handleCopyMerged = () => {
    const merged = `### Resposta de ${accA?.name || 'IA A'}:\n${textA}\n\n---\n\n### Resposta de ${accB?.name || 'IA B'}:\n${textB}`;
    navigator.clipboard.writeText(merged);
    playNotificationSound('ready');
    setCopiedSlot('merged');
    setTimeout(() => setCopiedSlot(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Laboratório de Comparação de Respostas
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  Side-by-Side Diff
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compare a qualidade, concisão e tokens das respostas geradas pelas suas IAs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMerged}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              title="Copiar ambas as respostas formatadas em Markdown"
            >
              {copiedSlot === 'merged' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Ambas (A + B)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Content */}
        <div className="flex-1 grid grid-cols-2 gap-4 py-4 overflow-hidden divide-x divide-white/5">
          {/* Column A */}
          <div className="flex flex-col h-full space-y-3 pr-2">
            {/* Column A Header */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0b0f1e] border border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-white/10">
                  <AIIcon type={accA?.iconType || accA?.type} className="w-4 h-4" />
                </div>
                <select
                  value={accA?.id}
                  onChange={(e) => setAccountAId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.name} ({a.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWinnerSlot('A')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    winnerSlot === 'A'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                  title="Marcar como resposta vencedora"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{winnerSlot === 'A' ? 'Melhor Resposta' : 'Vencedora'}</span>
                </button>

                <button
                  onClick={() => handleCopy('A', textA)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copiar resposta A"
                >
                  {copiedSlot === 'A' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Metrics A */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-zinc-300">
              <span>Palavras: <strong className="text-white">{statsA.words}</strong></span>
              <span>Caracteres: <strong className="text-white">{statsA.chars}</strong></span>
              <span>Tokens: <strong className="text-sky-400">~{statsA.estTokens}</strong></span>
              <span>Leitura: <strong className="text-white">{statsA.readingTimeSec}s</strong></span>
            </div>

            {/* Textarea A */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-[#080c18] border border-white/10 p-3.5 shadow-inner flex flex-col">
              <textarea
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                placeholder="Cole ou insira a resposta da IA A aqui para comparar..."
                className="w-full h-full bg-transparent text-zinc-200 text-sm font-mono leading-relaxed outline-none resize-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Column B */}
          <div className="flex flex-col h-full space-y-3 pl-2">
            {/* Column B Header */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0b0f1e] border border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-white/10">
                  <AIIcon type={accB?.iconType || accB?.type} className="w-4 h-4" />
                </div>
                <select
                  value={accB?.id}
                  onChange={(e) => setAccountBId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.name} ({a.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWinnerSlot('B')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    winnerSlot === 'B'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                  title="Marcar como resposta vencedora"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{winnerSlot === 'B' ? 'Melhor Resposta' : 'Vencedora'}</span>
                </button>

                <button
                  onClick={() => handleCopy('B', textB)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copiar resposta B"
                >
                  {copiedSlot === 'B' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Metrics B */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-zinc-300">
              <span>Palavras: <strong className="text-white">{statsB.words}</strong></span>
              <span>Caracteres: <strong className="text-white">{statsB.chars}</strong></span>
              <span>Tokens: <strong className="text-sky-400">~{statsB.estTokens}</strong></span>
              <span>Leitura: <strong className="text-white">{statsB.readingTimeSec}s</strong></span>
            </div>

            {/* Textarea B */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-[#080c18] border border-white/10 p-3.5 shadow-inner flex flex-col">
              <textarea
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                placeholder="Cole ou insira a resposta da IA B aqui para comparar..."
                className="w-full h-full bg-transparent text-zinc-200 text-sm font-mono leading-relaxed outline-none resize-none placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
