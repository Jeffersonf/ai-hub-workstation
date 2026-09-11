import React, { useState } from 'react';
import { Calculator, DollarSign, Cpu, Sparkles, Copy, Check, Info } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const models = [
  {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    inputPerMillion: 0.14,
    outputPerMillion: 0.28,
    contextWindow: '64k',
    highlight: 'Melhor Custo-Benefício'
  },
  {
    name: 'Google Gemini 2.0 Flash',
    provider: 'Google',
    inputPerMillion: 0.10,
    outputPerMillion: 0.40,
    contextWindow: '1M',
    highlight: 'Janela de Contexto Gigante'
  },
  {
    name: 'DeepSeek R1 (Raciocínio)',
    provider: 'DeepSeek',
    inputPerMillion: 0.55,
    outputPerMillion: 2.19,
    contextWindow: '64k',
    highlight: 'Raciocínio Avançado Econômico'
  },
  {
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    inputPerMillion: 1.10,
    outputPerMillion: 4.40,
    contextWindow: '128k',
    highlight: 'Raciocínio STEM Rápido'
  },
  {
    name: 'OpenAI GPT-4o',
    provider: 'OpenAI',
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    contextWindow: '128k',
    highlight: 'Versátil Multimodal'
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    contextWindow: '200k',
    highlight: 'Padrão Ouro para Programação'
  }
];

export function TokenCalculatorView() {
  const [sampleText, setSampleText] = useState(
    'Escreva uma função completa em TypeScript com tratamento robusto de erros para processar pagamentos via webhook do Stripe e atualizar o banco de dados PostgreSQL com Prisma ORM.'
  );
  const [estimatedOutputRatio, setEstimatedOutputRatio] = useState(2); // Output tokens multiplier
  const [usdToBrlRate, setUsdToBrlRate] = useState(5.80);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Estimates
  const charCount = sampleText.length;
  const wordCount = sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0;
  // Rule of thumb for PT-BR & Code: ~3.2 characters per token
  const estimatedInputTokens = Math.max(1, Math.round(charCount / 3.2));
  const estimatedOutputTokens = Math.round(estimatedInputTokens * estimatedOutputRatio);

  const calculateCost = (model) => {
    const inputCost = (estimatedInputTokens / 1_000_000) * model.inputPerMillion;
    const outputCost = (estimatedOutputTokens / 1_000_000) * model.outputPerMillion;
    const totalUsd = inputCost + outputCost;
    const totalBrl = totalUsd * usdToBrlRate;
    return {
      usd: totalUsd,
      brl: totalBrl
    };
  };

  const handleCopyStats = (index, model) => {
    const cost = calculateCost(model);
    const text = `${model.name}: ~${estimatedInputTokens} tokens de entrada + ~${estimatedOutputTokens} de saída = $${cost.usd.toFixed(5)} USD (~R$ ${cost.brl.toFixed(4)})`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playNotificationSound('broadcast');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#090d16] p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Calculadora de Tokens & Estimativa de Custos</h2>
            <p className="text-xs text-slate-400">
              Estime tokens e compare custos reais entre OpenAI, Claude, Gemini e DeepSeek
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 font-mono">
          <span className="text-slate-400">Câmbio USD/BRL:</span>
          <span className="text-emerald-400 font-bold">R$ {usdToBrlRate.toFixed(2)}</span>
        </div>
      </div>

      {/* Input Simulator & Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Input Text Box */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Texto de Teste / Prompt
            </label>
            <span className="text-xs text-slate-500">Cole ou digite seu texto</span>
          </div>

          <textarea
            rows={5}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-[#0d1222] border border-white/10 text-white text-xs font-mono focus:border-blue-500 focus:outline-none leading-relaxed resize-none shadow-inner"
            placeholder="Cole seu prompt ou código aqui para medir tokens..."
          />

          {/* Controls */}
          <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Tamanho esperado da resposta:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Curta (1x)', val: 1 },
                  { label: 'Média (2x)', val: 2 },
                  { label: 'Longa (4x)', val: 4 }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setEstimatedOutputRatio(item.val)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                      estimatedOutputRatio === item.val
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-zinc-300 font-mono text-xs">
              Tokens Saída estimados: <strong className="text-sky-400">~{estimatedOutputTokens}</strong>
            </span>
          </div>
        </div>

        {/* Right: Metrics Cards */}
        <div className="space-y-3 flex flex-col justify-between">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Total de Caracteres</span>
            <div className="text-2xl font-bold font-mono text-white">{charCount.toLocaleString('pt-BR')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-xs text-zinc-400 font-medium">Total de Palavras</span>
            <div className="text-2xl font-bold font-mono text-white">{wordCount.toLocaleString('pt-BR')}</div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 space-y-1">
            <span className="text-xs text-sky-300 font-medium">Tokens de Entrada Estimados</span>
            <div className="text-3xl font-extrabold font-mono text-sky-400">
              ~{estimatedInputTokens.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-zinc-400">Média calculada para PT-BR e código</p>
          </div>
        </div>
      </div>

      {/* Cost Comparison Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Comparativo de Custo por Pergunta
          </h3>
          <span className="text-xs text-slate-500">Baseado nas tabelas oficiais de preço por 1 milhão de tokens</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {models.map((m, idx) => {
            const cost = calculateCost(m);
            const isDeepSeek = m.name.includes('DeepSeek');
            const isClaude = m.name.includes('Claude');

            return (
              <div
                key={m.name}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 shadow-md ${
                  isDeepSeek
                    ? 'bg-[#0b1424] border-cyan-500/30'
                    : isClaude
                    ? 'bg-[#140e1b] border-amber-500/30'
                    : 'bg-[#0d1222] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/10">
                        {m.provider}
                      </span>
                    </div>
                    <span className="text-xs text-sky-400 font-medium">{m.highlight}</span>
                  </div>

                  <button
                    onClick={() => handleCopyStats(idx, m)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors cursor-pointer"
                    title="Copiar estimativa"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-white/5">
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">Custo por Pergunta (USD)</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${cost.usd < 0.0001 ? '< $0.0001' : cost.usd.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-xs mb-0.5">Em Reais (BRL)</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {cost.brl < 0.001 ? '< R$ 0,001' : `R$ ${cost.brl.toFixed(3)}`}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 flex justify-between font-mono pt-1">
                  <span>In: ${m.inputPerMillion}/M &middot; Out: ${m.outputPerMillion}/M</span>
                  <span>Contexto: {m.contextWindow}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
