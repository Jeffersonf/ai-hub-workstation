import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  Code2,
  Eye,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const sampleSnippets = [
  {
    name: 'Card de Métricas (Tailwind)',
    code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white p-8 flex items-center justify-center min-h-screen">
  <div class="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Desempenho da IA</span>
      <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">99.8% Online</span>
    </div>
    <div class="text-3xl font-extrabold font-mono">1.240 <span class="text-xs text-slate-400 font-normal">reqs / seg</span></div>
    <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r from-sky-400 to-indigo-500 w-3/4 rounded-full animate-pulse"></div>
    </div>
    <div class="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
      <span>Latência média: 42ms</span>
      <span>Custo estimado: $0.0012</span>
    </div>
  </div>
</body>
</html>`
  },
  {
    name: 'Botão Interativo com Contador (JS)',
    code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white flex flex-col items-center justify-center min-h-screen space-y-4">
  <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
    Contador Interativo
  </h1>
  <button id="btn" class="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all active:scale-95">
    Cliques: <span id="count">0</span>
  </button>
  <script>
    let count = 0;
    const btn = document.getElementById('btn');
    const display = document.getElementById('count');
    btn.addEventListener('click', () => {
      count++;
      display.innerText = count;
    });
  </script>
</body>
</html>`
  }
];

export function ArtifactPreviewModal({ isOpen, onClose, initialCode = '' }) {
  const [code, setCode] = useState(initialCode || sampleSnippets[0].code);
  const [debouncedCode, setDebouncedCode] = useState(initialCode || sampleSnippets[0].code);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code' | 'split'
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 350);
    return () => clearTimeout(timer);
  }, [code]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    playNotificationSound('broadcast');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artefato-ia-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[380px]';
    if (viewport === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-6xl h-[90vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Laboratório de Artefatos & Live Code Sandbox
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  HTML &bull; CSS &bull; JS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Execute e visualize componentes e protótipos gerados pelas IAs em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Visualização Mobile (380px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Código</span>
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Dividido</span>
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Copiar código para área de transferência"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow cursor-pointer"
              title="Baixar arquivo .html"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Snippets Preset Bar */}
        <div className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-zinc-400 text-xs">Exemplos:</span>
            <div className="flex gap-2">
              {sampleSnippets.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setCode(s.code)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-zinc-400 font-mono">
            Modo Sandbox Seguro (IFrame Isolado)
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden pt-3 gap-4">
          {/* Code Editor */}
          {(activeTab === 'code' || activeTab === 'split') && (
            <div className="flex-1 h-full flex flex-col rounded-2xl bg-[#090d16] border border-white/10 p-3.5 shadow-inner">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-400" /> Editor de Código HTML/CSS/JS
              </span>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Cole seu código HTML gerado pela IA aqui..."
                className="w-full flex-1 bg-transparent text-zinc-200 text-sm font-mono leading-relaxed outline-none resize-none placeholder:text-zinc-600"
              />
            </div>
          )}

          {/* Live Preview Frame */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-black/50 rounded-2xl border border-white/10 p-2 overflow-hidden">
              <div className={`h-full transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/10 ${getViewportWidth()}`}>
                <iframe
                  title="Artifact Preview Sandbox"
                  srcDoc={debouncedCode}
                  sandbox="allow-scripts allow-modals"
                  className="w-full h-full bg-white border-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
