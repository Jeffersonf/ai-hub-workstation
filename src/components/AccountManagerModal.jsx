import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sliders, Shield, Download, Upload, Sparkles, Volume2, VolumeX, ArrowUp, ArrowDown } from 'lucide-react';
import { AIIcon } from './AIIcon';
import { playNotificationSound } from '../utils/audio';

const presets = [
  {
    name: 'ChatGPT Plus',
    provider: 'OpenAI · GPT-4o / o3',
    type: 'openai',
    iconType: 'openai',
    url: 'https://chatgpt.com',
    quotaPeriod: '3h',
    periodLabel: 'Ciclo 3h',
    renewalHours: 3
  },
  {
    name: 'Claude Pro',
    provider: 'Anthropic · Claude 3.5',
    type: 'claude',
    iconType: 'claude',
    url: 'https://claude.ai',
    quotaPeriod: '5h',
    periodLabel: 'Ciclo 5h',
    renewalHours: 5
  },
  {
    name: 'DeepSeek Chat',
    provider: 'DeepSeek · V3 / R1',
    type: 'deepseek',
    iconType: 'deepseek',
    url: 'https://chat.deepseek.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Google Gemini',
    provider: 'Google · Gemini 2.0',
    type: 'gemini',
    iconType: 'gemini',
    url: 'https://gemini.google.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Perplexity Pro',
    provider: 'Perplexity AI',
    type: 'perplexity',
    iconType: 'perplexity',
    url: 'https://www.perplexity.ai',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Grok 2 / 3',
    provider: 'xAI · Grok',
    type: 'grok',
    iconType: 'grok',
    url: 'https://grok.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Mistral Le Chat',
    provider: 'Mistral AI · Large 2',
    type: 'mistral',
    iconType: 'mistral',
    url: 'https://chat.mistral.ai',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Google AI Studio',
    provider: 'Google Cloud · Gemini 2.0 Flash',
    type: 'gemini',
    iconType: 'aistudio',
    url: 'https://aistudio.google.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  },
  {
    name: 'Microsoft Copilot',
    provider: 'Microsoft · GPT-4',
    type: 'copilot',
    iconType: 'copilot',
    url: 'https://copilot.microsoft.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    renewalHours: 24
  }
];

export function AccountManagerModal({
  isOpen,
  onClose,
  accounts,
  onSaveAccounts,
  settings,
  onSaveSettings
}) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'OpenAI · Codex',
    type: 'openai',
    url: 'https://chatgpt.com',
    quotaPeriod: '3h',
    periodLabel: 'Ciclo 3h',
    quotaPercent: 100,
    renewalDays: 0,
    renewalHours: 3,
    renewalTotalMinutes: 180,
    checkIntervalSec: 60,
    iconType: 'openai'
  });

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId('new');
    setFormData({
      id: `acc-${Date.now()}`,
      name: `Conta ${accounts.length + 1}`,
      provider: 'ChatGPT Plus',
      type: 'openai',
      url: 'https://chatgpt.com',
      quotaPeriod: '3h',
      periodLabel: 'Ciclo 3h',
      quotaPercent: 100,
      renewalDays: 0,
      renewalHours: 3,
      renewalTotalMinutes: 180,
      checkIntervalSec: 60,
      lastChecked: new Date().toLocaleTimeString('pt-BR'),
      iconType: 'openai'
    });
  };

  const handleApplyPreset = (p) => {
    setFormData((prev) => ({
      ...prev,
      name: `${p.name} ${accounts.length + 1}`,
      provider: p.provider,
      type: p.type,
      iconType: p.iconType,
      url: p.url,
      quotaPeriod: p.quotaPeriod,
      periodLabel: p.periodLabel,
      renewalHours: p.renewalHours,
      renewalTotalMinutes: p.renewalHours * 60
    }));
  };

  const handleEdit = (acc) => {
    setEditingId(acc.id);
    setFormData({ ...acc });
  };

  const handleDelete = (id) => {
    const filtered = accounts.filter((a) => a.id !== id);
    onSaveAccounts(filtered);
    if (editingId === id) setEditingId(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const next = [...accounts];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onSaveAccounts(next);
  };

  const handleMoveDown = (index) => {
    if (index === accounts.length - 1) return;
    const next = [...accounts];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onSaveAccounts(next);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    let updated;
    if (editingId === 'new') {
      updated = [...accounts, { ...formData, id: `acc-${Date.now()}` }];
    } else {
      updated = accounts.map((a) => (a.id === editingId ? { ...formData } : a));
    }
    onSaveAccounts(updated);
    setEditingId(null);
  };

  const handleExportBackup = () => {
    const dataStr = JSON.stringify({ accounts, settings, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed.accounts)) {
          onSaveAccounts(parsed.accounts);
        }
        if (parsed.settings) {
          onSaveSettings(parsed.settings);
        }
        alert('Backup importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo: formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl p-6 shadow-2xl flex flex-col border border-white/15">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configurações & Contas</h2>
              <p className="text-xs text-slate-400">Adicione, edite ou remova suas contas de IA e faça backups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Action Bar (Add & Backup) */}
          <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Conta</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors border border-white/10 cursor-pointer"
                title="Exportar backup em formato JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs transition-colors border border-white/10 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* Form when adding/editing */}
          {editingId && (
            <form onSubmit={handleSaveForm} className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  {editingId === 'new' ? 'Nova Conta' : 'Editar Conta'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Presets:</span>
                  <div className="flex gap-1.5 overflow-x-auto max-w-sm">
                    {presets.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white whitespace-nowrap cursor-pointer transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-sm">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1 text-xs">Nome da Conta (Apelido)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1 text-xs">Provedor / Modelo</label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-zinc-300 font-medium mb-1 text-xs">URL de Acesso</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ciclo de Renovação (Horas)</label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={formData.renewalHours || 3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        renewalHours: parseInt(e.target.value, 10),
                        renewalTotalMinutes: parseInt(e.target.value, 10) * 60
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ícone</label>
                  <select
                    value={formData.iconType || formData.type}
                    onChange={(e) => setFormData({ ...formData, iconType: e.target.value, type: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="openai">OpenAI / ChatGPT</option>
                    <option value="claude">Claude / Anthropic</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="perplexity">Perplexity AI</option>
                    <option value="grok">Grok / xAI</option>
                    <option value="mistral">Mistral AI</option>
                    <option value="copilot">Microsoft Copilot</option>
                    <option value="aistudio">Google AI Studio</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          )}

          {/* Account List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contas Ativas ({accounts.length})
            </h3>

            {accounts.map((acc, index) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Mover para cima (Ctrl + atalho anterior)"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === accounts.length - 1}
                      onClick={() => handleMoveDown(index)}
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Mover para baixo (Ctrl + próximo atalho)"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/10">
                    <AIIcon type={acc.iconType || acc.type} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>{acc.name}</span>
                      <kbd className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 font-mono font-medium">
                        Ctrl+{index + 1}
                      </kbd>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {acc.provider} &middot; <span className="text-sky-400">{acc.url}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(acc)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Excluir conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* System Preferences */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Preferências do Sistema & Atalhos Globais
            </h3>

            <div className="space-y-2.5 text-sm">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block text-sm">Iniciar com o Windows</span>
                  <span className="text-xs text-zinc-400">Abrir a workstation automaticamente ao ligar o PC</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings?.openAtLogin}
                  onChange={(e) => {
                    const next = { ...settings, openAtLogin: e.target.checked };
                    onSaveSettings(next);
                    if (window.electronAPI?.setOpenAtLogin) {
                      window.electronAPI.setOpenAtLogin(e.target.checked);
                    }
                  }}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <span className="font-semibold text-white block text-sm">Efeitos Sonoros Sintéticos</span>
                  <span className="text-xs text-zinc-400">Sons sutis de notificação de cota liberada e envio</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playNotificationSound('chime')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-sky-300 text-xs font-semibold border border-blue-500/30 cursor-pointer"
                  >
                    Testar Som
                  </button>
                  <input
                    type="checkbox"
                    checked={settings?.soundEnabled !== false}
                    onChange={(e) => onSaveSettings({ ...settings, soundEnabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block text-sm">Notificações Nativas do Windows</span>
                  <span className="text-xs text-zinc-400">Avisos no Windows quando o ciclo de cota resetar</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.notificationsEnabled !== false}
                  onChange={(e) => onSaveSettings({ ...settings, notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-sky-300 flex items-center justify-between">
                <span>Atalho Global no Windows:</span>
                <kbd className="px-2.5 py-1 rounded bg-black/50 border border-white/10 font-mono text-white text-xs">
                  Ctrl + Alt + Space
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
