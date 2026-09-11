import React, { useState } from 'react';
import { X, Copy, Check, Plus, Trash2, BookOpen, Sparkles, Search, SlidersHorizontal, Send } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const defaultPrompts = [
  {
    id: 'p-1',
    title: 'Revisão e Otimização de Código',
    category: 'Código',
    content: 'Analise o seguinte código em {{linguagem}} em busca de bugs, vulnerabilidades e oportunidades de otimização de performance. Explique cada alteração de forma concisa:\n\n```{{linguagem}}\n{{codigo}}\n```'
  },
  {
    id: 'p-2',
    title: 'Explicação Didática (ELI5)',
    category: 'Produtividade',
    content: 'Explique o conceito de "{{conceito}}" de forma simples e intuitiva, usando uma analogia do cotidiano para que uma pessoa leiga entenda sem dificuldade.'
  },
  {
    id: 'p-3',
    title: 'Tradução Técnica e Polimento',
    category: 'Tradução',
    content: 'Traduza e adapte o texto a seguir para português brasileiro mantendo a terminologia técnica padrão da indústria e um tom profissional e direto:\n\n{{texto}}'
  },
  {
    id: 'p-4',
    title: 'Gerador de Testes Unitários',
    category: 'Código',
    content: 'Crie testes unitários completos com {{framework}} cobrindo cenários ideais e casos de borda (edge cases) para a seguinte função/classe:\n\n{{codigo}}'
  },
  {
    id: 'p-5',
    title: 'Resumo Executivo com Pontos de Ação',
    category: 'Produtividade',
    content: 'Leia o texto abaixo e elabore: (1) Resumo executivo em 3 parágrafos, (2) Principais conclusões em bullet points, e (3) Próximos passos de ação sugeridos:\n\n{{documento}}'
  }
];

export function PromptLibraryModal({ isOpen, onClose, onSelectPrompt }) {
  const [prompts, setPrompts] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_quota_prompts');
      return saved ? JSON.parse(saved) : defaultPrompts;
    } catch {
      return defaultPrompts;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Código');
  const [newContent, setNewContent] = useState('');

  // Variable Filling modal state
  const [fillingPrompt, setFillingPrompt] = useState(null);
  const [variableValues, setVariableValues] = useState({});

  if (!isOpen) return null;

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    playNotificationSound('broadcast');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePrompt = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const updated = [
      ...prompts,
      {
        id: `p-${Date.now()}`,
        title: newTitle.trim(),
        category: newCategory,
        content: newContent.trim()
      }
    ];

    setPrompts(updated);
    try { localStorage.setItem('ai_quota_prompts', JSON.stringify(updated)); } catch (_) {}
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    try { localStorage.setItem('ai_quota_prompts', JSON.stringify(updated)); } catch (_) {}
  };

  // Variable extraction helper
  const extractVariables = (text) => {
    const matches = text.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ''))));
  };

  const handleStartFilling = (item) => {
    const vars = extractVariables(item.content);
    if (vars.length === 0) {
      handleCopy(item.id, item.content);
      return;
    }
    const initialVals = {};
    vars.forEach((v) => (initialVals[v] = ''));
    setVariableValues(initialVals);
    setFillingPrompt(item);
  };

  const handleGenerateFromVariables = (shouldInject = false) => {
    if (!fillingPrompt) return;
    let result = fillingPrompt.content;
    Object.entries(variableValues).forEach(([k, val]) => {
      result = result.replaceAll(`{{${k}}}`, val || `[${k}]`);
    });
    navigator.clipboard.writeText(result);
    playNotificationSound('ready');
    if (shouldInject && onSelectPrompt) {
      onSelectPrompt(result);
      onClose();
    }
    setFillingPrompt(null);
  };

  const categories = ['Todas', 'Código', 'Produtividade', 'Tradução'];
  const filtered = prompts.filter((p) => {
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Biblioteca de Prompts & Templates</h2>
              <p className="text-xs text-slate-400">Modelos prontos com suporte a variáveis dinâmicas {'{{...}}'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex items-center justify-between gap-3 pt-4 pb-2">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar templates..."
              className="bg-transparent text-white outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium transition-all shadow cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Novo
          </button>
        </div>

        {/* Variable Filling Form Overlay */}
        {fillingPrompt && (
          <div className="my-2 p-4 rounded-2xl bg-[#141208] border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Preencher Variáveis: {fillingPrompt.title}
              </span>
              <button
                onClick={() => setFillingPrompt(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.keys(variableValues).map((v) => (
                <div key={v}>
                  <label className="block text-slate-400 mb-1 capitalize">
                    {`{{${v}}}`}
                  </label>
                  <input
                    type="text"
                    placeholder={`Valor para ${v}...`}
                    value={variableValues[v]}
                    onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => handleGenerateFromVariables(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Copiar Prompt
              </button>
              <button
                onClick={() => handleGenerateFromVariables(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Injetar no Chat Ativo</span>
              </button>
            </div>
          </div>
        )}

        {/* New Prompt Form */}
        {isAdding && (
          <form onSubmit={handleSavePrompt} className="my-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                required
                placeholder="Título do Template"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                <option value="Código">Código</option>
                <option value="Produtividade">Produtividade</option>
                <option value="Tradução">Tradução</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Digite o conteúdo do prompt. Dica: use {{variavel}} para criar campos dinâmicos!"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-white text-xs border border-white/10 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-lg text-xs text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-medium text-white shadow"
              >
                Salvar Template
              </button>
            </div>
          </form>
        )}

        {/* Prompt List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {filtered.map((item) => {
            const vars = extractVariables(item.content);
            const hasVars = vars.length > 0;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/8 border border-white/5 transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                      {item.category}
                    </span>
                    {hasVars && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-500/30 font-mono">
                        {vars.length} {vars.length === 1 ? 'variável' : 'variáveis'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasVars ? (
                      <button
                        onClick={() => handleStartFilling(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold border border-amber-500/30 transition-all cursor-pointer"
                        title="Preencher variáveis e gerar prompt"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Preencher</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(item.id, item.content)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        {onSelectPrompt && (
                          <button
                            onClick={() => {
                              onSelectPrompt(item.content);
                              playNotificationSound('ready');
                              onClose();
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-xs text-sky-200 hover:text-white border border-blue-500/30 transition-all cursor-pointer"
                            title="Injetar diretamente na IA ativa"
                          >
                            <Send className="w-3 h-3" />
                            <span>Injetar</span>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono line-clamp-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
