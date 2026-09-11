import React, { useState, useRef } from 'react';
import {
  LayoutGrid,
  Copy,
  Check,
  Send,
  RotateCw,
  ExternalLink,
  Columns2,
  Sparkles,
  Mic,
  MicOff,
  FileCode,
  UploadCloud
} from 'lucide-react';
import { AIIcon } from './AIIcon';
import { playNotificationSound } from '../utils/audio';
import { ResponseCompareModal } from './ResponseCompareModal';

export function MultiGridView({ accounts }) {
  const [layoutMode, setLayoutMode] = useState('2'); // '2', '3', '4'
  const [promptText, setPromptText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isBroadcasted, setIsBroadcasted] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // File drag & drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Compare Studio modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [scrapedTextA, setScrapedTextA] = useState('');
  const [scrapedTextB, setScrapedTextB] = useState('');

  // References to active webviews in the grid
  const webviewSlotRefs = useRef({});

  // Selected accounts for grid
  const [gridAccountIds, setGridAccountIds] = useState([
    accounts[0]?.id || '',
    accounts[1]?.id || '',
    accounts[2]?.id || '',
    accounts[3]?.id || ''
  ]);

  const handleAccountChange = (slotIndex, newId) => {
    const next = [...gridAccountIds];
    next[slotIndex] = newId;
    setGridAccountIds(next);
  };

  const handleCopyPrompt = () => {
    if (!promptText.trim()) return;
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const saveToPromptHistory = (text) => {
    if (!text || !text.trim()) return;
    try {
      const saved = localStorage.getItem('ai_hub_prompt_history');
      const list = saved ? JSON.parse(saved) : [];
      const newItem = {
        id: `hist-${Date.now()}`,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('pt-BR'),
        starred: false
      };
      const updated = [newItem, ...list.filter((x) => x.text !== text.trim())].slice(0, 100);
      localStorage.setItem('ai_hub_prompt_history', JSON.stringify(updated));
    } catch (_) {}
  };

  const handleBroadcastPrompt = () => {
    if (!promptText.trim()) return;

    // 1. Copy to clipboard
    navigator.clipboard.writeText(promptText);
    setIsBroadcasted(true);
    setTimeout(() => setIsBroadcasted(false), 2500);

    // 2. Save to history
    saveToPromptHistory(promptText);

    // 3. Play modern chirp sound
    playNotificationSound('broadcast');

    // 4. Script to inject into chat inputs
    const injectionScript = `
      (function() {
        const text = ${JSON.stringify(promptText)};
        const el = document.querySelector('#prompt-textarea') || 
                   document.querySelector('div[contenteditable="true"]') || 
                   document.querySelector('textarea') || 
                   document.querySelector('[role="textbox"]');
        if (el) {
          el.focus();
          if (el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'input') {
            el.value = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (el.isContentEditable) {
            el.innerText = text;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })();
    `;

    // 5. Run on all active grid webviews
    const activeCount = parseInt(layoutMode, 10);
    for (let i = 0; i < activeCount; i++) {
      const wv = webviewSlotRefs.current[i];
      if (wv && typeof wv.executeJavaScript === 'function') {
        try {
          wv.executeJavaScript(injectionScript).catch(() => {});
        } catch (_) {}
      }
    }
  };

  // Speech to text toggle
  const handleToggleSpeech = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Reconhecimento de voz não suportado pelo ambiente atual.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRec();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          playNotificationSound('broadcast');
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((r) => r[0].transcript)
            .join('');
          setPromptText(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  // File Drop handler to auto-read code/text with safe size guard
  const handleDropFile = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    // Safety guard: max 2MB to prevent freezing React state and IPC payload
    if (file.size > 2 * 1024 * 1024) {
      alert(`O arquivo "${file.name}" possui ${(file.size / (1024 * 1024)).toFixed(1)} MB. O limite para evitar travamento da janela é de 2 MB.`);
      playNotificationSound('limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const formatted = `Analise o arquivo "${file.name}":\n\n\`\`\`${file.name.split('.').pop() || ''}\n${content}\n\`\`\``;
      setPromptText((prev) => (prev ? `${prev}\n\n${formatted}` : formatted));
      playNotificationSound('ready');
    };
    reader.readAsText(file);
  };

  const handleOpenCompare = async () => {
    const extractScript = `
      (function() {
        const gpt = document.querySelectorAll('[data-message-author-role="assistant"]');
        if (gpt.length > 0) return gpt[gpt.length - 1].innerText;
        const claude = document.querySelectorAll('.font-claude-message, [data-is-streaming="false"]');
        if (claude.length > 0) return claude[claude.length - 1].innerText;
        const ds = document.querySelectorAll('.ds-markdown, [class*="chat-message-assistant"]');
        if (ds.length > 0) return ds[ds.length - 1].innerText;
        const gemini = document.querySelectorAll('.model-response-text, message-content');
        if (gemini.length > 0) return gemini[gemini.length - 1].innerText;
        return '';
      })();
    `;

    let text0 = '';
    let text1 = '';
    const wv0 = webviewSlotRefs.current[0];
    const wv1 = webviewSlotRefs.current[1];

    if (wv0 && typeof wv0.executeJavaScript === 'function') {
      try { text0 = await wv0.executeJavaScript(extractScript); } catch (_) {}
    }
    if (wv1 && typeof wv1.executeJavaScript === 'function') {
      try { text1 = await wv1.executeJavaScript(extractScript); } catch (_) {}
    }

    setScrapedTextA(text0 || '');
    setScrapedTextB(text1 || '');
    setIsCompareOpen(true);
  };

  const handleReloadSlot = (slotIdx) => {
    const wv = webviewSlotRefs.current[slotIdx];
    if (wv && typeof wv.reload === 'function') {
      wv.reload();
    }
  };

  const activeCount = parseInt(layoutMode, 10);
  const activeSlots = gridAccountIds.slice(0, activeCount);

  const getGridClass = () => {
    if (layoutMode === '2') return 'grid-cols-2';
    if (layoutMode === '3') return 'grid-cols-3';
    return 'grid-cols-2 grid-rows-2';
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#070a14] overflow-hidden">
      {/* Header with Prompt Broadcaster, Mic Dictation & Layout Switcher */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0b0e1c] border-b border-white/10 select-none gap-3">
        {/* Layout Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setLayoutMode('2')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              layoutMode === '2' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            2 IAs
          </button>
          <button
            onClick={() => setLayoutMode('3')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              layoutMode === '3' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            3 IAs
          </button>
          <button
            onClick={() => setLayoutMode('4')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              layoutMode === '4' ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            4 IAs (2x2)
          </button>
        </div>

        {/* Center: Prompt Broadcaster Box with Speech & Drag-Drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDropFile}
          className={`flex-1 max-w-2xl flex items-center gap-2 bg-black/60 border rounded-2xl px-3.5 py-1.5 shadow-inner transition-colors ${
            isDraggingFile ? 'border-sky-400 bg-sky-500/10' : 'border-white/10'
          }`}
        >
          {/* Mic Button */}
          <button
            onClick={handleToggleSpeech}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isListening ? 'Parar gravação de voz' : 'Ditar pergunta por voz (Speech-to-Text)'}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBroadcastPrompt()}
            placeholder={
              isListening
                ? 'Escutando sua voz... Fale agora!'
                : 'Digite ou arraste um arquivo de código para disparar em todas as IAs...'
            }
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-slate-500"
          />

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyPrompt}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copiar para área de transferência"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleBroadcastPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
            >
              {isBroadcasted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Injetado nas {activeCount} IAs!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar para Todas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Actions: Compare Studio & Layout Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenCompare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Comparar lado a lado as respostas geradas"
          >
            <Columns2 className="w-4 h-4" />
            <span>Comparar Respostas</span>
          </button>

          <div className="text-xs text-zinc-400 font-mono hidden xl:block">
            <span className="text-sky-400 font-bold">{layoutMode} Telas</span>
          </div>
        </div>
      </div>

      {/* Grid of WebViews */}
      <div className={`flex-1 grid ${getGridClass()} w-full h-full divide-x divide-y divide-white/10`}>
        {activeSlots.map((accId, slotIdx) => {
          const acc = accounts.find((a) => a.id === accId) || accounts[slotIdx % accounts.length];

          return (
            <div key={`slot-${slotIdx}`} className="h-full flex flex-col relative bg-black">
              {/* Slot Header */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#0a0d18] border-b border-white/10 select-none">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-white">
                    <AIIcon type={acc?.iconType || acc?.type} className="w-4 h-4" />
                  </div>
                  <select
                    value={acc?.id}
                    onChange={(e) => handleAccountChange(slotIdx, e.target.value)}
                    className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                        {a.name} ({a.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReloadSlot(slotIdx)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Recarregar esta IA"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    {acc?.quotaPercent}%
                  </div>
                </div>
              </div>

              {/* WebView */}
              <div className="flex-1 w-full h-full relative">
                {acc && (
                  <webview
                    ref={(el) => {
                      if (el) webviewSlotRefs.current[slotIdx] = el;
                    }}
                    key={acc.id}
                    src={acc.url || 'https://chatgpt.com'}
                    partition={`persist:${acc.id}`}
                    className="w-full h-full border-none"
                    allowpopups="true"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Response Compare Modal */}
      <ResponseCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        accounts={accounts}
        initialSlotA={gridAccountIds[0]}
        initialSlotB={gridAccountIds[1]}
        initialTextA={scrapedTextA}
        initialTextB={scrapedTextB}
      />
    </div>
  );
}
