import React from 'react';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

const shortcutGroups = [
  {
    title: 'Navegação Geral & Visões',
    items: [
      { keys: ['Ctrl', 'K'], desc: 'Abrir Paleta de Comandos rápida' },
      { keys: ['Ctrl', 'B'], desc: 'Recolher ou expandir barra lateral' },
      { keys: ['Ctrl', 'M'], desc: 'Alternar Modo Mini Flutuante (PIP)' },
      { keys: ['Ctrl', '1..9'], desc: 'Pular diretamente para Conta 1 a 9' },
      { keys: ['Ctrl', 'J'], desc: 'Abrir Bloco de Notas (Scratchpad)' },
      { keys: ['Ctrl', 'H'], desc: 'Abrir Histórico de Prompts' }
    ]
  },
  {
    title: 'Estúdios de Criação & Engenharia de IA',
    items: [
      { keys: ['Ctrl', 'Shift', 'O'], desc: 'Abrir Otimizador de Prompts (Prompt Engineering)' },
      { keys: ['Ctrl', 'Shift', 'A'], desc: 'Abrir Laboratório de Artefatos (HTML/CSS Sandbox)' },
      { keys: ['Ctrl', 'Shift', 'P'], desc: 'Abrir Central de Personas Especialistas' },
      { keys: ['Ctrl', 'Shift', 'H'], desc: 'Alternar Modo Camuflagem / Privacidade (Stealth)' }
    ]
  },
  {
    title: 'Controle de Conversa & IA',
    items: [
      { keys: ['Ctrl', 'N'], desc: 'Iniciar novo chat limpo na IA atual' },
      { keys: ['Ctrl', 'Shift', 'C'], desc: 'Copiar última resposta da IA' },
      { keys: ['Ctrl', 'Shift', 'R'], desc: 'Recarregar chat da IA atual' },
      { keys: ['Ctrl', '+'], desc: 'Aumentar zoom da página' },
      { keys: ['Ctrl', '-'], desc: 'Diminuir zoom da página' },
      { keys: ['Ctrl', '0'], desc: 'Resetar zoom para 100%' },
      { keys: ['?'], desc: 'Abrir este guia de atalhos' }
    ]
  },
  {
    title: 'Atalhos Globais do Windows (De qualquer programa)',
    items: [
      { keys: ['Ctrl', 'Alt', 'Space'], desc: 'Exibir ou ocultar o AI Hub de qualquer app' },
      { keys: ['Ctrl', 'Alt', 'M'], desc: 'Ativar/Desativar Modo Mini Flutuante globalmente' }
    ]
  },
  {
    title: 'Produtividade Multi-IA & Voz',
    items: [
      { keys: ['Enter'], desc: 'Disparar prompt broadcast no Multi-Grid' },
      { keys: ['Esc'], desc: 'Fechar modais e paleta de comandos' }
    ]
  }
];

export function ShortcutsHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-sky-400 border border-blue-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Atalhos de Teclado & Produtividade</h2>
              <p className="text-xs text-slate-400">Domine a workstation sem tirar as mãos do teclado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <span className="text-sm text-zinc-200 font-medium">{item.desc}</span>
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-zinc-200 text-xs font-mono shadow-sm font-semibold"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
