import React, { useState } from 'react';
import { X, Sparkles, Send, Copy, Check, Plus, Trash2, UserCheck, Shield, Code2, Database, PenTool, Globe } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const defaultPersonas = [
  {
    id: 'p-arch',
    title: 'Arquiteto de Software & Clean Code',
    category: 'Engenharia',
    role: 'Principal Software Architect',
    prompt: 'Atue como um Arquiteto de Software Sênior e Especialista em Clean Code. Ao analisar ou escrever código, priorize alta manutenibilidade, separação de responsabilidades (SOLID), tipagem estrita, tratamento idiomático de erros e arquitetura escalável. Forneça explicações concisas e diretas ao ponto, acompanhadas de blocos de código prontos para produção.'
  },
  {
    id: 'p-sec',
    title: 'Auditor de Segurança & Pentester',
    category: 'Segurança & Dados',
    role: 'Security Auditor / Ethical Hacker',
    prompt: 'Atue como um Especialista em Cibersegurança e Auditor de Código OWASP. Analise o código fornecido com foco rigoroso em potenciais vulnerabilidades (XSS, CSRF, SQL Injection, SSRF, vazamento de credenciais e falhas de autorização). Proponha correções imediatas e regras de defesa em profundidade.'
  },
  {
    id: 'p-devops',
    title: 'Engenheiro DevOps & Cloud SRE',
    category: 'Engenharia',
    role: 'Staff DevOps & Cloud Architect',
    prompt: 'Atue como um Engenheiro DevOps e SRE Sênior especializado em Docker, Kubernetes, Terraform e CI/CD. Escreva scripts de infraestrutura como código limpos, seguros e com foco em resiliência, observabilidade e automação sem atrito.'
  },
  {
    id: 'p-data',
    title: 'Engenheiro de Dados & SQL Avançado',
    category: 'Segurança & Dados',
    role: 'Lead Data Engineer',
    prompt: 'Atue como um Engenheiro de Dados Sênior especialista em SQL analítico, modelagem dimensional e otimização de queries. Ao criar consultas SQL, priorize performance, índices eficientes, CTEs legíveis e integridade de dados.'
  },
  {
    id: 'p-copy',
    title: 'Copywriter de Alta Conversão',
    category: 'Negócios & Texto',
    role: 'Direct-Response Copywriter',
    prompt: 'Atue como um Copywriter de Resposta Direta de elite. Crie textos magnéticos, títulos irresistíveis e chamadas para ação (CTAs) de alta conversão usando os frameworks AIDA e PAS. Foque em benefícios claros, clareza cirúrgica e tom persuasivo sem enrolação.'
  },
  {
    id: 'p-ux',
    title: 'Especialista em UX & Design Systems',
    category: 'Engenharia',
    role: 'Senior Product Designer & Frontend Lead',
    prompt: 'Atue como um Especialista em UX/UI e Design Systems. Ao sugerir interfaces, priorize acessibilidade WCAG, hierarquia visual impecável, micro-interações elegantes com Tailwind CSS e usabilidade intuitiva baseada nas heurísticas de Nielsen.'
  },
  {
    id: 'p-english',
    title: 'Tutor de Inglês Técnico Nativo',
    category: 'Idiomas',
    role: 'Tech English Coach',
    prompt: 'Act as a professional Silicon Valley Tech Communications Coach. Whenever I write in English, correct any grammatical errors or unnatural phrasing, and explain the nuance in Portuguese. Offer polished corporate and technical alternatives.'
  },
  {
    id: 'p-bug',
    title: 'Detetive de Bugs (Bug Hunter)',
    category: 'Engenharia',
    role: 'Fullstack Debugging Master',
    prompt: 'Atue como um Mestre em Debugging e Resolução de Incidentes. Ao receber um erro ou comportamento inesperado, formule hipóteses científicas de causa-raiz por ordem de probabilidade, sugira testes de isolamento e entregue a correção definitiva com análise preventiva.'
  }
];

export function PersonaStudioModal({ isOpen, onClose, onInjectPersona }) {
  const [personas, setPersonas] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_hub_custom_personas');
      return saved ? JSON.parse(saved) : defaultPersonas;
    } catch {
      return defaultPersonas;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [copiedId, setCopiedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCategory, setNewCategory] = useState('Engenharia');
  const [newPrompt, setNewPrompt] = useState('');

  if (!isOpen) return null;

  const handleCopy = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    playNotificationSound('broadcast');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInject = (persona) => {
    if (onInjectPersona) {
      onInjectPersona(persona.prompt);
    }
    navigator.clipboard.writeText(persona.prompt);
    playNotificationSound('ready');
    onClose();
  };

  const handleSavePersona = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const updated = [
      ...personas,
      {
        id: `custom-${Date.now()}`,
        title: newTitle.trim(),
        role: newRole.trim() || 'Especialista',
        category: newCategory,
        prompt: newPrompt.trim()
      }
    ];

    setPersonas(updated);
    try { localStorage.setItem('ai_hub_custom_personas', JSON.stringify(updated)); } catch (_) {}
    setIsAdding(false);
    setNewTitle('');
    setNewRole('');
    setNewPrompt('');
  };

  const handleDelete = (id) => {
    const updated = personas.filter((p) => p.id !== id);
    setPersonas(updated);
    try { localStorage.setItem('ai_hub_custom_personas', JSON.stringify(updated)); } catch (_) {}
  };

  const categories = ['Todas', 'Engenharia', 'Segurança & Dados', 'Negócios & Texto', 'Idiomas'];
  const filtered = selectedCategory === 'Todas' ? personas : personas.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Central de Personas & Especialistas de IA
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  System Prompts
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ative papéis profissionais sênior instantaneamente na sua IA em uso
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Persona</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 py-3 border-b border-white/5 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSavePersona} className="my-3 p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3 shrink-0">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Título (ex: Arquiteto de Microsserviços)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Papel / Cargo (ex: Staff Architect)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white border border-white/10 focus:border-purple-500 focus:outline-none"
              >
                <option value="Engenharia">Engenharia</option>
                <option value="Segurança & Dados">Segurança & Dados</option>
                <option value="Negócios & Texto">Negócios & Texto</option>
                <option value="Idiomas">Idiomas</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Instruções e diretrizes da Persona (System Prompt)..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-white text-xs border border-white/10 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow"
              >
                Salvar Persona
              </button>
            </div>
          </form>
        )}

        {/* Persona Cards Grid */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-2 gap-4 pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#0c101e] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3 group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono mb-2">{item.role}</div>
                <p className="text-xs text-zinc-200 font-mono line-clamp-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  {item.prompt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                {item.id.startsWith('custom-') ? (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Excluir persona"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400 font-mono">Curadoria Especialista</span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copiar instruções"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleInject(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow cursor-pointer active:scale-95"
                    title="Injetar e ativar no chat atual"
                  >
                    <Send className="w-3 h-3" />
                    <span>Ativar no Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
