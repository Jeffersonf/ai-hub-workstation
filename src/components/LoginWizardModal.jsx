import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, ExternalLink, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function LoginWizardModal({ isOpen, onClose, accounts, onRefreshAccount }) {
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const activeAcc = accounts.find((a) => a.id === selectedAccId) || accounts[0];

  const handleClearSession = async () => {
    if (!activeAcc || !window.electronAPI?.clearAccountSession) return;
    setIsClearing(true);
    const res = await window.electronAPI.clearAccountSession(activeAcc.id);
    setIsClearing(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: `Sessão de ${activeAcc.name} limpa com sucesso! Faça login novamente.` });
      if (onRefreshAccount) onRefreshAccount(activeAcc.id);
    } else {
      setStatusMessage({ type: 'error', text: `Erro ao limpar sessão: ${res.error}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Assistente de Login Rápido & Autenticação</h2>
              <p className="text-xs text-slate-400">Gerencie e resolva logins das suas contas sem perder tempo</p>
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Account Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Selecione a Conta para Gerenciar:</label>
            <div className="flex flex-wrap gap-2">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccId(acc.id);
                    setStatusMessage(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    selectedAccId === acc.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <AIIcon type={acc.iconType || acc.type} className="w-3.5 h-3.5" />
                  <span>{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Account Auth Details */}
          {activeAcc && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white border border-white/10">
                    <AIIcon type={activeAcc.iconType || activeAcc.type} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeAcc.name}</h4>
                    <p className="text-xs text-zinc-400">{activeAcc.provider} · Partição: <span className="font-mono text-sky-400 text-xs">persist:{activeAcc.id}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sessão Isolada Ativa</span>
                </div>
              </div>

              {/* Login Tips Box */}
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs text-zinc-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Como fazer login nesta conta sem erro:</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300 text-xs">
                  <li><strong className="text-white">Login com Conta Google:</strong> O aplicativo utiliza o User-Agent oficial do Chrome para que o Google não bloqueie o login com erro de navegador não seguro.</li>
                  <li><strong className="text-white">Sessão Salva:</strong> Assim que você entrar pelo chat, o login fica gravado permanentemente para sempre.</li>
                  <li><strong className="text-white">Trocar de Usuário:</strong> Se você conectou no e-mail errado, use o botão "Limpar Sessão e Deslogar" abaixo.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleClearSession}
                  disabled={isClearing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isClearing ? 'Limpando...' : 'Deslogar / Limpar Cookies desta Conta'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Continuar no Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
