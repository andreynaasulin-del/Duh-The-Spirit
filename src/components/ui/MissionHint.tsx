'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight, ChevronUp, Home, MapPin, Music, Cpu, ShoppingBag, Dice5, Stethoscope } from 'lucide-react';
import { useQuests } from '@/hooks/useQuests';
import { getNPC } from '@/config/npcs';
import { getAction } from '@/config/actions';

/** Map action category → location info */
const LOCATION_MAP: Record<string, { icon: React.ElementType; label: string; href: string }> = {
  home: { icon: Home, label: 'База', href: '/game/home' },
  street: { icon: MapPin, label: 'Улица', href: '/game/street' },
  club: { icon: Music, label: 'Клуб', href: '/game/club' },
  farm: { icon: Cpu, label: 'Лаба', href: '/game/farm' },
  shop: { icon: ShoppingBag, label: 'Маркет', href: '/game/shop' },
  casino: { icon: Dice5, label: 'Казино', href: '/game/casino' },
  doctor: { icon: Stethoscope, label: 'Док', href: '/game/doctor' },
};

function getLocationForObjective(obj: { type: string; actionId?: string }): { icon: React.ElementType; label: string } | null {
  if (obj.type === 'action_completed' && obj.actionId) {
    const action = getAction(obj.actionId);
    if (action) {
      const loc = LOCATION_MAP[action.category];
      if (loc) return { icon: loc.icon, label: loc.label };
    }
  }
  return null;
}

/**
 * MissionHint — sticky compact bar showing current quest objective.
 * Visible on ALL locations (rendered in game layout).
 * Tap to expand full quest details.
 */
export function MissionHint() {
  const { activeQuests, available, acceptQuest, getObjectiveProgress } = useQuests();
  const [expanded, setExpanded] = useState(false);

  const currentQuest = activeQuests[0];

  // No quest, but available — show accept prompt (compact)
  if (!currentQuest && available.length > 0) {
    const next = available.find(q => q.type === 'main') || available[0];
    const npc = getNPC(next.npc);
    return (
      <motion.button
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => acceptQuest(next.id)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-white/5"
        style={{
          background: 'linear-gradient(90deg, rgba(224,64,251,0.12) 0%, transparent 100%)',
        }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(224,64,251,0.2)', border: '1px solid rgba(224,64,251,0.3)' }}
        >
          {npc ? <span className="text-base">{npc.icon}</span> : <Target className="w-4 h-4" style={{ color: '#e040fb' }} />}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[9px] text-[#e040fb] uppercase tracking-wider font-black">Новая миссия</p>
          <p className="text-xs text-white font-bold truncate">{next.title}</p>
        </div>
        <div
          className="px-2 py-1 text-[8px] text-black font-black uppercase shrink-0"
          style={{ backgroundColor: '#e040fb', borderRadius: '6px' }}
        >
          Принять
        </div>
      </motion.button>
    );
  }

  if (!currentQuest) return null;

  const npc = getNPC(currentQuest.npc);
  // Find first incomplete objective
  const incompleteObj = currentQuest.objectives.find(obj => {
    const progress = obj.type === 'action_completed'
      ? getObjectiveProgress(currentQuest.id, obj.id)
      : 0;
    return progress < obj.target;
  }) || currentQuest.objectives[0];

  const location = getLocationForObjective(incompleteObj);
  const LocationIcon = location?.icon;

  return (
    <div className="border-b border-white/5">
      {/* Compact bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2"
        style={{
          background: 'linear-gradient(90deg, rgba(224,64,251,0.06) 0%, transparent 100%)',
        }}
      >
        {npc && <span className="text-sm shrink-0">{npc.icon}</span>}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className="text-[9px] text-[#e040fb]/50 font-bold shrink-0">
            {currentQuest.type === 'main' ? 'СЮЖЕТ' : 'ЗАДАНИЕ'}
          </span>
          <span className="text-[11px] text-white/70 font-bold truncate">
            {incompleteObj.description || currentQuest.title}
          </span>
        </div>
        {location && LocationIcon && (
          <div className="flex items-center gap-1 shrink-0 px-1.5 py-0.5"
            style={{
              backgroundColor: 'rgba(224,64,251,0.1)',
              border: '1px solid rgba(224,64,251,0.2)',
              borderRadius: '4px',
            }}
          >
            <LocationIcon className="w-2.5 h-2.5" style={{ color: '#e040fb' }} />
            <span className="text-[8px] font-bold" style={{ color: '#e040fb' }}>{location.label}</span>
          </div>
        )}
        {expanded
          ? <ChevronUp className="w-3 h-3 text-white/20 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
        }
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-2"
          >
            <p className="text-xs font-bold text-white/80 mb-1">{currentQuest.title}</p>
            <p className="text-[10px] text-white/40 leading-relaxed mb-2">{currentQuest.description}</p>
            <div className="space-y-1">
              {currentQuest.objectives.map(obj => {
                const progress = obj.type === 'action_completed'
                  ? getObjectiveProgress(currentQuest.id, obj.id)
                  : 0;
                const done = progress >= obj.target;
                return (
                  <div key={obj.id} className="flex items-center gap-2 text-[10px]">
                    <span className={done ? 'text-green-400' : 'text-white/30'}>{done ? '✓' : '○'}</span>
                    <span className={done ? 'text-green-400/70 line-through' : 'text-white/50'}>
                      {obj.description || obj.id}
                    </span>
                    <span className="text-white/20 font-mono ml-auto">{progress}/{obj.target}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
