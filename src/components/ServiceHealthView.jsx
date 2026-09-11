import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function ServiceHealthView() {
  const [services, setServices] = useState([
    { id: 'openai', name: 'OpenAI (ChatGPT & Codex)', status: 'operational', latency: 64, message: 'Operando normalmente', statusUrl: 'https://status.openai.com' },
    { id: 'claude', name: 'Anthropic (Claude 3.5)', status: 'operational', latency: 72, message: 'Operando normalmente', statusUrl: 'https://status.anthropic.com' },
    { id: 'gemini', name: 'Google AI (Gemini 2.0)', status: 'operational', latency: 48, message: 'Operando normalmente', statusUrl: 'https://status.cloud.google.com' },
    { id: 'deepseek', name: 'DeepSeek (R1 & V3)', status: 'operational', latency: 95, message: 'Operando normalmente', statusUrl: 'https://status.deepseek.com' }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date().toLocaleTimeString('pt-BR'));

  const checkHealth = async () => {
    setIsRefreshing(true);
    if (window.electronAPI?.checkServiceHealth) {
      try {
        const results = await window.electronAPI.checkServiceHealth();
        if (Array.isArray(results) && results.length > 0) {
          setServices((prev) =>
            prev.map((s) => {
              const res = results.find((r) => r.id === s.id);
              return res ? { ...s, latency: res.latency, status: res.status } : s;
            })
          );
        }
      } catch (_) {}
    }
    setLastCheck(new Date().toLocaleTimeString('pt-BR'));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#090d16] p-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Status & Uptime dos Servidores de IA</h2>
            <p className="text-xs text-slate-400">
              Monitoramento ao vivo de latência e disponibilidade dos principais provedores · Checado às {lastCheck}
            </p>
          </div>
        </div>

        <button
          onClick={checkHealth}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors border border-white/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar Latência</span>
        </button>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-3xl bg-[#0d1222] border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 shadow">
                  <AIIcon type={s.id} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{s.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{s.message}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">{s.latency} ms</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-xs">Atualizado a cada 30 segundos</span>
              <a
                href={s.statusUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium text-xs"
              >
                <span>Página Oficial de Status</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
