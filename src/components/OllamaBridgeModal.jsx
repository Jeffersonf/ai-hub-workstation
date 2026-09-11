import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Server,
  Sparkles,
  RefreshCw,
  Send,
  Plus,
  Check,
  AlertCircle,
  HardDrive,
  Copy,
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

export function OllamaBridgeModal({
  isOpen,
  onClose,
  onAddAccount,
  onInjectPrompt
}) {
  const [ollamaUrl, setOllamaUrl] = useState('http://127.0.0.1:11434');
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [testPrompt, setTestPrompt] = useState('Olá! Explique brevemente o que é um modelo de linguagem local.');
  const [responseOutput, setResponseOutput] = useState('');
  const [isLoadingInference, setIsLoadingInference] = useState(false);
  const [copied, setCopied] = useState(false);
  const [accountAdded, setAccountAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkOllamaConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const checkOllamaConnection = async () => {
    setIsChecking(true);
    setResponseOutput('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const modelList = data.models || [];
        setModels(modelList);
        setIsConnected(true);
        if (modelList.length > 0 && !selectedModel) {
          setSelectedModel(modelList[0].name);
        }
        playNotificationSound('ready');
      } else {
        setIsConnected(false);
        setModels([]);
      }
    } catch (err) {
      setIsConnected(false);
      setModels([]);
    } finally {
      clearTimeout(timeoutId);
      setIsChecking(false);
    }
  };

  const handleTestInference = async () => {
    if (!selectedModel || !testPrompt.trim()) return;

    setIsLoadingInference(true);
    setResponseOutput('');

    try {
      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: testPrompt,
          stream: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResponseOutput(data.response || 'Sem resposta retornada.');
        playNotificationSound('ready');
      } else {
        setResponseOutput(`Erro na inferência: HTTP ${res.status}`);
        playNotificationSound('limit');
      }
    } catch (err) {
      setResponseOutput(`Falha ao conectar com Ollama: ${err.message}`);
      playNotificationSound('limit');
    } finally {
      setIsLoadingInference(false);
    }
  };

  const handleAddOllamaAccount = () => {
    if (!selectedModel) return;
    const newAcc = {
      id: `acc-ollama-${Date.now()}`,
      name: `Ollama · ${selectedModel.split(':')[0]}`,
      provider: `Ollama Local · ${selectedModel}`,
      type: 'custom',
      url: 'http://localhost:11434',
      quotaPeriod: 'daily',
      periodLabel: 'Ilimitado Local',
      quotaPercent: 100,
      renewalDays: 0,
      renewalHours: 24,
      renewalTotalMinutes: 1440,
      checkIntervalSec: 60,
      lastChecked: new Date().toLocaleTimeString('pt-BR'),
      iconType: 'custom'
    };

    if (onAddAccount) {
      onAddAccount(newAcc);
      setAccountAdded(true);
      playNotificationSound('ready');
      setTimeout(() => setAccountAdded(false), 2500);
    }
  };

  const handleCopyResponse = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    playNotificationSound('broadcast');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 text-white shadow-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Ponte Ollama & IAs Locais</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isConnected ? 'Ollama Online (127.0.0.1:11434)' : 'Ollama Não Detectado'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute modelos open-source (Llama 3, DeepSeek R1, Qwen) 100% offline na GPU do seu computador
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Connection Checker Bar */}
          <div className="p-3.5 rounded-2xl bg-[#0b0f1e] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <Server className="w-4 h-4 text-sky-400 shrink-0" />
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://127.0.0.1:11434"
                className="w-full bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={checkOllamaConnection}
                disabled={isChecking}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 border border-white/10 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-sky-400' : ''}`} />
                <span>{isChecking ? 'Verificando...' : 'Re-testar Conexão'}</span>
              </button>

              {isConnected && models.length > 0 && (
                <button
                  onClick={handleAddOllamaAccount}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {accountAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{accountAdded ? 'Adicionado!' : 'Integrar à Workstation'}</span>
                </button>
              )}
            </div>
          </div>

          {!isConnected ? (
            /* Instructions when Ollama is offline */
            <div className="p-6 rounded-3xl bg-[#0b0f1e] border border-white/10 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 mx-auto">
                <Terminal className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Como iniciar o Ollama no seu computador:</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  O Ollama permite rodar modelos de IA com privacidade absoluta, sem gastar cotas e sem internet.
                </p>
              </div>

              <div className="max-w-md mx-auto p-3 rounded-2xl bg-black/50 border border-white/10 text-left font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500"># 1. No terminal ou PowerShell, inicie o serviço:</div>
                <div className="text-emerald-400 select-text">ollama serve</div>
                <div className="text-slate-500 pt-1"># 2. Em outro terminal, baixe um modelo leve e veloz:</div>
                <div className="text-sky-400 select-text">ollama run llama3.2</div>
              </div>

              <div className="pt-2">
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  <span>Baixar instalador oficial do Ollama para Windows</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            /* Local Models Installed */
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Modelos Locais Instalados ({models.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {models.map((m) => {
                    const isSelected = selectedModel === m.name;
                    return (
                      <button
                        key={m.name}
                        onClick={() => setSelectedModel(m.name)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-500 shadow-md shadow-emerald-500/10'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-bold text-white truncate max-w-[160px]">
                            {m.name}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-semibold">
                            {formatBytes(m.size)}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 truncate">
                          Família: {m.details?.family || 'N/A'} · {m.details?.parameter_size || 'Auto'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Inference Test Box */}
              <div className="p-4 rounded-3xl bg-[#090d18] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Teste Rápido de Inferência Local ({selectedModel || 'Nenhum selecionado'})
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-medium">100% Offline · Custo $0.00</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTestInference()}
                    placeholder="Digite uma pergunta para testar seu modelo local..."
                    className="flex-1 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/10 text-xs text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleTestInference}
                    disabled={isLoadingInference}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isLoadingInference ? 'Gerando...' : 'Executar'}</span>
                  </button>
                </div>

                {responseOutput && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-bold text-emerald-300">Resposta de {selectedModel}:</span>
                      <button
                        onClick={handleCopyResponse}
                        className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copiado!' : 'Copiar Resposta'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {responseOutput}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Dados processados localmente na memória RAM / VRAM da sua máquina</span>
          </div>
        </div>
      </div>
    </div>
  );
}
