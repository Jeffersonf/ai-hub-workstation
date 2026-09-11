import React, { useState, useEffect } from 'react';
import { X, Search, History, Star, Copy, Check, Send, Trash2, Calendar } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const defaultSampleHistory = [
  {
    id: 'hist-1',
    text: 'Crie uma função em Node.js com TypeScript e streams para processar arquivos CSV gigantescos sem estourar a memória RAM.',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('pt-BR'),
    starred: true
  },
  {
    id: 'hist-2',
    text: 'Explique como funciona o algoritmo de consenso Raft em comparação com Paxos usando uma analogia simples.',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('pt-BR'),
    starred: false
  }
];

export function PromptHistoryModal({ isOpen, onClose, onSelectPrompt }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_hub_prompt_history');
      return saved ? JSON.parse(saved) : defaultSampleHistory;
    } catch {
      return defaultSampleHistory;
    }
  });

  const [query, setQuery] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playNotificationSound('broadcast');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = (text) => {
    navigator.clipboard.writeText(text);
    playNotificationSound('ready');
    if (onSelectPrompt) {
      onSelectPrompt(text);
    }
    onClose();
  };

  const handleToggleStar = (id) => {
    const updated = history.map((item) =>
      item.id === id ? { ...item, starred: !item.starred } : item
    );
    setHistory(updated);
    try { localStorage.setItem('ai_hub_prompt_history', JSON.stringify(updated)); } catch (_) {}
  };

  const handleDelete = (id) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try { localStorage.setItem('ai_hub_prompt_history', JSON.stringify(updated)); } catch (_) {}
  };

  const handleClearAll = () => {
    if (confirm('Deseja limpar todo o histórico de perguntas salvas?')) {
      setHistory([]);
      try { localStorage.removeItem('ai_hub_prompt_history'); } catch (_) {}
    }
  };

  const filtered = history.filter((item) => {
    const matchStar = !onlyStarred || item.starred;
    const matchQuery = item.text.toLowerCase().includes(query.toLowerCase());
    return matchStar && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Histórico Inteligente de Prompts
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  {history.length} salvos
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pesquise, reuse ou favorite suas perguntas passadas em 1 clique
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Limpar Tudo
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 py-3 border-b border-white/5 shrink-0">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no histórico de perguntas..."
              className="bg-transparent text-white outline-none w-full"
            />
          </div>

          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              onlyStarred
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favoritos</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum prompt encontrado no histórico.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" /> {item.date} às {item.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStar(item.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        item.starred
                          ? 'text-amber-400 hover:bg-amber-500/10'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                      }`}
                      title={item.starred ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                      <Star className={`w-4 h-4 ${item.starred ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopy(item.id, item.text)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copiar prompt"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleSend(item.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow cursor-pointer active:scale-95 ml-1"
                      title="Enviar para o chat da IA atual"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reusar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-mono line-clamp-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {item.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
