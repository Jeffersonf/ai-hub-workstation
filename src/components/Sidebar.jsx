import React, { useState } from 'react';
import {
  Plus,
  BarChart3,
  Columns2,
  BookOpen,
  Settings,
  Activity,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Calculator,
  UserCheck,
  Code2,
  Wand2,
  History,
  Database,
  Cpu,
  Sparkles
} from 'lucide-react';
import { AIIcon } from './AIIcon';

export function Sidebar({
  accounts,
  activeAccountId,
  currentView,
  recommendedAccountId,
  isCollapsed,
  isMiniMode,
  onToggleCollapse,
  onSelectAccount,
  onSelectView,
  onAddAccount,
  onOpenSettings,
  onOpenLoginWizard,
  onOpenPersonas,
  onOpenOptimizer,
  onOpenArtifacts,
  onOpenHistory,
  onOpenExport,
  onOpenOllama
}) {
  const [sidebarTab, setSidebarTab] = useState('accounts'); // 'accounts' | 'tools'

  const getPillColor = (p) => {
    if (p <= 15) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (p <= 35) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-blue-500/20 text-sky-300 border-blue-500/30';
  };

  // If in Mini Mode or collapsed, display comfortable icon sidebar
  if (isCollapsed || isMiniMode) {
    return (
      <aside className="w-16 h-full bg-[#09090b] border-r border-white/[0.08] flex flex-col items-center justify-between py-3 select-none shrink-0">
        <div className="flex flex-col items-center gap-3 w-full">
          {!isMiniMode && (
            <>
              <button
                onClick={onToggleCollapse}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Expandir barra lateral (Ctrl+B)"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              <div className="w-6 h-px bg-white/[0.08]" />
            </>
          )}

          {/* Studio Nativo Quick Button */}
          <button
            onClick={() => onSelectView('native-chat')}
            className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'native-chat'
                ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/20'
                : 'text-zinc-400 hover:bg-white/[0.08] hover:text-white'
            }`}
            title="Chat Nativo Studio (Gemini Grátis / Ollama Local)"
          >
            <Sparkles className="w-5 h-5 text-sky-400" />
          </button>

          <div className="w-6 h-px bg-white/[0.08]" />

          {/* Account Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {accounts.map((acc, index) => {
              const isActive = currentView === 'chat' && activeAccountId === acc.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/20'
                      : 'text-zinc-400 hover:bg-white/[0.08] hover:text-white'
                  }`}
                  title={`${acc.name} (${acc.quotaPercent}% cota - Ctrl+${index + 1})`}
                >
                  <AIIcon type={acc.iconType || acc.type} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Quick Tools */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onSelectView('scratchpad')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'scratchpad' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
            title="Bloco de Notas (Ctrl+J)"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectView('split')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              currentView === 'split' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:text-white'
            }`}
            title="Multi-Grid de IAs"
          >
            <Columns2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            title="Configurações & Contas"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-68 h-full bg-[#09090b] border-r border-white/[0.08] flex flex-col justify-between select-none shrink-0 transition-all duration-200">
      {/* Top Segmented Navigation: IAs vs Ferramentas */}
      <div className="p-3 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08] flex-1">
            <button
              onClick={() => setSidebarTab('accounts')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                sidebarTab === 'accounts'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              IAs ({accounts.length})
            </button>
            <button
              onClick={() => setSidebarTab('tools')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                sidebarTab === 'tools'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Recursos
            </button>
          </div>

          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
            title="Recolher barra lateral (Ctrl+B)"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: ACCOUNTS & DAILY WORKSPACE (Clean & Minimalist) */}
        {sidebarTab === 'accounts' && (
          <div className="space-y-3.5">
            {/* Studio Nativo Primary Card (Raycast/Linear Style) */}
            <button
              onClick={() => onSelectView('native-chat')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left group ${
                currentView === 'native-chat'
                  ? 'bg-zinc-800 text-white border border-white/20 shadow-md ring-1 ring-white/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-white/15 text-sky-400 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>Studio Nativo</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">API/Local</span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate">Gemini Grátis & Ollama</div>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            </button>

            {/* Section Divider */}
            <div className="flex items-center gap-2 px-1 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contas Web</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            {/* Account List */}
            <div className="space-y-1.5">
              {accounts.map((acc, index) => {
                const isActive = currentView === 'chat' && activeAccountId === acc.id;
                const isRecommended = recommendedAccountId === acc.id;

                return (
                  <button
                    key={acc.id}
                    onClick={() => onSelectAccount(acc.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group text-left ${
                      isActive
                        ? 'bg-zinc-800 text-white border border-white/20 shadow-sm ring-1 ring-white/10'
                        : 'hover:bg-zinc-900/80 text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 shrink-0">
                        <AIIcon type={acc.iconType || acc.type} className="w-4 h-4" />
                        {isRecommended && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium truncate group-hover:text-white flex items-center gap-1">
                          <span className="stealth-target">{acc.name}</span>
                        </div>
                        <div className="text-xs text-zinc-400 truncate stealth-target">{acc.provider}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border stealth-target ${getPillColor(
                          acc.quotaPercent
                        )}`}
                      >
                        {acc.quotaPercent}%
                      </span>
                      <span className="text-xs font-mono text-zinc-400">Ctrl+{index + 1}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Workspace Shortcuts */}
            <div className="pt-2 border-t border-white/[0.08] space-y-1">
              <span className="block px-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Produtividade
              </span>

              <button
                onClick={() => onSelectView('split')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'split'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Columns2 className="w-4 h-4 text-indigo-400" />
                <span>Multi-Grid Comparador</span>
              </button>

              <button
                onClick={() => onSelectView('scratchpad')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'scratchpad'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Bloco de Notas Rápido</span>
              </button>

              <button
                onClick={() => onSelectView('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Painel de Cotas & Ciclos</span>
              </button>
            </div>

            {/* Add Account Button */}
            <button
              onClick={onAddAccount}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/[0.08]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Conectar Nova Conta</span>
            </button>
          </div>
        )}

        {/* TAB 2: TOOLS & STUDIOS (Categorized & Out of the Way) */}
        {sidebarTab === 'tools' && (
          <div className="space-y-4">
            {/* Estúdios & Criação */}
            <div className="space-y-1">
              <span className="block px-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Estúdios de Criação
              </span>

              <button
                onClick={onOpenPersonas}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-600/10 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
              >
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Central de Personas</span>
              </button>

              <button
                onClick={onOpenOptimizer}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-violet-300 hover:text-white hover:bg-violet-600/10 transition-all cursor-pointer border border-transparent hover:border-violet-500/20"
              >
                <Wand2 className="w-4 h-4 text-violet-400" />
                <span>Otimizador de Prompts</span>
              </button>

              <button
                onClick={onOpenArtifacts}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-sky-300 hover:text-white hover:bg-sky-600/10 transition-all cursor-pointer border border-transparent hover:border-sky-500/20"
              >
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Laboratório de Artefatos</span>
              </button>

              <button
                onClick={onOpenOllama}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-emerald-300 hover:text-white hover:bg-emerald-600/10 transition-all cursor-pointer border border-transparent hover:border-emerald-500/20"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Ponte Ollama (IA Local)</span>
              </button>
            </div>

            {/* Utilitários & Métricas */}
            <div className="pt-2 border-t border-white/[0.08] space-y-1">
              <span className="block px-2 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Utilitários & Métricas
              </span>

              <button
                onClick={() => onSelectView('calculator')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'calculator'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de Tokens</span>
              </button>

              <button
                onClick={() => onSelectView('prompts')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'prompts'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-violet-400" />
                <span>Biblioteca de Prompts</span>
              </button>

              <button
                onClick={() => onSelectView('health')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentView === 'health'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Status dos Servidores</span>
              </button>

              <button
                onClick={onOpenHistory}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-sky-400" />
                <span>Histórico de Prompts</span>
              </button>

              <button
                onClick={onOpenExport}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Backup & Portabilidade</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Quick Auth & Settings (Minimal & Clean) */}
      <div className="p-3 border-t border-white/[0.08] bg-[#09090b] space-y-1 shrink-0">
        <button
          onClick={onOpenLoginWizard}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          <span>Assistente de Login</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
}
