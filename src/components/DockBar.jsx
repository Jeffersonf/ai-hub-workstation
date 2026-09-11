import React from 'react';
import { Settings, GripVertical, Columns2, BookOpen, Maximize2 } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

export function DockBar({
  accounts,
  selectedAccountId,
  recommendedAccountId,
  onSelectAccount,
  onOpenSettings,
  onOpenPrompts,
  onOpenSplit,
  onMinimize,
  onClose,
  onRestoreWorkstation
}) {
  return (
    <div className="relative flex flex-col items-center select-none py-2 px-1">
      {/* Draggable header & window controls */}
      <div
        className="flex items-center justify-between w-full px-2 mb-2 cursor-grab active:cursor-grabbing opacity-80 hover:opacity-100 transition-opacity"
        style={{ WebkitAppRegion: 'drag' }}
        title="Arraste para mover o Docker na sua tela"
      >
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-amber-500/90 hover:bg-amber-400 transition-all cursor-pointer shadow-sm"
            title="Minimizar"
          />
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-rose-500/90 hover:bg-rose-400 transition-all cursor-pointer shadow-sm"
            title="Fechar Docker"
          />
        </div>
        <GripVertical className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" />
      </div>

      {/* Dock Body - Glass Pill Background matching Resvori */}
      <div
        className="flex flex-col items-center gap-3.5 py-4 pl-3 pr-2.5 rounded-l-[32px] border-y border-l border-white/[0.14] border-r-0 shadow-2xl transition-all"
        style={{
          WebkitAppRegion: 'no-drag',
          background: 'linear-gradient(180deg, rgba(13, 19, 38, 0.95) 0%, rgba(8, 11, 23, 0.98) 100%)',
          boxShadow: '-15px 0 45px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.18)'
        }}
      >
        {/* Account Rings */}
        <div className="flex flex-col items-center gap-3">
          {accounts.map((acc) => {
            const isSelected = selectedAccountId === acc.id;
            const isRecommended = recommendedAccountId === acc.id;

            return (
              <ProgressRing
                key={acc.id}
                account={acc}
                isSelected={isSelected}
                isRecommended={isRecommended}
                onClick={() => onSelectAccount(isSelected ? null : acc.id)}
              />
            );
          })}
        </div>

        {/* Quick Tools Divider */}
        <div className="w-8 h-px bg-white/15 my-0.5" />

        {/* Quick Action Tools */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Restore Full Workstation Button */}
          <button
            onClick={onRestoreWorkstation}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 hover:bg-blue-600 text-sky-300 hover:text-white transition-all duration-200 cursor-pointer border border-blue-500/30 hover:border-blue-400 shadow-sm"
            title="Abrir Workstation Completa (Ctrl + M)"
          >
            <Maximize2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Split Screen Comparator */}
          <button
            onClick={onOpenSplit}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-indigo-600/30 text-zinc-300 hover:text-indigo-300 transition-all duration-200 cursor-pointer border border-white/10 hover:border-indigo-500/30 shadow-sm"
            title="Modo Comparação (Split-Screen 50/50)"
          >
            <Columns2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Prompt Library */}
          <button
            onClick={onOpenPrompts}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-sky-600/30 text-zinc-300 hover:text-sky-300 transition-all duration-200 cursor-pointer border border-white/10 hover:border-sky-500/30 shadow-sm"
            title="Biblioteca de Prompts & Comandos"
          >
            <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20 shadow-sm"
            title="Gerenciar Contas & Configurações"
          >
            <Settings className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90 text-zinc-300 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
