import React from 'react';
import { AIIcon } from './AIIcon';

export function ProgressRing({
  account,
  isSelected,
  isRecommended,
  onClick,
  size = 56,
  strokeWidth = 4
}) {
  const percent = Math.min(100, Math.max(0, account.quotaPercent ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Colors based on status
  const getTheme = (p) => {
    if (p <= 15) {
      return {
        strokeStart: '#f43f5e',
        strokeEnd: '#fb7185',
        glow: 'rgba(244, 63, 94, 0.75)',
        text: 'text-rose-400'
      };
    }
    if (p <= 35) {
      return {
        strokeStart: '#f59e0b',
        strokeEnd: '#fbbf24',
        glow: 'rgba(245, 158, 11, 0.7)',
        text: 'text-amber-400'
      };
    }
    return {
      strokeStart: '#0284c7',
      strokeEnd: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.75)',
      text: 'text-sky-400'
    };
  };

  const theme = getTheme(percent);
  const gradId = `ring-grad-${account.id}`;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center transition-all duration-300 outline-none cursor-pointer ${
        isSelected ? 'scale-105' : 'hover:scale-105'
      }`}
      title={`${account.name} · ${account.provider} (${percent}% disponível)`}
    >
      {/* Smart Recommendation Pulse Indicator */}
      {isRecommended && (
        <span
          className="absolute -top-0.5 -right-0.5 z-30 flex h-3.5 w-3.5 items-center justify-center"
          title="Melhor conta para usar agora (IA sugerida)"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-md shadow-emerald-500/80 border border-white/60"></span>
        </span>
      )}

      {/* SVG Circular Ring with Neon Glow */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-all duration-500"
          style={{
            filter: isSelected
              ? `drop-shadow(0 0 10px ${theme.glow})`
              : `drop-shadow(0 0 5px ${theme.glow.replace('0.75', '0.3')})`
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.strokeStart} />
              <stop offset="100%" stopColor={theme.strokeEnd} />
            </linearGradient>
          </defs>

          {/* Track Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Dynamic Glowing Progress Fill */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Icon Disc */}
        <div
          className={`absolute rounded-full flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-b from-blue-900/70 to-slate-900/95 text-white shadow-inner border border-sky-400/50 ring-2 ring-sky-500/20'
              : 'bg-slate-950/85 text-slate-300 group-hover:text-white border border-white/10 group-hover:border-white/20'
          }`}
          style={{
            width: size - strokeWidth * 2.8,
            height: size - strokeWidth * 2.8
          }}
        >
          <AIIcon
            type={account.iconType || account.type}
            className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 drop-shadow"
          />
        </div>
      </div>

      {/* Percentage Typography Below the Ring (matching Resvori) */}
      <span
        className={`mt-1 text-xs font-mono font-bold tracking-tight transition-colors duration-200 ${
          isSelected ? 'text-white' : (percent <= 15 ? 'text-rose-400' : 'text-zinc-200 group-hover:text-white')
        }`}
        style={{
          textShadow: isSelected ? `0 0 8px ${theme.glow}` : '0 1px 2px rgba(0,0,0,0.9)'
        }}
      >
        {percent}%
      </span>
    </button>
  );
}
