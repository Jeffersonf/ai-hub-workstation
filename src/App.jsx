import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { KeepAliveWebviews } from './components/KeepAliveWebviews';
import { QuotaDashboardView } from './components/QuotaDashboardView';
import { MultiGridView } from './components/MultiGridView';
import { ServiceHealthView } from './components/ServiceHealthView';
import { ScratchpadView } from './components/ScratchpadView';
import { TokenCalculatorView } from './components/TokenCalculatorView';
import { AccountManagerModal } from './components/AccountManagerModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { CommandPalette } from './components/CommandPalette';
import { LoginWizardModal } from './components/LoginWizardModal';
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal';
import { ArtifactPreviewModal } from './components/ArtifactPreviewModal';
import { PersonaStudioModal } from './components/PersonaStudioModal';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { PromptOptimizerModal } from './components/PromptOptimizerModal';
import { WorkspaceExportModal } from './components/WorkspaceExportModal';
import { OllamaBridgeModal } from './components/OllamaBridgeModal';
import { NativeChatStudio } from './components/NativeChatStudio';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Minus,
  Plus,
  RotateCcw,
  MessageSquarePlus,
  Copy,
  Check,
  AlertTriangle,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { AIIcon } from './components/AIIcon';
import { playNotificationSound } from './utils/audio';

const fallbackAccounts = [
  {
    id: 'acc-1',
    name: 'ChatGPT Principal',
    provider: 'OpenAI · GPT-4o / o3',
    type: 'openai',
    url: 'https://chatgpt.com',
    quotaPeriod: '3h',
    periodLabel: 'Ciclo 3h',
    quotaPercent: 85,
    renewalDays: 0,
    renewalHours: 2,
    renewalTotalMinutes: 120,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    iconType: 'openai'
  },
  {
    id: 'acc-2',
    name: 'Claude Pro',
    provider: 'Anthropic · Claude 3.5',
    type: 'claude',
    url: 'https://claude.ai',
    quotaPeriod: '5h',
    periodLabel: 'Ciclo 5h',
    quotaPercent: 78,
    renewalDays: 0,
    renewalHours: 3,
    renewalTotalMinutes: 210,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    iconType: 'claude'
  },
  {
    id: 'acc-3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek · R1 / V3',
    type: 'deepseek',
    url: 'https://chat.deepseek.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    quotaPercent: 95,
    renewalDays: 0,
    renewalHours: 20,
    renewalTotalMinutes: 1200,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    iconType: 'deepseek'
  },
  {
    id: 'acc-4',
    name: 'Google Gemini',
    provider: 'Google · Gemini 2.0',
    type: 'gemini',
    url: 'https://gemini.google.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    quotaPercent: 90,
    renewalDays: 0,
    renewalHours: 18,
    renewalTotalMinutes: 1080,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    iconType: 'gemini'
  }
];

const fallbackSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  autoSuggest: true,
  openAtLogin: false,
  soundEnabled: true
};

