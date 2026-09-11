import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Download,
  Cpu,
  Bot,
  User,
  Key,
  ChevronDown,
  AlertCircle,
  ExternalLink,
  Code2
} from 'lucide-react';

const DEFAULT_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google (Grátis)', icon: 'gemini', badge: 'Recomendado' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google (Grátis)', icon: 'gemini' },
  { id: 'ollama', name: 'Ollama Local', provider: 'Offline / GPU', icon: 'ollama', badge: '100% Local' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek API', icon: 'deepseek' }
];

export function NativeChatStudio({ onSendToScratchpad }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_hub_native_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_hub_api_keys');
      return saved ? JSON.parse(saved) : { gemini: '', deepseek: '', ollamaUrl: 'http://localhost:11434' };
    } catch {
      return { gemini: '', deepseek: '', ollamaUrl: 'http://localhost:11434' };
    }
  });

  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState('unchecked'); // 'unchecked' | 'online' | 'offline'

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ai_hub_native_messages', JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  // Save API keys to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ai_hub_api_keys', JSON.stringify(apiKeys));
    } catch (_) {}
  }, [apiKeys]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Check Ollama status on startup
  useEffect(() => {
    checkOllama();
  }, [apiKeys.ollamaUrl]);

  const checkOllama = async () => {
    const url = apiKeys.ollamaUrl || 'http://localhost:11434';
    try {
      const res = await fetch(`${url}/api/tags`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m) => m.name);
        setOllamaModels(models);
        if (models.length > 0 && !selectedOllamaModel) {
          setSelectedOllamaModel(models[0]);
        }
        setOllamaStatus('online');
      } else {
        setOllamaStatus('offline');
      }
    } catch {
      setOllamaStatus('offline');
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (confirm('Deseja limpar todo o histórico desta conversa no Studio?')) {
      setMessages([]);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const text = messages
      .map((m) => `### ${m.role === 'user' ? '👤 Você' : '✨ ' + (m.model || 'Assistente')}\n\n${m.content}\n\n---\n`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-studio-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isGenerating) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    // Placeholder for assistant response
    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      model: selectedModel === 'ollama' ? (selectedOllamaModel || 'Ollama') : selectedModel,
      content: '',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    setMessages([...updatedMessages, assistantMsg]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();

    try {
      if (selectedModel === 'ollama') {
        // Send to Ollama Local
        const ollamaTargetModel = selectedOllamaModel || (ollamaModels[0] || 'llama3');
        const res = await fetch(`${apiKeys.ollamaUrl || 'http://localhost:11434'}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            model: ollamaTargetModel,
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            stream: true
          })
        });

        if (!res.ok) throw new Error(`Ollama HTTP ${res.status}: Certifique-se de que o Ollama está rodando.`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.trim() !== '');
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                fullText += parsed.message.content;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
                );
              }
            } catch (_) {}
          }
        }
      } else if (selectedModel.startsWith('gemini')) {
        // Send to Google Gemini API
        const key = apiKeys.gemini;
        if (!key) {
          throw new Error('Chave de API do Gemini não configurada. Clique em Configurar API no topo para adicionar.');
        }

        const modelEndpoint = selectedModel.includes('2.0') ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:streamGenerateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortControllerRef.current.signal,
            body: JSON.stringify({
              contents: updatedMessages.map((m) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
              }))
            })
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Erro Gemini HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          // Gemini returns JSON array chunks or objects
          const clean = chunk.replace(/^\[|\],?$/g, '').trim();
          const jsonObjs = clean.split('\n,\n').map(s => s.trim()).filter(Boolean);

          for (const objStr of jsonObjs) {
            try {
              const parsed = JSON.parse(objStr);
              const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (textChunk) {
                fullText += textChunk;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
                );
              }
            } catch (_) {
              // Regex fallback for text pieces
              const match = objStr.match(/"text":\s*"([^"]+)"/);
              if (match && match[1]) {
                const unescaped = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                fullText += unescaped;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
                );
              }
            }
          }
        }
      } else {
        // DeepSeek / Generic OpenAI Compatible
        const key = apiKeys.deepseek;
        if (!key) {
          throw new Error('Chave de API do DeepSeek não configurada. Clique em Configurar API para adicionar.');
        }

        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
            stream: true
          })
        });

        if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
          for (const line of lines) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fullText } : m))
                );
              }
            } catch (_) {}
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + '\n\n*(Geração interrompida pelo usuário)*', isStreaming: false } : m))
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `❌ **Erro ao comunicar com a IA**: ${err.message}\n\n*Verifique sua chave de API ou se o Ollama está em execução.*`,
                  isStreaming: false
                }
              : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render format for code blocks and text
  const renderMessageContent = (content) => {
    if (!content) return <span className="animate-pulse text-zinc-500">Pensando...</span>;

    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={idx} className="my-3.5 rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
            <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900/80 border-b border-white/10 text-xs text-zinc-300">
              <span className="font-mono text-xs text-zinc-300 font-semibold">{lang || 'código'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-xs"
                title="Copiar código"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
            </div>
            <pre className="p-3.5 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed select-text">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <div key={idx} className="whitespace-pre-wrap select-text leading-relaxed">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#09090b] text-zinc-200 relative overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-[#09090b]/95 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 border border-white/15 text-sky-400 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Chat Nativo Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-mono font-bold">
                  Zero Webviews
                </span>
              </div>
              <span className="text-xs text-zinc-400 block">Ultra rápido · ~70MB RAM · Alta performance</span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/[0.08] mx-1" />

          {/* Model Selector */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08]">
            {DEFAULT_MODELS.map((mod) => {
              const isCur = selectedModel === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModel(mod.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCur
                      ? 'bg-zinc-800 text-white shadow-xs border border-white/10'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{mod.name}</span>
                  {mod.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold">
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedModel === 'ollama' && ollamaModels.length > 0 && (
            <select
              value={selectedOllamaModel}
              onChange={(e) => setSelectedOllamaModel(e.target.value)}
              className="bg-zinc-900 text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10 outline-none cursor-pointer"
            >
              {ollamaModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
            title="Configurar Chaves de API e Conexão"
          >
            <Key className="w-3.5 h-3.5 text-sky-400" />
            <span>Configurar API</span>
          </button>

          <button
            onClick={handleExportChat}
            disabled={messages.length === 0}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer disabled:opacity-30"
            title="Exportar conversa em Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="p-2 rounded-xl text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-30"
            title="Limpar Histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/15 text-sky-400 shadow-xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Bem-vindo ao Chat Nativo Studio</h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-md mx-auto">
                Converse diretamente com modelos sem a lentidão ou menus de páginas web. Zero anúncios, renderização de código limpa e resposta imediata.
              </p>
            </div>

            {/* Quick Prompt Starters */}
            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              {[
                { title: 'Explicar Arquitetura', prompt: 'Explique a diferença entre Webview e Chat Nativo em termos de performance e consumo de RAM.' },
                { title: 'Criar Componente React', prompt: 'Escreva um componente React limpo para um modal moderno com Tailwind CSS.' },
                { title: 'Otimizar Consulta SQL', prompt: 'Como posso otimizar consultas pesadas com junções complexas no PostgreSQL?' },
                { title: 'Revisão de Código', prompt: 'Revise este trecho de código procurando possíveis memory leaks e gargalos de performance.' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="p-3.5 text-left rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">{item.title}</div>
                  <div className="text-xs text-zinc-400 truncate mt-1">{item.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl mx-auto ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 border border-white/15 text-sky-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'bg-zinc-800 text-white border border-white/15 ml-auto'
                    : 'bg-zinc-900/95 text-zinc-100 border border-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2 text-xs text-zinc-400 font-mono">
                  <span className="font-semibold text-zinc-300">{m.role === 'user' ? 'Você' : m.model || 'Assistente'}</span>
                  <div className="flex items-center gap-2">
                    <span>{m.timestamp}</span>
                    <button
                      onClick={() => handleCopyMessage(m.content, idx)}
                      className="hover:text-white transition-colors cursor-pointer"
                      title="Copiar mensagem"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-sm leading-relaxed">{renderMessageContent(m.content)}</div>
              </div>

              {m.role === 'user' && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 border border-white/15 text-zinc-200 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-white/[0.08] bg-[#09090b] shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="relative flex items-end bg-zinc-900/90 rounded-2xl border border-white/10 focus-within:border-sky-500/50 transition-colors p-2.5 shadow-sm">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(160, e.target.scrollHeight) + 'px';
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Envie uma mensagem (Enter para enviar, Shift+Enter para nova linha)..."
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none max-h-40 py-1 px-2 leading-relaxed"
            />

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {isGenerating ? (
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
                  title="Parar geração"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim()}
                  className="flex items-center justify-center h-9 w-9 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:hover:bg-sky-600 text-white transition-colors cursor-pointer shadow-sm"
                  title="Enviar mensagem (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>
              Modelo ativo: <strong className="text-zinc-200">{selectedModel}</strong>
            </span>
            <span>Shift + Enter para quebra de linha</span>
          </div>
        </div>
      </div>

      {/* API Configuration Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-[#141418] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Configuração de APIs & Ollama</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Configure as chaves para usar o Studio Nativo. As chaves são armazenadas localmente no seu computador.
            </p>

            {/* Google Gemini Key */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Chave Google Gemini API (Grátis)</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Obter Grátis</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <input
                type="password"
                value={apiKeys.gemini || ''}
                onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-sky-500"
              />
              <span className="text-xs text-zinc-400 block">
                O Gemini 2.0 Flash possui plano 100% gratuito de 15 requisições por minuto.
              </span>
            </div>

            {/* Ollama Local URL */}
            <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Ollama Local (Offline / Grátis)</label>
                <span
                  className={`text-xs font-mono font-medium ${
                    ollamaStatus === 'online' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {ollamaStatus === 'online' ? `Online (${ollamaModels.length} modelos)` : 'Não detectado'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKeys.ollamaUrl || 'http://localhost:11434'}
                  onChange={(e) => setApiKeys({ ...apiKeys, ollamaUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500"
                />
                <button
                  onClick={checkOllama}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
                >
                  Testar
                </button>
              </div>
            </div>

            {/* DeepSeek API Key */}
            <div className="space-y-1 pt-2 border-t border-white/[0.06]">
              <label className="text-xs font-medium text-zinc-300">Chave DeepSeek API (Opcional)</label>
              <input
                type="password"
                value={apiKeys.deepseek || ''}
                onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
