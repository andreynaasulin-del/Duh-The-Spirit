'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Music, ChevronRight, Mic, SlidersHorizontal, Mic2, Swords, Users,
  ShoppingCart, Video, PartyPopper, Shirt, Star, Disc3, TrendingUp,
} from 'lucide-react';
import { useGameStore, useStats, useKPIs, useSeason } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';
import { getActionsByCategory } from '@/config/actions';
import { NPCEncounter } from '@/components/ui/NPCEncounter';

const ICON_MAP: Record<string, React.ElementType> = {
  'mic': Mic, 'sliders': SlidersHorizontal, 'mic-2': Mic2,
  'swords': Swords, 'users': Users, 'shopping-cart': ShoppingCart,
  'video': Video, 'party-popper': PartyPopper, 'shirt': Shirt,
};

type ClubTab = 'studio' | 'stage' | 'vip';

const TABS: { id: ClubTab; label: string; icon: React.ElementType }[] = [
  { id: 'studio', label: 'СТУДИЯ', icon: Disc3 },
  { id: 'stage', label: 'СЦЕНА', icon: Mic },
  { id: 'vip', label: 'VIP', icon: Star },
];

const TAB_ACTIONS: Record<ClubTab, string[]> = {
  studio: ['record_track', 'mix_master', 'buy_beat', 'shoot_video'],
  stage: ['open_mic', 'rap_battle_club', 'freestyle_battle'],
  vip: ['network_producers', 'club_party', 'sell_merch'],
};

interface ActionCardProps {
  icon: React.ElementType;
  title: string;
  meta: string;
  onClick: () => void;
  disabled?: boolean;
  index: number;
}

function ActionCard({ icon: Icon, title, meta, onClick, disabled, index }: ActionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.15 }}
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
        <p className="text-sm font-bold text-text-primary truncate tracking-tight">{title}</p>
        <p className="text-[10px] text-text-muted truncate font-mono">{meta}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
    </motion.button>
  );
}

export function ClubView() {
  const [activeTab, setActiveTab] = useState<ClubTab>('studio');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const stats = useStats();
  const kpis = useKPIs();
  const season = useSeason();
  const { executeAction } = useAction();

  const allClubActions = getActionsByCategory('club');
  // Include street freestyle in stage tab
  const allActions = [...allClubActions, ...getActionsByCategory('street').filter(a => a.id === 'freestyle_battle')];
  const tabActionIds = TAB_ACTIONS[activeTab];
  const visibleActions = tabActionIds
    .map(id => allActions.find(a => a.id === id))
    .filter(Boolean) as typeof allActions;

  const handleAction = (actionId: string) => {
    setBusyAction(actionId);
    executeAction(actionId);
    setTimeout(() => setBusyAction(null), 500);
  };

  // Music career level based on releases and respect
  const careerLevel = Math.min(10, Math.floor((kpis.releases * 2 + kpis.respect) / 10));
  const careerLabels = ['Никто', 'Новичок', 'Битмейкер', 'Андер', 'Локал', 'Городской', 'Региональный', 'Федеральный', 'Звезда', 'Легенда', 'GOAT'];

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
          <Music className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            КЛУБ
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Студия, сцена, связи. Твой путь к звёздам.
          </p>
        </div>
      </div>

      {/* === CAREER STATUS === */}
      <div className="manga-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: season.theme.accentColor }} />
            <span className="manga-label">Музыкальная карьера</span>
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: season.theme.accentColor }}>
            LVL {careerLevel}
          </span>
        </div>
        {/* Career progress bar */}
        <div className="w-full h-2 bg-white/5 mb-2" style={{ borderRadius: '8px' }}>
          <motion.div
            className="h-full"
            style={{
              width: `${(careerLevel / 10) * 100}%`,
              background: `linear-gradient(90deg, ${season.theme.accentColor}, ${season.theme.accentGlow})`,
              borderRadius: '8px',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(careerLevel / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs font-bold text-text-secondary text-center tracking-widest">
          {careerLabels[careerLevel]}
        </p>
      </div>

      {/* === QUICK STATS === */}
      <div className="grid grid-cols-3 gap-2">
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">РЕЛИЗЫ</p>
          <p className="text-xl font-bold font-mono mt-1" style={{ color: 'var(--color-neon-cyan)' }}>
            {kpis.releases}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">ФАНАТЫ</p>
          <p className="text-xl font-bold font-mono mt-1" style={{ color: 'var(--color-neon-green)' }}>
            {kpis.subscribers >= 1000 ? `${(kpis.subscribers / 1000).toFixed(1)}K` : kpis.subscribers}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">РЕСПЕКТ</p>
          <p className="text-xl font-bold font-mono mt-1" style={{ color: season.theme.accentColor }}>
            {kpis.respect}
          </p>
        </div>
      </div>

      {/* === TABS === */}
      <div className="flex gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold tracking-wider transition-all"
              style={{
                borderBottom: active ? `2px solid ${season.theme.accentColor}` : '2px solid transparent',
                color: active ? season.theme.accentColor : 'var(--color-text-muted)',
                opacity: active ? 1 : 0.5,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* === SEASON DIVIDER === */}
      <div className="chapter-divider">
        <span>{season.subtitle}</span>
      </div>

      {/* === NPC ENCOUNTERS === */}
      <NPCEncounter location="club" />

      {/* === ACTIONS === */}
      <div className="space-y-1.5">
        {visibleActions.map((action, i) => {
          const IconComp = ICON_MAP[action.icon] || Music;
          return (
            <ActionCard
              key={action.id}
              icon={IconComp}
              title={action.title}
              meta={action.meta}
              onClick={() => handleAction(action.id)}
              disabled={busyAction === action.id}
              index={i}
            />
          );
        })}
      </div>

      {/* Season bonus hint */}
      {season.id === 'spring' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="manga-panel p-3 text-center"
          style={{ borderColor: season.theme.accentColor }}
        >
          <p className="text-[11px] font-bold" style={{ color: season.theme.accentColor }}>
            МАНИЯ — ТВОРЧЕСКИЙ БОНУС x2
          </p>
          <p className="text-[10px] text-text-muted mt-1">
            Весенний сезон удваивает респект от музыки
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
