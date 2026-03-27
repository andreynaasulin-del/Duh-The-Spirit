'use client';

import { motion } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import { useQuests } from '@/hooks/useQuests';
import { getNPC } from '@/config/npcs';

/**
 * MissionHint — always-visible compact bar showing current objective.
 * Shows first active quest's next incomplete objective.
 * If no active quest — prompts to accept one.
 */
export function MissionHint() {
  const { activeQuests, available, acceptQuest } = useQuests();

  // Find first active quest with incomplete objective
  const currentQuest = activeQuests[0];

  if (!currentQuest && available.length > 0) {
    const next = available.find(q => q.type === 'main') || available[0];
    const npc = getNPC(next.npc);
    return (
      <motion.button
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => acceptQuest(next.id)}
        className="w-full flex flex-col gap-3 p-5 rounded-2xl border-2 border-[#e040fb]/50"
        style={{
          background: 'linear-gradient(135deg, rgba(224,64,251,0.18) 0%, rgba(224,64,251,0.04) 100%)',
          boxShadow: '0 0 30px rgba(224,64,251,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(224,64,251,0.25)', border: '2px solid rgba(224,64,251,0.4)' }}
          >
            {npc ? <span className="text-2xl">{npc.icon}</span> : <Target className="w-6 h-6" style={{ color: '#e040fb' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#e040fb] uppercase tracking-wider font-black">Новая миссия</p>
            <p className="text-base text-white font-black">{next.title}</p>
          </div>
        </div>
        <p className="text-[12px] text-white/50 leading-relaxed">{next.description}</p>
        <div
          className="w-full py-3 rounded-xl text-center text-sm text-black font-black"
          style={{ backgroundColor: '#e040fb' }}
        >
          ПРИНЯТЬ МИССИЮ
        </div>
      </motion.button>
    );
  }

  if (!currentQuest) return null;

  const npc = getNPC(currentQuest.npc);
  const firstIncomplete = currentQuest.objectives[0]; // simplified

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex items-center gap-2.5 p-3 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(224,64,251,0.08) 0%, rgba(0,0,0,0) 100%)',
        border: '1px solid rgba(224,64,251,0.15)',
      }}
    >
      {npc && <span className="text-lg shrink-0">{npc.icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#e040fb]/60 uppercase tracking-wider font-bold">
          {currentQuest.type === 'main' ? '📍 Сюжет' : 'Задание'}
        </p>
        <p className="text-xs text-white/80 font-bold truncate">{currentQuest.title}</p>
        {firstIncomplete && (
          <p className="text-[10px] text-white/40 truncate mt-0.5">
            → {firstIncomplete.description || firstIncomplete.id}
          </p>
        )}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
    </motion.div>
  );
}
