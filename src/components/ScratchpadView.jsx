import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Copy,
  Check,
  Send,
  Trash2,
  Plus,
  Download,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wand2
} from 'lucide-react';
import { playNotificationSound } from '../utils/audio';

const defaultNotes = [
  {
    id: 'note-1',
    title: 'Rascunho de Prompt Principal',
    content: 'Atue como um arquiteto sênior de software especializado em React e Electron.\n\nObjetivo: Criar uma suíte desktop ultra responsiva e produtiva com foco em desenvolvedores.',
    updatedAt: new Date().toLocaleDateString('pt-BR')
  },
  {
    id: 'note-2',
    title: 'Anotações de Ideias & Tarefas',
    content: '- Comparar respostas do Claude 3.5 Sonnet com DeepSeek R1 para raciocínio lógico\n- Testar tokens de contexto longo no Gemini 2.0\n- Guardar prompts favoritos na biblioteca',
    updatedAt: new Date().toLocaleDateString('pt-BR')
  }
];

export function ScratchpadView({
  activeAccount,
  onSendToChat,
  onOpenOptimizer,
  onOpenArtifact
}) {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_hub_scratchpad_notes');
      return saved ? JSON.parse(saved) : defaultNotes;
    } catch {
      return defaultNotes;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState(() => notes[0]?.id || 'note-1');
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Voice Dictation
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Stop speech if switching notes
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeNoteId]);

  const handleUpdateContent = (content) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId
        ? {
            ...n,
            content,
            updatedAt: new Date().toLocaleDateString('pt-BR')
          }
        : n
    );
    setNotes(updated);
    try {
      localStorage.setItem('ai_hub_scratchpad_notes', JSON.stringify(updated));
      localStorage.setItem('ai_hub_scratchpad_content', content);
    } catch (_) {}
  };

  const handleUpdateTitle = (title) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId ? { ...n, title } : n
    );
    setNotes(updated);
    try { localStorage.setItem('ai_hub_scratchpad_notes', JSON.stringify(updated)); } catch (_) {}
  };

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      title: `Nova Nota ${notes.length + 1}`,
      content: '',
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNoteId(newNote.id);
    try { localStorage.setItem('ai_hub_scratchpad_notes', JSON.stringify(updated)); } catch (_) {}
  };

  const handleDeleteNote = (id) => {
    if (notes.length <= 1) return;
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    setActiveNoteId(filtered[0]?.id || '');
    try { localStorage.setItem('ai_hub_scratchpad_notes', JSON.stringify(filtered)); } catch (_) {}
  };

  const handleCopy = () => {
    if (!activeNote?.content) return;
    navigator.clipboard.writeText(activeNote.content);
    setIsCopied(true);
    playNotificationSound('broadcast');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSend = () => {
    if (!activeNote?.content) return;
    navigator.clipboard.writeText(activeNote.content);
    setIsSent(true);
    playNotificationSound('broadcast');
    if (onSendToChat) {
      onSendToChat(activeNote.content);
    }
    setTimeout(() => setIsSent(false), 2500);
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playNotificationSound('ready');
  };

  // Voice Dictation Toggle
  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        playNotificationSound('ready');
      };

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          handleUpdateContent((activeNote.content ? activeNote.content + ' ' : '') + transcript);
        }
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
      console.error(e);
      setIsListening(false);
    }
  };

  // Text to Speech
  const handleToggleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeNote?.content) return;

    const utterance = new SpeechSynthesisUtterance(activeNote.content);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Metrics
  const charCount = activeNote?.content?.length || 0;
  const wordCount = activeNote?.content?.trim() ? activeNote.content.trim().split(/\s+/).length : 0;
  const tokenEst = Math.round(charCount / 3.4);

  return (
    <div className="flex-1 h-full flex bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Sidebar: Notes List */}
      <div className="w-64 h-full bg-[#0b0f1e] border-r border-white/10 flex flex-col justify-between shrink-0">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Bloco de Notas
            </span>
          </div>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow cursor-pointer transition-all"
            title="Criar nova nota"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nota</span>
          </button>
        </div>

        {/* Note Thumbnails */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {notes.map((note) => {
            const isSelected = note.id === activeNoteId;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer group flex flex-col gap-1 border ${
                  isSelected
                    ? 'bg-blue-600/20 text-white border-blue-500/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold truncate group-hover:text-white">
                    {note.title || 'Sem título'}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">{note.updatedAt}</span>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 font-mono">
                  {note.content || 'Nota vazia...'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note Editor Area */}
      <div className="flex-1 h-full flex flex-col bg-[#070a14] overflow-hidden">
        {activeNote ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-[#0a0e1c] border-b border-white/10 gap-4 shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateTitle(e.target.value)}
                className="text-base font-bold text-white bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-colors flex-1"
                placeholder="Título da Nota..."
              />

              <div className="flex items-center gap-2">
                {/* Voice Dictation Button */}
                <button
                  onClick={handleToggleListening}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title={isListening ? 'Parar gravação de voz' : 'Ditar nota por voz (Microfone)'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isListening ? 'Gravando...' : 'Ditar'}</span>
                </button>

                {/* Text to Speech Button */}
                <button
                  onClick={handleToggleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isSpeaking
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title={isSpeaking ? 'Parar leitura de voz' : 'Ouvir nota em voz alta (TTS)'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? 'Pausar' : 'Ouvir'}</span>
                </button>

                {/* Prompt Optimizer link */}
                {onOpenOptimizer && (
                  <button
                    onClick={() => onOpenOptimizer(activeNote.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-medium transition-all cursor-pointer border border-purple-500/30"
                    title="Aprimorar este texto com Engenharia de Prompts"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Otimizar</span>
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors border border-white/10 cursor-pointer"
                  title="Baixar como arquivo Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>.md</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                  title="Copiar texto da nota"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-semibold transition-all shadow cursor-pointer active:scale-95"
                  title={`Copiar e enviar para o chat de ${activeAccount ? activeAccount.name : 'sua IA'}`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSent ? 'Enviado!' : `Enviar para ${activeAccount?.name || 'Chat'}`}</span>
                </button>

                {notes.length > 1 && (
                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                    title="Excluir esta nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateContent(e.target.value)}
                placeholder="Escreva seus prompts, rascunhos, tarefas ou códigos aqui... O conteúdo é salvo automaticamente."
                className="w-full flex-1 bg-transparent text-slate-200 text-sm font-mono leading-relaxed outline-none resize-none placeholder:text-slate-600"
              />
            </div>

            {/* Bottom Status & Metrics Bar */}
            <div className="px-6 py-2.5 bg-[#090d19] border-t border-white/10 flex items-center justify-between text-xs text-zinc-300 shrink-0">
              <div className="flex items-center gap-4">
                <span><strong>{charCount}</strong> caracteres</span>
                <span><strong>{wordCount}</strong> palavras</span>
                <span className="text-sky-400 font-mono">~<strong>{tokenEst}</strong> tokens</span>
              </div>
              <span className="text-xs text-zinc-400">Auto-salvo localmente</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Nenhuma nota selecionada.
          </div>
        )}
      </div>
    </div>
  );
}
