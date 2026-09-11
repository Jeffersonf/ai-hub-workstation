import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  MessageSquare,
  Columns2,
  BarChart3,
  BookOpen,
  Settings,
  KeyRound,
  Activity,
  ArrowRight,
  FileText,
  Calculator,
  Pin,
  HelpCircle,
  UserCheck,
  Wand2,
  Code2,
  History,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { AIIcon } from './AIIcon';

export function CommandPalette({
  isOpen,
  onClose,
  accounts,
  onSelectAccount,
  onSelectView,
  onOpenSettings,
  onOpenLoginWizard,
  onToggleMiniMode,
  onToggleStealthMode,
  onOpenHelp,
  onOpenPersonas,
  onOpenOptimizer,
  onOpenArtifacts,
  onOpenHistory,
  onOpenExport,
  onOpenOllama
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build command items
  const accountItems = accounts.map((acc) => ({
    id: `acc-${acc.id}`,
    category: 'Contas de IA',
    title: acc.name,
    subtitle: `${acc.provider} · ${acc.quotaPercent}% cota`,
    icon: <AIIcon type={acc.iconType || acc.type} className="w-4 h-4" />,
    action: () => {
      onSelectAccount(acc.id);
      onClose();
    }
  }));

  const studioItems = [
    {
      id: 's-personas',
      category: 'Estúdio & Criação',
      title: 'Central de Personas Especialistas (12+ Perfis)',
      subtitle: 'Arquiteto de Software, Pentester OWASP, SRE, Copywriter, UX Lead',
      icon: <UserCheck className="w-4 h-4 text-purple-400" />,
      action: () => {
        if (onOpenPersonas) onOpenPersonas();
        onClose();
      }
    },
    {
      id: 's-optimizer',
      category: 'Estúdio & Criação',
      title: 'Otimizador de Prompts (Prompt Engineering Studio)',
      subtitle: 'Transformar rascunhos em instruções CoT, anti-alucinação e código de produção',
      icon: <Wand2 className="w-4 h-4 text-violet-400" />,
      action: () => {
        if (onOpenOptimizer) onOpenOptimizer();
        onClose();
      }
    },
    {
      id: 's-artifacts',
      category: 'Estúdio & Criação',
      title: 'Laboratório de Artefatos (HTML/CSS Sandbox)',
      subtitle: 'Visualizar em tempo real código gerado pelas IAs (responsivo, iframe seguro)',
      icon: <Code2 className="w-4 h-4 text-sky-400" />,
      action: () => {
        if (onOpenArtifacts) onOpenArtifacts();
        onClose();
      }
    },
    {
      id: 's-history',
      category: 'Estúdio & Criação',
      title: 'Histórico de Prompts & Favoritos',
      subtitle: 'Buscar mensagens anteriores, favoritar com estrela e reutilizar',
      icon: <History className="w-4 h-4 text-amber-400" />,
      action: () => {
        if (onOpenHistory) onOpenHistory();
        onClose();
      }
    },
    {
      id: 's-ollama',
      category: 'Estúdio & Criação',
      title: 'Ponte Ollama & Modelos Locais (100% Offline)',
      subtitle: 'Detectar Llama 3, DeepSeek R1, Qwen e testar inferência na GPU local',
      icon: <Cpu className="w-4 h-4 text-emerald-400" />,
      action: () => {
        if (onOpenOllama) onOpenOllama();
        onClose();
      }
    }
  ];

  const viewItems = [
    {
      id: 'v-scratchpad',
      category: 'Espaço de Trabalho',
      title: 'Bloco de Notas & Rascunhos (Scratchpad)',
      subtitle: 'Anotações, ditado por voz, leitura em áudio (TTS) e auto-save',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSelectView('scratchpad');
        onClose();
      }
    },
    {
      id: 'v-calc',
      category: 'Espaço de Trabalho',
      title: 'Calculadora de Tokens & Estimativa de Custos',
      subtitle: 'Medir tokens e comparar preços entre OpenAI, Claude e DeepSeek',
      icon: <Calculator className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectView('calculator');
        onClose();
      }
    },
    {
      id: 'v-split',
      category: 'Espaço de Trabalho',
      title: 'Modo Comparação Multi-Grid (2 a 4 IAs)',
      subtitle: 'Dividir tela e disparar perguntas simultâneas com microfone e arquivos',
      icon: <Columns2 className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onSelectView('split');
        onClose();
      }
    },
    {
      id: 'v-dash',
      category: 'Espaço de Trabalho',
      title: 'Dashboard de Cotas & Cronômetros',
      subtitle: 'Visão geral de limites, estatísticas e renovação',
      icon: <BarChart3 className="w-4 h-4 text-sky-400" />,
      action: () => {
        onSelectView('dashboard');
        onClose();
      }
    },
    {
      id: 'v-prompts',
      category: 'Espaço de Trabalho',
      title: 'Biblioteca de Prompts & Snippets',
      subtitle: 'Copiar comandos e preencher variáveis dinâmicas',
      icon: <BookOpen className="w-4 h-4 text-violet-400" />,
      action: () => {
        onSelectView('prompts');
        onClose();
      }
    },
    {
      id: 'v-health',
      category: 'Espaço de Trabalho',
      title: 'Status dos Servidores de IA (Live Uptime)',
      subtitle: 'Verificar latência e se OpenAI/Claude/Gemini estão online',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectView('health');
        onClose();
      }
    }
  ];

  const actionItems = [
    {
      id: 'a-stealth',
      category: 'Ferramentas',
      title: 'Alternar Modo Camuflagem / Privacidade (Stealth)',
      subtitle: 'Desfocar emails, nomes de contas e saldos para reuniões e chamadas de vídeo',
      icon: <EyeOff className="w-4 h-4 text-amber-400" />,
      action: () => {
        if (onToggleStealthMode) onToggleStealthMode();
        onClose();
      }
    },
    {
      id: 'a-mini',
      category: 'Ferramentas',
      title: 'Alternar Modo Mini Flutuante (PIP)',
      subtitle: 'Fixar janela compacta no canto da tela (Always on Top)',
      icon: <Pin className="w-4 h-4 text-sky-400" />,
      action: () => {
        if (onToggleMiniMode) onToggleMiniMode();
        onClose();
      }
    },
    {
      id: 'a-backup',
      category: 'Ferramentas',
      title: 'Backup & Portabilidade Completa',
      subtitle: 'Exportar todas as contas, rascunhos, personas e notas em JSON ou Markdown',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      action: () => {
        if (onOpenExport) onOpenExport();
        onClose();
      }
    },
    {
      id: 'a-help',
      category: 'Ferramentas',
      title: 'Atalhos de Teclado & Guia',
      subtitle: 'Ver todos os atalhos rápidos da workstation',
      icon: <HelpCircle className="w-4 h-4 text-blue-400" />,
      action: () => {
        if (onOpenHelp) onOpenHelp();
        onClose();
      }
    },
    {
      id: 'a-auth',
      category: 'Ferramentas',
      title: 'Assistente de Login Rápido',
      subtitle: 'Gerenciar autenticações e sessões sem erro',
      icon: <KeyRound className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onOpenLoginWizard();
        onClose();
      }
    },
    {
      id: 'a-settings',
      category: 'Ferramentas',
      title: 'Configurações do Sistema & Backup',
      subtitle: 'Gerenciar contas, exportar e importar dados',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      action: () => {
        onOpenSettings();
        onClose();
      }
    }
  ];

  const allItems = [...accountItems, ...studioItems, ...viewItems, ...actionItems];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-2xl max-h-[75vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite para buscar qualquer conta, visão ou comando..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-zinc-300 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Nenhum comando ou conta encontrado para "{query}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/30 text-white border border-blue-500/40 shadow-sm'
                      : 'hover:bg-white/5 text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold flex items-center gap-2 text-white">
                        <span>{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 font-normal text-zinc-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">{item.subtitle}</div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-zinc-500'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>Use as setas ↑ ↓ para navegar e Enter para executar</span>
          <span className="font-semibold text-zinc-300">AI Hub Workstation</span>
        </div>
      </div>
    </div>
  );
}
