'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, ChevronRight, Skull, Zap, ShoppingBag, Crosshair, Bike,
  Palette, Laptop, Mic, HeartPulse, Trash2, Dumbbell, FileText, Ear,
  Music, AlertTriangle, Shield,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';
import { getActionsByCategory } from '@/config/actions';
import { getCurrentSeason } from '@/config/seasons';
import { NPCEncounter } from '@/components/ui/NPCEncounter';

const ICON_MAP: Record<string, React.ElementType> = {
  'zap': Zap, 'shopping-bag': ShoppingBag, 'crosshair': Crosshair,
  'bike': Bike, 'palette': Palette, 'laptop': Laptop, 'mic': Mic,
  'heart-pulse': HeartPulse, 'trash-2': Trash2, 'dumbbell': Dumbbell,
  'file-text': FileText, 'ear': Ear, 'music': Music,
};

// Group actions by risk level for visual clarity
function getRiskLevel(actionId: string): 'safe' | 'risky' | 'dangerous' {
  const dangerous = ['hack_atm', 'alley_fight', 'shop_lift'];
  const risky = ['street_hustle', 'graffiti_bombing', 'eavesdrop'];
  if (dangerous.includes(actionId)) return 'dangerous';
  if (risky.includes(actionId)) return 'risky';
  return 'safe';
}

function getRiskColor(risk: 'safe' | 'risky' | 'dangerous'): string {
  if (risk === 'dangerous') return 'var(--color-danger)';
  if (risk === 'risky') return 'var(--color-warning)';
  return 'var(--color-neon-green)';
}

function getRiskLabel(risk: 'safe' | 'risky' | 'dangerous'): string {
  if (risk === 'dangerous') return 'ОПАСНО';
  if (risk === 'risky') return 'РИСК';
  return '';
}

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  meta: string;
  onClick: () => void;
  disabled?: boolean;
  index: number;
  risk: 'safe' | 'risky' | 'dangerous';
}

