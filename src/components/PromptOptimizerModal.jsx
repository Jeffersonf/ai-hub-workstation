import React, { useState } from 'react';
import {
  X,
  Wand2,
  Sparkles,
  Copy,
  Check,
  Send,
  Code2,
  BrainCircuit,
  FileCheck,
  Bug,
  Lightbulb,
  ArrowRight,
  Columns2
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const optimizationPresets = [
  {
    id: 'cot_advanced',
    title: 'Engenharia de Prompt Rigorosa (CoT + Regras)',
    icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
    desc: 'Estrutura com Papel, Contexto, Delimitadores e Formato Estrito',
    transform: (raw) => `### OBJETIVO PRINCIPAL:
${raw}

### DIRETRIZES DE EXECUÇÃO:
1. Pense passo a passo antes de responder para garantir exatidão absoluta.
2. Seja claro, conciso e elimine redundâncias ou floreios desnecessários.
3. Se houver ambiguidades ou suposições necessárias, declare-as explicitamente.
4. Entregue a resposta final estruturada com cabeçalhos e exemplos práticos quando aplicável.`
  },
  {
    id: 'senior_code',
    title: 'Geração de Código Sênior (Produção)',
    icon: <Code2 className="w-4 h-4 text-sky-400" />,
    desc: 'Código idiomático, tipado, tratamento de exceções e Big-O',
    transform: (raw) => `### ESPECIFICAÇÃO DE CÓDIGO:
${raw}

### PADRÃO TÉCNICO EXIGIDO:
- Nível de senioridade: Staff / Principal Engineer.
- Escreva código completo, pronto para produção, sem placeholders ou trechos comentados como "// adicione aqui".
- Inclua tipagem estrita, boas práticas de Clean Architecture / SOLID e tratamento idiomático de erros.
- Adicione comentários sucintos explicando decisões de arquitetura e complexidade de tempo/espaço (Big-O).
- Ao final, forneça um breve exemplo de uso real ou caso de teste unitário.`
  },
  {
    id: 'anti_hallucination',
    title: 'Zero Alucinação & Fatos Verificáveis',
    icon: <FileCheck className="w-4 h-4 text-emerald-400" />,
    desc: 'Exige fontes, delimita o que é incerto e evita invenções',
    transform: (raw) => `### PERGUNTA / TÓPICO PARA ANÁLISE:
${raw}

### RESTRIÇÕES CRÍTICAS CONTRA ALUCINAÇÕES:
1. Responda com base apenas em dados e fatos comprovados.
2. Se você não tiver certeza de alguma informação ou se o dado não for amplamente verificado, afirme explicitamente: "Não há evidências concretas sobre isso" em vez de especular.
3. Separe fatos indiscutíveis de opiniões ou estimativas do mercado.
4. Use citações claras e marcos temporais para cada informação.`
  },
  {
    id: 'bug_hunter',
    title: 'Diagnóstico de Erro & Bug Hunter',
    icon: <Bug className="w-4 h-4 text-rose-400" />,
    desc: 'Método científico de causa-raiz e solução definitiva',
    transform: (raw) => `### INCIDENTE / RELATÓRIO DE ERRO:
${raw}

### PLANO DE DIAGNÓSTICO:
1. Hipótese de Causa-Raiz: Liste as 3 causas mais prováveis por ordem de frequência na indústria.
2. Como Reproduzir e Isolar: Teste mínimo para comprovar a falha.
3. Correção Definitiva: Código corrigido com diff claro ou explicação das alterações necessárias.
4. Prevenção Futura: Medidas para garantir que este bug não volte a acontecer (testes, validações, lints).`
  },
  {
    id: 'executive_tldr',
    title: 'Resumo Executivo para Tomada de Decisão (TL;DR)',
    icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    desc: 'Bullet points diretos, prós & contras e plano de ação',
    transform: (raw) => `### CONTEXTO PARA SÍNTESE EXECUTIVA:
${raw}

### ESTRUTURA DO RELATÓRIO EXECUTIVO:
- **Resumo em 1 Parágrafo (TL;DR)**
- **Principais Insights & Vantagens (Bullet Points)**
- **Riscos, Desvantagens e Trade-offs**
- **Recomendação Final e Próximos Passos Imediatos**`
  }
];

export function PromptOptimizerModal({
  isOpen,
  onClose,
  onInjectPrompt,
  onSendToMultiGrid
}) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [activePresetId, setActivePresetId] = useState('cot_advanced');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setActivePresetId(preset.id);
    const base = inputPrompt.trim() || 'Descreva sua tarefa aqui...';
    setOptimizedPrompt(preset.transform(base));
    playNotificationSound('ready');
  };

  const handleCopy = () => {
    const text = optimizedPrompt || inputPrompt;
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    playNotificationSound('broadcast');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInject = () => {
    const text = optimizedPrompt || inputPrompt;
    if (!text.trim()) return;
    if (onInjectPrompt) onInjectPrompt(text);
    playNotificationSound('ready');
    onClose();
  };

  const handleMultiGrid = () => {
    const text = optimizedPrompt || inputPrompt;
    if (!text.trim()) return;
    if (onSendToMultiGrid) onSendToMultiGrid(text);
    playNotificationSound('ready');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-sky-500 text-white shadow-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Otimizador Inteligente de Prompts</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  Prompt Engineering Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transforme rascunhos em instruções de altíssima precisão que extraem o máximo de qualquer IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="py-3 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 shrink-0 mr-1">
            Presets:
          </span>
          {optimizationPresets.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-purple-600/30 text-white border-purple-500 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                }`}
                title={preset.desc}
              >
                {preset.icon}
                <span>{preset.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content: Side-by-side Editor & Optimizer */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Left: Input Prompt */}
          <div className="flex flex-col rounded-2xl bg-[#0a0d18] border border-white/10 p-3.5">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                1. Sua Ideia ou Rascunho Bruto
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {inputPrompt.length} caracteres
              </span>
            </div>
            <textarea
              value={inputPrompt}
              onChange={(e) => {
                setInputPrompt(e.target.value);
                const currentPreset = optimizationPresets.find((p) => p.id === activePresetId);
                if (currentPreset && e.target.value.trim()) {
                  setOptimizedPrompt(currentPreset.transform(e.target.value));
                }
              }}
              placeholder="Digite o que você quer fazer de forma simples (ex: crie um dashboard em React com gráficos e modo escuro)..."
              className="flex-1 w-full bg-transparent text-zinc-200 text-sm font-mono outline-none resize-none placeholder:text-zinc-600 leading-relaxed"
            />
            <div className="pt-2 flex justify-between items-center text-xs text-zinc-400 border-t border-white/5">
              <span>Dica: Digite livremente e clique em um preset acima</span>
              {inputPrompt.trim() && (
                <button
                  onClick={() => setInputPrompt('')}
                  className="text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer text-xs"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Right: Optimized Prompt */}
          <div className="flex flex-col rounded-2xl bg-[#0c1222] border border-purple-500/20 p-3.5 shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                2. Prompt Estruturado & Aprimorado
              </span>
              <span className="text-xs text-purple-400/80 font-mono">
                ~{Math.round((optimizedPrompt.length || 0) / 3.5)} tokens est.
              </span>
            </div>
            <textarea
              value={optimizedPrompt}
              onChange={(e) => setOptimizedPrompt(e.target.value)}
              placeholder="O prompt otimizado aparecerá aqui pronto para uso..."
              className="flex-1 w-full bg-transparent text-purple-100 text-sm font-mono outline-none resize-none placeholder:text-purple-300/30 leading-relaxed"
            />
            <div className="pt-2 flex justify-between items-center text-xs text-zinc-400 border-t border-white/5">
              <span className="text-purple-300/70">Você pode ajustar qualquer linha livremente antes de enviar</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all cursor-pointer border border-white/10"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copiado para Área de Transferência!' : 'Copiar Prompt'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMultiGrid}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-indigo-500/30"
              title="Disparar este prompt no comparador Multi-Grid com várias IAs simultaneamente"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Enviar para Multi-Grid</span>
            </button>

            <button
              onClick={handleInject}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Injetar na IA Ativa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
