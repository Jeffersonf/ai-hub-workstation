import React, { useState, useRef } from 'react';
import { Copy, Check, RotateCw, Columns2 } from 'lucide-react';
import { AIIcon } from './AIIcon';

export function SplitViewWorkspace({ accounts }) {
  const [leftId, setLeftId] = useState(accounts[0]?.id || '');
  const [rightId, setRightId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [promptText, setPromptText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const leftAccount = accounts.find((a) => a.id === leftId);
  const rightAccount = accounts.find((a) => a.id === rightId);

  const handleCopy = () => {
    if (!promptText.trim()) return;
    navigator.clipboard.writeText(promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#080c16] overflow-hidden">
      {/* Header Bar with Prompt Broadcaster */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1222] border-b border-white/10 select-none gap-4">
        {/* Left Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-sky-400">Esquerda:</span>
          <select
            value={leftId}
            onChange={(e) => setLeftId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium border border-white/10 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.provider})
              </option>
            ))}
          </select>
          <button
            onClick={() => leftRef.current?.reload()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors"
            title="Recarregar"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Prompt Broadcaster Box */}
        <div className="flex-1 max-w-lg flex items-center gap-2 bg-black/50 border border-white/10 rounded-2xl px-3.5 py-1.5">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
            placeholder="Digite sua dúvida para testar em ambas as IAs..."
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-zinc-500"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copiar Pergunta
              </>
            )}
          </button>
        </div>

        {/* Right Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400">Direita:</span>
          <select
            value={rightId}
            onChange={(e) => setRightId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-medium border border-white/10 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.provider})
              </option>
            ))}
          </select>
          <button
            onClick={() => rightRef.current?.reload()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors"
            title="Recarregar"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dual Webview Split 50/50 */}
      <div className="flex-1 flex w-full h-full">
        {/* Left Webview */}
        <div className="flex-1 h-full relative border-r border-white/10 bg-black">
          {leftAccount && (
            <webview
              key={leftAccount.id}
              ref={leftRef}
              src={leftAccount.url || 'https://chatgpt.com'}
              partition={`persist:${leftAccount.id}`}
              className="w-full h-full border-none"
              allowpopups="true"
            />
          )}
        </div>

        {/* Right Webview */}
        <div className="flex-1 h-full relative bg-black">
          {rightAccount && (
            <webview
              key={rightAccount.id}
              ref={rightRef}
              src={rightAccount.url || 'https://claude.ai'}
              partition={`persist:${rightAccount.id}`}
              className="w-full h-full border-none"
              allowpopups="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}