export default function App() {
  const [accounts, setAccounts] = useState(fallbackAccounts);
  const [settings, setSettings] = useState(fallbackSettings);
  const [activeAccountId, setActiveAccountId] = useState(fallbackAccounts[0].id);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' | 'split' | 'dashboard' | 'scratchpad' | 'calculator' | 'prompts' | 'health'
  
  // Modals and UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLoginWizardOpen, setIsLoginWizardOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isOllamaOpen, setIsOllamaOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [optimizerInitialPrompt, setOptimizerInitialPrompt] = useState('');
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isResponseCopied, setIsResponseCopied] = useState(false);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineRestored, setShowOnlineRestored] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineRestored(true);
      if (settings?.soundEnabled !== false) playNotificationSound('ready');
      setTimeout(() => setShowOnlineRestored(false), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      if (settings?.soundEnabled !== false) playNotificationSound('limit');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings]);

  // Imperative ref to KeepAlive webviews
  const keepAliveRef = useRef(null);

  // Load from Electron on startup
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAccounts().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
          setActiveAccountId(data[0].id);
        }
      });
      window.electronAPI.getSettings().then((data) => {
        if (data) setSettings(data);
      });
      window.electronAPI.isMiniMode().then((val) => {
        if (typeof val === 'boolean') setIsMiniMode(val);
      });
      if (window.electronAPI.onMiniModeChanged) {
        window.electronAPI.onMiniModeChanged((val) => setIsMiniMode(val));
      }
      if (window.electronAPI.onSwitchAccount) {
        window.electronAPI.onSwitchAccount((id) => {
          setActiveAccountId(id);
          setCurrentView('chat');
        });
      }
    }
  }, []);

  // Browser navigation actions
  const handleGoBack = () => keepAliveRef.current?.goBack(activeAccountId);
  const handleGoForward = () => keepAliveRef.current?.goForward(activeAccountId);
  const handleReload = () => keepAliveRef.current?.reload(activeAccountId);
  const handleNewChat = () => {
    keepAliveRef.current?.newChat(activeAccountId);
    playNotificationSound('broadcast');
  };

  const handleCopyLastResponse = async () => {
    if (keepAliveRef.current?.copyLastResponse) {
      const text = await keepAliveRef.current.copyLastResponse(activeAccountId);
      if (text && text.trim()) {
        navigator.clipboard.writeText(text);
        setIsResponseCopied(true);
        playNotificationSound('ready');
        setTimeout(() => setIsResponseCopied(false), 2000);
        if (window.electronAPI && settings?.notificationsEnabled !== false) {
          window.electronAPI.showNotification('Resposta Copiada!', 'A última resposta da IA foi copiada para a Área de Transferência.');
        }
      } else {
        alert('Nenhuma resposta recente identificada na conversa.');
      }
    }
  };

  const handleZoomIn = () => {
    const next = keepAliveRef.current?.zoomIn(activeAccountId);
    if (next) setZoomLevel(Math.round(next * 100));
  };
  const handleZoomOut = () => {
    const next = keepAliveRef.current?.zoomOut(activeAccountId);
    if (next) setZoomLevel(Math.round(next * 100));
  };
  const handleResetZoom = () => {
    keepAliveRef.current?.resetZoom(activeAccountId);
    setZoomLevel(100);
  };

  const handleToggleMiniMode = async () => {
    if (window.electronAPI?.toggleMiniMode) {
      const next = await window.electronAPI.toggleMiniMode();
      setIsMiniMode(next);
      if (next) {
        setCurrentView('chat'); // Always prioritize chat in mini mode
      }
    }
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;

      // Ctrl + K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      // Ctrl + B -> Toggle Sidebar
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
      // Ctrl + M -> Toggle Mini PIP Mode
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMiniMode();
      }
      // Ctrl + N -> New Chat
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      // Ctrl + Shift + C -> Copy Last Response
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyLastResponse();
      }
      // Ctrl + J -> Scratchpad
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCurrentView('scratchpad');
      }
      // Ctrl + Shift + A -> Artifact Studio Sandbox
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsArtifactOpen((prev) => !prev);
      }
      // Ctrl + Shift + P -> Persona Studio
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPersonaOpen((prev) => !prev);
      }
      // Ctrl + Shift + O -> Prompt Optimizer
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsOptimizerOpen((prev) => !prev);
      }
      // Ctrl + Shift + H -> Stealth / Privacy Mode Toggle
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsStealthMode((prev) => !prev);
        playNotificationSound('broadcast');
      }
      // Ctrl + H -> Prompt History
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryOpen((prev) => !prev);
      }
      // Ctrl + Shift + R -> Reload Active Webview
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReload();
      }
      // Ctrl + = or Ctrl + + -> Zoom In
      else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      }
      // Ctrl + - -> Zoom Out
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      // Ctrl + 0 -> Reset Zoom
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
      // ? -> Shortcuts Help Modal (only when not typing in input)
      else if (e.key === '?' && !isInput && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
      // Ctrl + 1..9 -> Quick Account Switch
      else if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= accounts.length) {
          e.preventDefault();
          setActiveAccountId(accounts[num - 1].id);
          setCurrentView('chat');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accounts, activeAccountId]);

  // Periodic ticker for renewal countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = new Date().toLocaleTimeString('pt-BR');
      setAccounts((prev) => {
        let changed = false;
        const updated = prev.map((acc) => {
          let mins = acc.renewalTotalMinutes ?? 60;
          let percent = acc.quotaPercent ?? 100;

          if (mins > 0) {
            mins -= 1;
            changed = true;
          } else {
            mins = acc.quotaPeriod === 'weekly' ? 7 * 24 * 60 : 3 * 60;
            percent = 100;
            changed = true;
          }

          const renewalDays = Math.floor(mins / (24 * 60));
          const renewalHours = Math.floor((mins % (24 * 60)) / 60);

          return {
            ...acc,
            lastChecked: nowTime,
            renewalTotalMinutes: mins,
            renewalDays,
            renewalHours,
            quotaPercent: percent
          };
        });

        if (changed && window.electronAPI) {
          window.electronAPI.saveAccounts(updated);
        }
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSaveAccounts = (updated) => {
    setAccounts(updated);
    if (window.electronAPI) {
      window.electronAPI.saveAccounts(updated);
      window.electronAPI.updateTrayAccounts?.(updated);
    }
    if (!updated.some((a) => a.id === activeAccountId) && updated.length > 0) {
      setActiveAccountId(updated[0].id);
    }
  };

  const handleUpdateQuota = (id, newPercent) => {
    const updated = accounts.map((a) => (a.id === id ? { ...a, quotaPercent: newPercent } : a));
    handleSaveAccounts(updated);
  };

  const handleOpenExternal = (url) => {
    if (window.electronAPI) window.electronAPI.openExternal(url);
    else window.open(url, '_blank');
  };

  const handleRateLimitDetected = (accId) => {
    const acc = accounts.find((a) => a.id === accId);
    if (settings?.soundEnabled !== false) playNotificationSound('limit');
    if (window.electronAPI && settings?.notificationsEnabled !== false) {
      window.electronAPI.showNotification(
        '⚠️ Limite de Uso Detectado!',
        `Aviso de limite detectado em "${acc ? acc.name : accId}". Inicie o cooldown ou alterne para outra IA.`
      );
    }
  };

  const handleInjectIntoActiveChat = (text) => {
    setCurrentView('chat');
    // Inject into active webview
    const script = `
      (function() {
        const text = ${JSON.stringify(text)};
        const el = document.querySelector('#prompt-textarea') || 
                   document.querySelector('div[contenteditable="true"]') || 
                   document.querySelector('textarea') || 
                   document.querySelector('[role="textbox"]');
        if (el) {
          el.focus();
          if (el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'input') {
            el.value = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (el.isContentEditable) {
            el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })();
    `;
    const wv = document.querySelector(`webview[partition="persist:${activeAccountId}"]`);
    if (wv && typeof wv.executeJavaScript === 'function') {
      try { wv.executeJavaScript(script).catch(() => {}); } catch (_) {}
    }
  };

  const handleSendScratchpadToChat = (text) => {
    handleInjectIntoActiveChat(text);
  };

  const handleInjectPersona = (persona) => {
    const fullPrompt = `[INSTRUÇÃO DE SISTEMA / PERSONA: ${persona.title} (${persona.role})]\n${persona.prompt}\n\n[MINHA SOLICITAÇÃO]:\n`;
    handleInjectIntoActiveChat(fullPrompt);
    playNotificationSound('ready');
  };

  const handleSendToMultiGrid = (text) => {
    setCurrentView('split');
    navigator.clipboard.writeText(text);
    playNotificationSound('ready');
    if (window.electronAPI && settings?.notificationsEnabled !== false) {
      window.electronAPI.showNotification(
        'Prompt Enviado para Multi-Grid!',
        'O prompt estruturado foi copiado. Pressione Enviar ou Cole para comparar todas as IAs.'
      );
    }
  };

  const handleRestoreAll = (backupData) => {
    if (backupData.accounts && Array.isArray(backupData.accounts)) {
      handleSaveAccounts(backupData.accounts);
    }
    if (backupData.settings) {
      setSettings(backupData.settings);
      if (window.electronAPI) window.electronAPI.saveSettings(backupData.settings);
    }
  };

  // Smart suggestion: best available account
  const recommendedAccountId = useMemo(() => {
    if (accounts.length === 0) return null;
    const candidates = accounts.filter((a) => (a.quotaPercent ?? 0) >= 20);
    if (candidates.length === 0) {
      const sorted = [...accounts].sort((a, b) => (b.quotaPercent ?? 0) - (a.quotaPercent ?? 0));
      return sorted[0]?.id;
    }
    const sorted = [...candidates].sort((a, b) => {
      if (a.quotaPercent >= 60 && b.quotaPercent >= 60) {
        return (a.renewalTotalMinutes ?? 9999) - (b.renewalTotalMinutes ?? 9999);
      }
      return (b.quotaPercent ?? 0) - (a.quotaPercent ?? 0);
    });
    return sorted[0]?.id;
  }, [accounts]);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  return (
    <div className={`w-full h-full flex flex-col bg-[#090d16] text-slate-100 overflow-hidden select-none font-sans ${isStealthMode ? 'stealth-mode' : ''}`}>
      {/* TitleBar with Windows Controls, Mini Mode Toggle, Status, Stealth & Help */}
      <TitleBar
        activeAccount={activeAccount}
        currentView={currentView}
        isMiniMode={isMiniMode}
        isStealthMode={isStealthMode}
        onToggleStealthMode={() => setIsStealthMode((prev) => !prev)}
        onToggleMiniMode={handleToggleMiniMode}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Network Connectivity Status Banners */}
      {!isOnline && (
        <div className="bg-rose-900/90 text-white text-xs px-4 py-1.5 flex items-center justify-between border-b border-rose-500/30 animate-in fade-in shrink-0 z-40">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            <span>Você está offline. As IAs podem falhar até a conexão com a internet retornar.</span>
          </div>
          <button
            onClick={handleReload}
            className="px-3 py-1 rounded-xl bg-black/40 hover:bg-black/60 text-white text-xs font-semibold border border-white/10 cursor-pointer transition-colors"
          >
            Tentar Reconectar
          </button>
        </div>
      )}

      {showOnlineRestored && (
        <div className="bg-emerald-700/90 text-white text-xs px-4 py-1 flex items-center justify-center gap-2 border-b border-emerald-500/30 animate-in fade-in shrink-0 z-40">
          <Wifi className="w-3.5 h-3.5 text-emerald-200" />
          <span>Conexão com a internet restabelecida com sucesso!</span>
        </div>
      )}

      {/* Main Workspace: Sidebar + Central View Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Professional Sidebar (Adapts to Mini Mode automatically) */}
        <Sidebar
          accounts={accounts}
          activeAccountId={activeAccountId}
          currentView={currentView}
          recommendedAccountId={recommendedAccountId}
          isCollapsed={isSidebarCollapsed}
          isMiniMode={isMiniMode}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSelectAccount={(id) => {
            setActiveAccountId(id);
            setCurrentView('chat');
          }}
          onSelectView={(view) => setCurrentView(view)}
          onAddAccount={() => setIsSettingsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLoginWizard={() => setIsLoginWizardOpen(true)}
          onOpenPersonas={() => setIsPersonaOpen(true)}
          onOpenOptimizer={() => setIsOptimizerOpen(true)}
          onOpenArtifacts={() => setIsArtifactOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenOllama={() => setIsOllamaOpen(true)}
        />

        {/* Central Workspace */}
        <main className="flex-1 h-full flex flex-col overflow-hidden relative bg-[#09090b]">
          {/* Sleek Minimalist Obsidian Chat Bar */}
          {currentView === 'chat' && activeAccount && (
            <div className="flex items-center justify-between px-4 py-2 bg-[#09090b] border-b border-white/[0.08] select-none text-sm shrink-0 gap-3 z-10">
              {/* Left: Active AI Pill & Quota */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.08] shadow-xs">
                  <AIIcon type={activeAccount.iconType || activeAccount.type} className="w-4 h-4 text-white" />
                  <span className="font-semibold text-sm text-white stealth-target">{activeAccount.name}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-xs">
                  <span className="text-zinc-400">Cota:</span>
                  <span className="font-mono font-bold text-sky-400 stealth-target">{activeAccount.quotaPercent}%</span>
                </div>
              </div>

              {/* Center: Accounts switcher pills */}
              {!isMiniMode && (
                <div className="hidden md:flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08]">
                  {accounts.map((acc) => {
                    const isCur = acc.id === activeAccountId;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setActiveAccountId(acc.id);
                          setIsChatMenuOpen(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCur
                            ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Right: Quick Chat Actions & More Options Popover */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
                  title="Novo chat limpo (Ctrl + N)"
                >
                  <MessageSquarePlus className="w-4 h-4 text-sky-400" />
                  {!isMiniMode && <span>Novo Chat</span>}
                </button>

                <button
                  onClick={handleCopyLastResponse}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
                  title="Copiar última resposta (Ctrl + Shift + C)"
                >
                  {isResponseCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      {!isMiniMode && <span className="text-emerald-400">Copiada!</span>}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-300" />
                      {!isMiniMode && <span>Copiar</span>}
                    </>
                  )}
                </button>

                {/* Secondary Actions Dropdown (...) */}
                <div className="relative">
                  <button
                    onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                    className={`flex items-center justify-center h-8 w-8 rounded-xl transition-colors cursor-pointer border ${
                      isChatMenuOpen
                        ? 'bg-zinc-800 text-white border-white/20'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/[0.08]'
                    }`}
                    title="Mais opções e controles"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isChatMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#141418] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 space-y-1.5 text-xs text-zinc-200 backdrop-blur-xl">
                      {/* Zoom Controls */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 rounded-xl text-xs font-medium">
                        <span className="text-zinc-300">Zoom: {zoomLevel}%</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer" title="Zoom -">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={handleResetZoom} className="px-1.5 py-0.5 text-xs font-mono font-bold hover:bg-white/10 rounded-md cursor-pointer">
                            100%
                          </button>
                          <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer" title="Zoom +">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quota adjustments */}
                      <button
                        onClick={() => {
                          handleUpdateQuota(activeAccount.id, Math.max(0, (activeAccount.quotaPercent || 100) - 5));
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-left text-xs font-medium"
                      >
                        <span>Registrar envio (-5%)</span>
                        <span className="text-xs font-mono font-bold text-zinc-400">-5%</span>
                      </button>

                      <button
                        onClick={() => {
                          handleUpdateQuota(activeAccount.id, 100);
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-left text-xs font-medium"
                      >
                        <span>Resetar Cota (100%)</span>
                        <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      </button>

                      <div className="h-px bg-white/[0.08] my-1" />

                      <button
                        onClick={() => {
                          handleReload();
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.08] cursor-pointer text-left text-xs font-medium"
                      >
                        <RotateCw className="w-4 h-4 text-zinc-400" />
                        <span>Recarregar Página</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsLoginWizardOpen(true);
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.08] text-emerald-400 cursor-pointer text-left text-xs font-medium"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Assistente de Login</span>
                      </button>

                      <button
                        onClick={() => {
                          handleOpenExternal(activeAccount.url);
                          setIsChatMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.08] text-zinc-200 cursor-pointer text-left text-xs font-medium"
                      >
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                        <span>Abrir no Navegador</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Native Chat Studio (100% Native React, Zero Webviews, Ultra Fast) */}
          {currentView === 'native-chat' && (
            <NativeChatStudio onSendToScratchpad={handleSendScratchpadToChat} />
          )}

          {/* KeepAlive Webviews Pool (Preserves page state and scroll with zero reload!) */}
          <KeepAliveWebviews
            ref={keepAliveRef}
            accounts={accounts}
            activeAccountId={activeAccountId}
            isVisible={currentView === 'chat'}
            onRateLimitDetected={handleRateLimitDetected}
          />

          {/* Multi-Grid View (2, 3 or 4 simultaneous IAs with Direct Injection Broadcaster) */}
          {currentView === 'split' && (
            <MultiGridView accounts={accounts} />
          )}

          {/* Quota & Live Cooldown Dashboard */}
          {currentView === 'dashboard' && (
            <QuotaDashboardView
              accounts={accounts}
              recommendedAccountId={recommendedAccountId}
              onOpenAccount={(id) => {
                setActiveAccountId(id);
                setCurrentView('chat');
              }}
              onUpdateQuota={handleUpdateQuota}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {/* Persistent Scratchpad / Bloco de Notas */}
          {currentView === 'scratchpad' && (
            <ScratchpadView
              activeAccount={activeAccount}
              onSendToChat={handleSendScratchpadToChat}
              onOpenOptimizer={(text) => {
                setOptimizerInitialPrompt(text);
                setIsOptimizerOpen(true);
              }}
              onOpenArtifact={() => setIsArtifactOpen(true)}
            />
          )}

          {/* Token & Cost Calculator */}
          {currentView === 'calculator' && (
            <TokenCalculatorView />
          )}

          {/* Prompt Library */}
          {currentView === 'prompts' && (
            <PromptLibraryModal
              isOpen={true}
              onClose={() => setCurrentView('chat')}
              onSelectPrompt={handleInjectIntoActiveChat}
            />
          )}

          {/* Service Health & Latency Monitor */}
          {currentView === 'health' && (
            <ServiceHealthView />
          )}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        accounts={accounts}
        onSelectAccount={(id) => {
          setActiveAccountId(id);
          setCurrentView('chat');
        }}
        onSelectView={(view) => setCurrentView(view)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLoginWizard={() => setIsLoginWizardOpen(true)}
        onToggleMiniMode={handleToggleMiniMode}
        onToggleStealthMode={() => setIsStealthMode((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPersonas={() => setIsPersonaOpen(true)}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenArtifacts={() => setIsArtifactOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenOllama={() => setIsOllamaOpen(true)}
      />

      {/* Login Wizard Modal */}
      <LoginWizardModal
        isOpen={isLoginWizardOpen}
        onClose={() => setIsLoginWizardOpen(false)}
        accounts={accounts}
      />

      {/* Shortcuts & Help Modal */}
      <ShortcutsHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Persona Studio Modal */}
      <PersonaStudioModal
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
        onInjectPersona={handleInjectPersona}
      />

      {/* Artifact Preview Studio Modal (HTML/CSS Sandbox) */}
      <ArtifactPreviewModal
        isOpen={isArtifactOpen}
        onClose={() => setIsArtifactOpen(false)}
      />

      {/* Prompt Optimizer Studio Modal */}
      <PromptOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        onInjectPrompt={handleInjectIntoActiveChat}
        onSendToMultiGrid={handleSendToMultiGrid}
      />

      {/* Prompt History & Starred Favorites Modal */}
      <PromptHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectPrompt={handleInjectIntoActiveChat}
      />

      {/* Workspace Export & Full Portability Modal */}
      <WorkspaceExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        accounts={accounts}
        settings={settings}
        onRestoreAll={handleRestoreAll}
      />

      {/* Ollama Local AI Bridge Modal */}
      <OllamaBridgeModal
        isOpen={isOllamaOpen}
        onClose={() => setIsOllamaOpen(false)}
        onAddAccount={(newAcc) => {
          const updated = [...accounts, newAcc];
          handleSaveAccounts(updated);
          setActiveAccountId(newAcc.id);
          setCurrentView('chat');
        }}
        onInjectPrompt={handleInjectIntoActiveChat}
      />

      {/* Settings & Accounts Modal */}
      <AccountManagerModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accounts={accounts}
        onSaveAccounts={handleSaveAccounts}
        settings={settings}
        onSaveSettings={(s) => {
          setSettings(s);
          if (window.electronAPI) window.electronAPI.saveSettings(s);
        }}
      />
    </div>
  );
}
