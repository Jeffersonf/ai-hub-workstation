import React from 'react';

export function AIIcon({ type = 'openai', className = 'w-5 h-5' }) {
  const normalized = (type || '').toLowerCase();

  // Claude / Anthropic
  if (normalized.includes('claude') || normalized.includes('anthropic')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="claudeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <path
          d="M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2Z"
          fill="url(#claudeGrad)"
        />
        <circle cx="18" cy="5" r="1.5" fill="#f59e0b" />
        <circle cx="6" cy="18" r="1.5" fill="#ea580c" />
      </svg>
    );
  }

  // Google Gemini
  if (normalized.includes('gemini') || normalized.includes('google')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <path
          d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
          fill="url(#geminiGrad)"
        />
      </svg>
    );
  }

  // DeepSeek
  if (normalized.includes('deepseek')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="deepseekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path
          d="M4.5 13.5C4.5 9.5 8 6 12.5 6C17 6 20.5 9 20.5 13C20.5 15.5 19 17.5 16.5 18.5L18.5 20.5L15 20C14.2 20.3 13.4 20.5 12.5 20.5C8 20.5 4.5 17.5 4.5 13.5Z"
          stroke="url(#deepseekGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="12" r="1.5" fill="#06b6d4" />
        <path d="M14 15C13.5 15.5 12.5 16 11.5 16" stroke="url(#deepseekGrad)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Perplexity
  if (normalized.includes('perplexity')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="pplxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <path
          d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M4.93 19.07L19.07 4.93"
          stroke="url(#pplxGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Grok / xAI
  if (normalized.includes('grok') || normalized.includes('xai')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="grokGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="url(#grokGrad)"
        />
      </svg>
    );
  }

  // Microsoft Copilot
  if (normalized.includes('copilot') || normalized.includes('microsoft')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <defs>
          <linearGradient id="copilotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path
          d="M16.5 6.5C18.5 8.5 19 12 17.5 14.5L12 20L6.5 14.5C5 12 5.5 8.5 7.5 6.5C9.5 4.5 13 4 15 5.5L12 8.5"
          stroke="url(#copilotGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="2.5" fill="url(#copilotGrad)" />
      </svg>
    );
  }

  // Mistral AI
  if (normalized.includes('mistral')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <rect x="3" y="3" width="4" height="18" fill="#f97316" rx="1" />
        <rect x="9" y="8" width="4" height="13" fill="#fb923c" rx="1" />
        <rect x="15" y="5" width="4" height="16" fill="#ea580c" rx="1" />
      </svg>
    );
  }

  // Google AI Studio
  if (normalized.includes('aistudio')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="9" stroke="#60a5fa" strokeWidth="2" />
        <path d="M12 7v10M7 12h10" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: OpenAI / ChatGPT / Codex
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="openaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M19.5 12.5a4.5 4.5 0 0 0-4.5-4.5h-.7a4.5 4.5 0 0 0-7.8-2.6 4.5 4.5 0 0 0-4.5 4.5v.7a4.5 4.5 0 0 0 2.6 7.8 4.5 4.5 0 0 0 6.4 2.6 4.5 4.5 0 0 0 5.9-4v-.7a4.5 4.5 0 0 0 2.6-3.8z"
        stroke="url(#openaiGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="url(#openaiGrad)" />
    </svg>
  );
}
