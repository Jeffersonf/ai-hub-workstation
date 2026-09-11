import React, { useRef, useState } from 'react';
import { RotateCw, ArrowLeft, ArrowRight, ExternalLink, Minus, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function EmbeddedChatView({ account, onUpdateQuota, onOpenExternal }) {
  const webviewRef = useRef(null);
  const [zoomFactor, setZoomFactor] = useState(1.0);

  if (!account) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        Selecione uma conta na barra lateral para começar
      </div>
    );
  }

  const handleReload = () => {
    if (webviewRef.current) webviewRef.current.reload();
  };

  const handleGoBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) webviewRef.current.goBack();
  };

  const handleGoForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) webviewRef.current.goForward();
  };

  const handleZoom = (delta) => {
    const newZoom = Math.min(1.5, Math.max(0.7, zoomFactor + delta));
    setZoomFactor(newZoom);
    if (webviewRef.current) webviewRef.current.setZoomFactor(newZoom);
  };

  const percent = account.quotaPercent ?? 100;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0b0f19] overflow-hidden">
      {/* Navigation & Status Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1222] border-b border-white/10 select-none text-xs">
        {/* Left: Navigation and Account Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleGoBack}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Voltar página"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleGoForward}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Avançar página"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Recarregar"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-white">
              <AIIcon type={account.iconType || account.type} className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">{account.name}</span>
            <span className="text-zinc-400 text-xs">({account.provider})</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Sessão Salva
            </span>
          </div>
        </div>

        {/* Right: Quota Adjuster & External Browser */}
        <div className="flex items-center gap-3">
          {/* Quota Quick Actions */}
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-zinc-400">Cota:</span>
            <span className="font-mono font-bold text-sky-400">{percent}%</span>
            <button
              onClick={() => onUpdateQuota(account.id, Math.max(0, percent - 5))}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer text-xs"
              title="Registrar envio de prompts (-5%)"
            >
              -5%
            </button>
            <button
              onClick={() => onUpdateQuota(account.id, 100)}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer text-xs"
              title="Resetar para 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl text-zinc-300 text-xs">
            <button onClick={() => handleZoom(-0.1)} className="hover:text-white px-1.5 cursor-pointer font-bold text-sm">-</button>
            <span className="font-mono text-xs font-semibold">{Math.round(zoomFactor * 100)}%</span>
            <button onClick={() => handleZoom(0.1)} className="hover:text-white px-1.5 cursor-pointer font-bold text-sm">+</button>
          </div>

          <button
            onClick={() => onOpenExternal(account.url)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-colors border border-white/10 cursor-pointer"
            title="Abrir no Chrome / Edge"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Navegador</span>
          </button>
        </div>
      </div>

      {/* Embedded WebView with Isolated Persistent Partition */}
      <div className="flex-1 w-full h-full relative bg-black">
        <webview
          key={account.id}
          ref={webviewRef}
          src={account.url || 'https://chatgpt.com'}
          partition={`persist:${account.id}`}
          className="w-full h-full border-none"
          allowpopups="true"
        />
      </div>
    </div>
  );
}
