import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, RotateCcw, ArrowRight, ShieldCheck, Timer, Zap, Play, CheckCircle2 } from 'lucide-react';
import { AIIcon } from './AIIcon';
import { playNotificationSound } from '../utils/audio';

export function QuotaDashboardView({
  accounts,
  recommendedAccountId,
  onOpenAccount,
  onUpdateQuota,
  onOpenSettings
}) {
  const [promptCount, setPromptCount] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_quota_prompt_count');
      return saved ? parseInt(saved, 10) : 18;
    } catch {
      return 18;
    }
  });

  // Track active cooldown end timestamps per account: { [accountId]: timestampMs }
  const [cooldowns, setCooldowns] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_quota_active_cooldowns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Second-by-second ticker for live cooldowns
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      // Check if any cooldown has finished
      Object.entries(cooldowns).forEach(([accId, endMs]) => {
        if (now >= endMs) {
          // Finished!
          const targetAcc = accounts.find((a) => a.id === accId);
          onUpdateQuota(accId, 100);
          playNotificationSound('ready');

          if (window.electronAPI) {
            window.electronAPI.showNotification(
              '🎉 Cota Restabelecida!',
              `A cota da conta "${targetAcc ? targetAcc.name : accId}" foi renovada e está pronta para uso.`
            );
          }

          // Remove from active cooldowns
          setCooldowns((prev) => {
            const next = { ...prev };
            delete next[accId];
            try { localStorage.setItem('ai_quota_active_cooldowns', JSON.stringify(next)); } catch (_) {}
            return next;
          });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns, accounts, onUpdateQuota]);

  const avgQuota = Math.round(
    accounts.reduce((acc, a) => acc + (a.quotaPercent || 0), 0) / (accounts.length || 1)
  );

  const recommendedAccount = accounts.find((a) => a.id === recommendedAccountId);

  const handleStartCooldown = (accountId, hours = 3) => {
    const endMs = Date.now() + hours * 60 * 60 * 1000;
    const nextCooldowns = { ...cooldowns, [accountId]: endMs };
    setCooldowns(nextCooldowns);
    try { localStorage.setItem('ai_quota_active_cooldowns', JSON.stringify(nextCooldowns)); } catch (_) {}

    onUpdateQuota(accountId, 0);
    playNotificationSound('limit');

    if (window.electronAPI) {
      window.electronAPI.showNotification(
        'Cooldown Iniciado',
        `Cronômetro regressivo de ${hours}h iniciado. Você será notificado quando a cota estiver pronta!`
      );
    }
  };

  const handleCancelCooldown = (accountId) => {
    const next = { ...cooldowns };
    delete next[accountId];
    setCooldowns(next);
    try { localStorage.setItem('ai_quota_active_cooldowns', JSON.stringify(next)); } catch (_) {}
    onUpdateQuota(accountId, 100);
  };

  const handleIncrementPrompt = () => {
    const next = promptCount + 1;
    setPromptCount(next);
    try { localStorage.setItem('ai_quota_prompt_count', next.toString()); } catch (_) {}
  };

  const formatRemainingTime = (endMs) => {
    const diff = Math.max(0, endMs - currentTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#090d16] p-6 space-y-6 text-slate-100">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Contas Monitoradas</span>
            <div className="text-2xl font-bold text-white mt-1">{accounts.length} Contas</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-sky-400 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Média de Cota Geral</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">{avgQuota}%</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
            <span className="text-sm font-bold font-mono">%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Prompts Hoje</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{promptCount} enviadas</div>
          </div>
          <button
            onClick={handleIncrementPrompt}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 cursor-pointer active:scale-95"
            title="+1 Prompt enviado"
          >
            +1 Prompt
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> IA Recomendada Agora
            </span>
            <div className="text-sm font-bold text-white mt-1 truncate max-w-[140px]">
              {recommendedAccount ? recommendedAccount.name : 'Nenhuma'}
            </div>
          </div>
          {recommendedAccount && (
            <button
              onClick={() => onOpenAccount(recommendedAccount.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
            >
              Usar
            </button>
          )}
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Status e Cronômetro de Limites em Tempo Real
          </h3>
          <button
            onClick={onOpenSettings}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            Gerenciar Contas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {accounts.map((acc) => {
            const isRecommended = recommendedAccountId === acc.id;
            const percent = acc.quotaPercent ?? 100;
            const cooldownEndMs = cooldowns[acc.id];
            const isCoolingDown = cooldownEndMs && cooldownEndMs > currentTime;

            return (
              <div
                key={acc.id}
                className={`p-5 rounded-3xl bg-[#0e1324] border transition-all space-y-4 shadow-lg group ${
                  isCoolingDown ? 'border-amber-500/40 bg-[#121628]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 border border-white/10 shadow">
                      <AIIcon type={acc.iconType || acc.type} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {acc.name}
                        {isRecommended && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                            Sugerida
                          </span>
                        )}
                        {isCoolingDown && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 animate-pulse">
                            Recuperando
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{acc.provider}</p>
                    </div>
                  </div>

                  {isCoolingDown ? (
                    <div className="text-right font-mono">
                      <span className="text-base font-bold text-amber-400">
                        {formatRemainingTime(cooldownEndMs)}
                      </span>
                      <p className="text-xs text-zinc-400">Tempo Restante</p>
                    </div>
                  ) : (
                    <span className="text-lg font-bold font-mono text-sky-400">{percent}%</span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-300 font-medium">
                    <span>{acc.periodLabel || 'Ciclo de Uso'}</span>
                    <span>{isCoolingDown ? 'Em Cooldown' : `${percent}% disponível`}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCoolingDown
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
                          : 'bg-gradient-to-r from-sky-400 to-blue-600'
                      }`}
                      style={{ width: isCoolingDown ? '100%' : `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Renewal & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ciclo padrão: {acc.renewalHours || 3}h</span>
                  </div>

                  {/* Cooldown and Usage Buttons */}
                  <div className="flex items-center gap-2">
                    {isCoolingDown ? (
                      <button
                        onClick={() => handleCancelCooldown(acc.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer"
                        title="Cancelar cooldown e restaurar para 100%"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartCooldown(acc.id, acc.renewalHours || 3)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer active:scale-95"
                        title="Bateu no limite de mensagens? Inicia o cronômetro de 3h/5h e avisa ao terminar"
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>Bati no Limite</span>
                      </button>
                    )}

                    <button
                      onClick={() => onUpdateQuota(acc.id, 100)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                      title="Resetar para 100%"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onOpenAccount(acc.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer shadow active:scale-95"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
