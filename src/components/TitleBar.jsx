import React, { useState, useEffect } from 'react';
import {
  Minus,
  Square,
  X,
  Search,
  Cpu,
  Sparkles,
  Pin,
  HelpCircle,
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react';

export function TitleBar({
  activeAccount,
  currentView,
  isMiniMode,
  isStealthMode,
  onToggleStealthMode,
  onToggleMiniMode,
  onOpenCommandPalette,
  onOpenHelp
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isMaximized) {
      window.electronAPI.isMaximized().then(setIsMaximized);
    }
    if (window.electronAPI?.onMaximizedChanged) {
      return window.electronAPI.onMaximizedChanged((val) => setIsMaximized(val));
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.close();
  };

  return (
    <header
      className="flex items-center justify-between h-11 px-4 bg-[#09090b] border-b border-white/[0.08] select-none text-sm text-zinc-300 z-50 shrink-0"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-white border border-white/10 shrink-0 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        </div>
        {!isMiniMode ? (
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-sm tracking-tight text-white">AI Hub</span>
            <span className="text-xs font-medium text-zinc-400">Studio</span>
          </div>
        ) : (
          <span className="font-semibold text-sm text-white truncate max-w-[160px] stealth-target">
            {activeAccount?.name || 'AI Hub'}
          </span>
        )}
      </div>

      {/* Center Search / Command Palette Trigger */}
      {!isMiniMode && (
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/15 transition-all cursor-pointer w-80 text-left shadow-sm group backdrop-blur-sm"
            title="Abrir Command Palette (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span className="text-xs truncate flex-1 text-zinc-400 group-hover:text-zinc-200">Buscar ou executar comando...</span>
            <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/[0.08] font-mono text-zinc-300 border border-white/10">Ctrl K</kbd>
          </button>
        </div>
      )}

      {/* Windows Controls & Productivity Actions */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Stealth / Camouflage Mode */}
        {!isMiniMode && (
          <button
            onClick={onToggleStealthMode}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
              isStealthMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'hover:bg-white/[0.08] text-zinc-300 hover:text-white'
            }`}
            title={isStealthMode ? "Desativar Modo Privacidade (Ctrl+Shift+H)" : "Ativar Modo Privacidade (Ctrl+Shift+H)"}
          >
            {isStealthMode ? <EyeOff className="w-4 h-4 text-amber-300" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Help / Shortcuts Button */}
        {!isMiniMode && (
          <button
            onClick={onOpenHelp}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Atalhos de Teclado & Ajuda (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Toggle Resvori Lateral Docker Button */}
        <button
          onClick={onToggleMiniMode}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer ${
            isMiniMode
              ? 'bg-zinc-700 text-white'
              : 'hover:bg-white/[0.08] text-zinc-300 hover:text-white'
          }`}
          title="Modo Docker Lateral Flutuante (Resvori) - Ctrl+M"
        >
          <Pin className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/[0.1] mx-1" />

        {/* Native Windows Controls */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-9 h-8 rounded-lg hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Minimizar"
        >
          <Minus className="w-4 h-4" />
        </button>
        {!isMiniMode && (
          <button
            onClick={handleMaximize}
            className="flex items-center justify-center w-9 h-8 rounded-lg hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-9 h-8 rounded-lg hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
