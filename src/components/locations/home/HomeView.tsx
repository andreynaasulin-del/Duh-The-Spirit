'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Coffee, Dumbbell, Sparkles, Wrench, ChevronRight, Skull,
  Brain, Mic2, Tv, FlaskConical, Wind, Smartphone, Edit3, Phone,
} from 'lucide-react';
import { useKPIs, useHome, useGameStore, useSeason } from '@/stores/game-store';
import { useAction } from '@/hooks/useAction';
import { getActionsByCategory } from '@/config/actions';
import { ReferralCard } from '@/components/game/ReferralCard';
import { QuestPanel } from '@/components/ui/QuestPanel';
import { ComicBubble } from '@/components/ui/ComicBubble';
import { useSpirit } from '@/hooks/useSpirit';
import { SpiritSabotagePopup } from '@/components/ui/SpiritSabotage';

const ICON_MAP: Record<string, React.ElementType> = {
  'moon': Moon, 'coffee': Coffee, 'dumbbell': Dumbbell, 'spray-can': Sparkles,
  'brain': Brain, 'mic-2': Mic2, 'tv': Tv, 'flask-conical': FlaskConical,
  'wind': Wind, 'smartphone': Smartphone, 'edit-3': Edit3, 'phone': Phone,
  'utensils': Coffee,
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
        <Icon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary truncate tracking-tight">{title}</p>
        <p className="text-[10px] text-text-muted truncate font-mono">{meta}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
    </motion.button>
  );
}

export function HomeView() {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const kpis = useKPIs();
  const home = useHome();
  const spirit = useGameStore((s) => s.state.spirit);
  const season = useSeason();
  const { executeAction } = useAction();

  const homeActions = getActionsByCategory('home');
  const { whisper, sabotage, fetchWhisper, checkSabotage } = useSpirit();

  const handleAction = (actionId: string) => {
    setBusyAction(actionId);
    const success = executeAction(actionId);
    if (success) {
      // Spirit reacts to action + may sabotage
      checkSabotage();
      fetchWhisper(actionId);
    }
    setTimeout(() => setBusyAction(null), success ? 500 : 200);
  };

  const spiritMsg = whisper || 'Ещё один день в этой дыре. Хочешь выбраться — действуй.';

  return (
    <>
    <SpiritSabotagePopup sabotage={sabotage} />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* === CHAPTER HEADER === */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: season.theme.accentColor,
            boxShadow: `0 0 16px ${season.theme.accentGlow}`,
            borderRadius: '10px',
          }}
        >
          <Skull className="w-6 h-6" style={{ color: season.theme.accentColor }} />
        </div>
        <div>
          <h1 className="manga-title text-xl tracking-wider" style={{ color: season.theme.accentColor }}>
            БАЗА
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Твоя база. Твои правила.
          </p>
        </div>
      </div>

      {/* === SPIRIT SPEECH BUBBLE (comic style) === */}
      <div className="mt-4">
        <ComicBubble variant="thought" color={season.theme.accentColor}>
          <div className="flex items-start gap-3">
            <Skull className="w-5 h-5 shrink-0 mt-0.5 animate-flicker" style={{ color: season.theme.accentColor }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: season.theme.accentColor }}>
                Дух шепчет
              </p>
              <p className="text-sm text-text-secondary leading-relaxed italic">
                &laquo;{spiritMsg}&raquo;
              </p>
            </div>
          </div>
        </ComicBubble>
      </div>

      {/* === QUICK STATS (manga panels) === */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'РЕСПЕКТ', value: kpis.respect, color: 'var(--color-neon-green)' },
          { label: 'СЛАВА', value: kpis.fame, color: 'var(--color-neon-purple)' },
          { label: 'ЧИСТОТА', value: `${home.cleanliness}%`, color: 'var(--color-neon-cyan)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="manga-panel p-3 text-center crosshatch"
          >
            <p className="manga-label">{stat.label}</p>
            <p
              className="text-xl font-bold font-mono mt-1"
              style={{ color: stat.color, textShadow: `0 0 8px ${stat.color}40` }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* === SEASON DIVIDER === */}
      <div className="chapter-divider">
        <span>{season.subtitle}</span>
      </div>

      {/* === QUESTS === */}
      <QuestPanel />

      {/* === ACTIONS === */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-3.5 h-3.5 text-text-muted" />
          <h2 className="manga-label">Действия</h2>
        </div>
        <div className="space-y-1.5">
          {homeActions.map((action, i) => {
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
              />
            );
          })}
        </div>
      </div>

      {/* === REFERRAL === */}
      <ReferralCard
        telegramId={
          typeof window !== 'undefined'
            ? (JSON.parse(localStorage.getItem('pryton_user') || '{}').telegram_id || '0')
            : '0'
        }
      />
    </motion.div>
    </>
  );
}
