'use client';

import { Heart, Zap, UtensilsCrossed, Smile, Save } from 'lucide-react';
import { useStats, useKPIs, useDay, useTime, useSeason, useGameStore } from '@/stores/game-store';
import { getDaysUntilNextSeason, getSeasonProgress } from '@/config/seasons';

interface StatBarProps {
  icon: React.ReactNode;
  value: number;
  color: string;
  label: string;
}

function StatBar({ icon, value, color, label }: StatBarProps) {
  const isCritical = value < 20;
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <div className={`shrink-0 ${isCritical ? 'stat-critical' : ''}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="stat-bar">
          <div
            className={`stat-bar-fill ${isCritical ? 'stat-critical' : ''}`}
            style={{
              width: `${Math.max(0, Math.min(100, value))}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
      <span className="text-[10px] text-text-muted font-mono shrink-0 w-7 text-right">
        {Math.round(value)}
      </span>
    </div>
  );
}

function formatCash(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getUserInfo() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('duh_user') || localStorage.getItem('pryton_user');
    if (raw) return JSON.parse(raw);
    // Fallback: try Telegram WebApp
    const tg = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tg) return { username: tg.username || tg.first_name, telegram_id: tg.id, photo_url: tg.photo_url };
  } catch {}
  return null;
}

export function HUD() {
  const stats = useStats();
  const kpis = useKPIs();
  const day = useDay();
  const time = useTime();
  const season = useSeason();
  const daysLeft = getDaysUntilNextSeason(day);
  const progress = getSeasonProgress(day);
  const isSaving = useGameStore((s) => s.isSaving);
  const user = getUserInfo();

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm safe-area-top">
      {/* Top row — day, season, cash */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-text-primary">
            {String(day).padStart(3, '0')}
          </span>
          <span className="text-[10px] text-text-muted">{formatTime(time)}</span>
          {isSaving && (
            <Save className="w-3 h-3 text-text-muted animate-pulse" />
          )}
        </div>

        {/* Season badge */}
        <div className="flex items-center gap-1.5">
          <div
            className="px-2 py-0.5 border text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: season.theme.accentColor,
              borderColor: season.theme.accentColor,
              boxShadow: `2px 2px 0px ${season.theme.accentGlow}`,
              borderRadius: '10px',
            }}
          >
            {season.name}
          </div>
          <span className="text-[9px] text-text-muted font-mono">{daysLeft}д</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono neon-text-gold">₽{formatCash(kpis.cash)}</span>
          {user && (
            <div className="flex items-center gap-1.5">
              {user.photo_url ? (
                <img src={user.photo_url} alt="" className="w-5 h-5 rounded-full border border-white/20" />
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border border-white/20"
                  style={{ backgroundColor: season.theme.accentColor + '30', color: season.theme.accentColor }}
                >
                  {(user.username || user.telegram_first_name || '?')[0].toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Season progress bar (thin line) */}
      <div className="h-[2px] bg-white/5">
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: season.theme.accentColor,
            boxShadow: `0 0 6px ${season.theme.accentGlow}`,
          }}
        />
      </div>

      {/* Stat bars */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2">
        <StatBar icon={<Heart className="w-3 h-3 text-health" />} value={stats.health} color="var(--color-health)" label="HP" />
        <StatBar icon={<Zap className="w-3 h-3 text-energy" />} value={stats.energy} color="var(--color-energy)" label="EN" />
        <StatBar icon={<UtensilsCrossed className="w-3 h-3 text-hunger" />} value={stats.hunger} color="var(--color-hunger)" label="HN" />
        <StatBar icon={<Smile className="w-3 h-3 text-mood" />} value={stats.mood} color="var(--color-mood)" label="MD" />
      </div>
    </header>
  );
}