function ActionCard({ icon: Icon, title, meta, onClick, disabled, index, risk }: ActionCardProps) {
  const riskColor = getRiskColor(risk);
  const riskLabel = getRiskLabel(risk);

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.15 }}
      whileTap={{ scale: 0.97, x: 2, y: 2 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        card-street p-3 flex items-center gap-3 w-full text-left
        ${disabled ? 'opacity-30 pointer-events-none' : ''}
      `}
    >
      <div
        className="w-8 h-8 flex items-center justify-center shrink-0 border border-white/10"
        style={{ borderRadius: '10px' }}
      >
        <Icon className="w-4 h-4" style={{ color: 'var(--season-accent, #ff2d7b)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-text-primary truncate tracking-tight">{title}</p>
          {riskLabel && (
            <span
              className="text-[8px] font-bold px-1 py-0.5 uppercase tracking-wider shrink-0"
              style={{
                color: riskColor,
                border: `1px solid ${riskColor}`,
                borderRadius: '8px',
              }}
            >
              {riskLabel}
            </span>
          )}
        </div>
        <p className="text-[10px] text-text-muted truncate font-mono">{meta}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
    </motion.button>
  );
}

export function StreetView() {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const day = useGameStore((s) => s.state.day);
  const paths = useGameStore((s) => s.state.paths);
  const { executeAction } = useAction();

  const streetActions = getActionsByCategory('street');

  // Street danger level based on time of day and season
  const time = useGameStore((s) => s.state.time);
  const isNight = time >= 1260 || time < 360; // after 21:00 or before 06:00
  const dangerLevel = useMemo(() => {
    let danger = 1;
    if (isNight) danger += 2;
    if (season.id === 'winter') danger += 1; // winter = more anxiety = more danger
    if (season.id === 'spring') danger += 1; // mania = reckless = more risk
    if (stats.stability < 30) danger += 1;
    return Math.min(danger, 5);
  }, [isNight, season.id, stats.stability]);

  // Random street events on action
  const streetEvents = [
    'На углу кто-то читает фристайл. Район живёт.',
    'Граффити на стене: "Не сдавайся". Кто-то верит в тебя.',
    'Звук сирены вдали. Лучше не светиться.',
    'Бездомный кот трётся о ногу. Маленькая радость.',
    'Ветер несёт обрывки чьей-то музыки с крыши.',
    'Район затих. Слишком тихо для этого часа.',
  ];

  const handleAction = (actionId: string) => {
    setBusyAction(actionId);
    const success = executeAction(actionId);

    // Random flavor event
    if (success && Math.random() < 0.3) {
      setLastEvent(streetEvents[Math.floor(Math.random() * streetEvents.length)]);
      setTimeout(() => setLastEvent(null), 4000);
    }

    setTimeout(() => setBusyAction(null), success ? 500 : 200);
  };

  // Dominant path indicator
  const dominantPath = paths.music >= paths.chaos ? (paths.music >= paths.survival ? 'music' : 'survival') : (paths.chaos >= paths.survival ? 'chaos' : 'survival');
  const pathLabels = { music: 'Музыкант', chaos: 'Хаос', survival: 'Выживание' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* === LOCATION HEADER === */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: season.theme.accentColor,
            boxShadow: `0 0 16px ${season.theme.accentGlow}`,
            borderRadius: '10px',
          }}
        >
          <MapPin className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            УЛИЦА
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Район не спит. Возможности повсюду.
          </p>
        </div>
      </div>

      {/* === DANGER METER === */}
      <div className="manga-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span className="manga-label">Уровень опасности</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {isNight ? 'НОЧЬ' : 'ДЕНЬ'}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-2"
              style={{
                backgroundColor: i < dangerLevel
                  ? (dangerLevel >= 4 ? 'var(--color-danger)' : dangerLevel >= 2 ? 'var(--color-warning)' : 'var(--color-neon-green)')
                  : 'rgba(255,255,255,0.06)',
                borderRadius: '8px',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* === STREET STATUS (quick stats) === */}
      <div className="grid grid-cols-3 gap-2">
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">РЕСПЕКТ</p>
          <p className="text-xl font-bold font-mono mt-1" style={{ color: 'var(--color-neon-green)' }}>
            {kpis.respect}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">ПУТЬ</p>
          <p className="text-[11px] font-bold mt-2" style={{ color: season.theme.accentColor }}>
            {pathLabels[dominantPath]}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">СТАБИЛЬН.</p>
          <p
            className="text-xl font-bold font-mono mt-1"
            style={{
              color: stats.stability < 30 ? 'var(--color-danger)' : 'var(--color-neon-cyan)',
            }}
          >
            {Math.round(stats.stability)}
          </p>
        </div>
      </div>

      {/* === RANDOM EVENT BUBBLE === */}
      {lastEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="speech-bubble p-3"
        >
          <p className="text-[11px] text-text-secondary italic">
            {lastEvent}
          </p>
        </motion.div>
      )}

      {/* === SEASON DIVIDER === */}
      <div className="chapter-divider">
        <span>{season.subtitle}</span>
      </div>

      {/* === NPC ENCOUNTERS === */}
      <NPCEncounter location="street" />

      {/* === ACTIONS === */}
      <div>
        {/* Safe actions */}
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-3.5 h-3.5 text-neon-green" />
          <h2 className="manga-label">Работа и музыка</h2>
        </div>
        <div className="space-y-1.5 mb-4">
          {streetActions
            .filter(a => getRiskLevel(a.id) === 'safe')
            .map((action, i) => {
              const IconComp = ICON_MAP[action.icon] || Skull;
              return (
                <ActionCard
                  key={action.id}
                  icon={IconComp}
                  title={action.title}
                  meta={action.meta}
                  onClick={() => handleAction(action.id)}
                  disabled={busyAction === action.id}
                  index={i}
                  risk="safe"
                />
              );
            })}
        </div>

        {/* Risky actions */}
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
          <h2 className="manga-label">Рискованные дела</h2>
        </div>
        <div className="space-y-1.5 mb-4">
          {streetActions
            .filter(a => getRiskLevel(a.id) === 'risky')
            .map((action, i) => {
              const IconComp = ICON_MAP[action.icon] || Skull;
              return (
                <ActionCard
                  key={action.id}
                  icon={IconComp}
                  title={action.title}
                  meta={action.meta}
                  onClick={() => handleAction(action.id)}
                  disabled={busyAction === action.id}
                  index={i}
                  risk="risky"
                />
              );
            })}
        </div>

        {/* Dangerous actions */}
        <div className="flex items-center gap-2 mb-3">
          <Crosshair className="w-3.5 h-3.5 text-danger" />
          <h2 className="manga-label">Тёмные дела</h2>
        </div>
        <div className="space-y-1.5">
          {streetActions
            .filter(a => getRiskLevel(a.id) === 'dangerous')
            .map((action, i) => {
              const IconComp = ICON_MAP[action.icon] || Skull;
              return (
                <ActionCard
                  key={action.id}
                  icon={IconComp}
                  title={action.title}
                  meta={action.meta}
                  onClick={() => handleAction(action.id)}
                  disabled={busyAction === action.id}
                  index={i}
                  risk="dangerous"
                />
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}
