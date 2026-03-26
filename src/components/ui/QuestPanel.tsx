'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle, Circle, ChevronDown, ChevronUp, Star, Swords, Music } from 'lucide-react';
import { useQuests } from '@/hooks/useQuests';
import { useGameStore } from '@/stores/game-store';
import { getQuest } from '@/config/quests';
import { getNPC } from '@/config/npcs';

const PATH_ICONS: Record<string, React.ElementType> = {
  music: Music,
  chaos: Swords,
  survival: Star,
};

export function QuestPanel() {
  const { activeQuests, available, completedCount, totalCount, acceptQuest, getObjectiveProgress } = useQuests();
  const kpis = useGameStore((s) => s.state.kpis);
  const stats = useGameStore((s) => s.state.stats);
  const [expanded, setExpanded] = useState(true);
  const [showAvailable, setShowAvailable] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full"
      >
        <Target className="w-3.5 h-3.5" style={{ color: 'var(--season-accent)' }} />
        <h2 className="manga-label flex-1 text-left">
          КВЕСТЫ ({completedCount}/{totalCount})
        </h2>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {/* Active quests */}
            {activeQuests.length === 0 && available.length > 0 && (
              <p className="text-[11px] text-text-muted italic px-1">
                Нет активных квестов. Прими новый ниже.
              </p>
            )}

            {activeQuests.map((quest, i) => {
              const npc = getNPC(quest.npc);
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="manga-panel p-3 space-y-2"
                  style={{
                    borderColor: quest.type === 'main'
                      ? 'var(--season-accent, rgba(255,45,123,0.3))'
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {quest.type === 'main' && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider"
                        style={{
                          color: 'var(--season-accent)',
                          border: '1px solid var(--season-accent)',
                          borderRadius: '8px',
                        }}
                      >
                        Сюжет
                      </span>
                    )}
                    <p className="text-sm font-bold text-text-primary flex-1">{quest.title}</p>
                    {npc && <span className="text-sm">{npc.icon}</span>}
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">{quest.description}</p>

                  {/* Objectives with progress */}
                  <div className="space-y-1.5">
                    {quest.objectives.map(obj => {
                      let current = 0;
                      if (obj.type === 'action_completed') {
                        current = getObjectiveProgress(quest.id, obj.id);
                      } else if (obj.type === 'kpi_reached') {
                        current = Math.min((kpis as unknown as Record<string, number>)[obj.kpi || ''] ?? 0, obj.target);
                      } else if (obj.type === 'stat_reached') {
                        current = Math.min((stats as unknown as Record<string, number>)[obj.stat || ''] ?? 0, obj.target);
                      }
                      const done = current >= obj.target;
                      const pct = Math.min(current / obj.target * 100, 100);

                      return (
                        <div key={obj.id} className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {done
                              ? <CheckCircle className="w-3 h-3 shrink-0" style={{ color: 'var(--color-neon-green)' }} />
                              : <Circle className="w-3 h-3 text-text-muted shrink-0" />
                            }
                            <span className={`text-[10px] flex-1 ${done ? 'text-neon-green line-through' : 'text-text-secondary'}`}>
                              {obj.description || obj.id}
                            </span>
                            <span className="text-[9px] font-mono text-text-muted">
                              {current}/{obj.target}
                            </span>
                          </div>
                          {!done && (
                            <div className="ml-5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: 'var(--season-accent)' }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rewards preview */}
                  <div className="flex gap-2 flex-wrap pt-1 border-t border-white/5">
                    {quest.rewards.cash && quest.rewards.cash > 0 && (
                      <span className="text-[9px] text-neon-green">+{quest.rewards.cash}₽</span>
                    )}
                    {quest.rewards.respect && quest.rewards.respect > 0 && (
                      <span className="text-[9px] text-neon-yellow">+{quest.rewards.respect} респект</span>
                    )}
                    {quest.rewards.fame && quest.rewards.fame > 0 && (
                      <span className="text-[9px] text-neon-cyan">+{quest.rewards.fame} слава</span>
                    )}
                    {quest.rewards.path_music && quest.rewards.path_music > 0 && (
                      <span className="text-[9px] text-neon-cyan">♪ музыка</span>
                    )}
                    {quest.rewards.path_chaos && quest.rewards.path_chaos > 0 && (
                      <span className="text-[9px] text-danger">⚔ хаос</span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Available quests */}
            {available.length > 0 && (
              <>
                <button
                  onClick={() => setShowAvailable(!showAvailable)}
                  className="flex items-center gap-2 w-full pt-2"
                >
                  <span className="manga-label flex-1 text-left">
                    Доступно ({available.length})
                  </span>
                  {showAvailable ? (
                    <ChevronUp className="w-3 h-3 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-text-muted" />
                  )}
                </button>

                <AnimatePresence>
                  {showAvailable && available.map((quest, i) => {
                    const npc = getNPC(quest.npc);
                    return (
                      <motion.button
                        key={quest.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => acceptQuest(quest.id)}
                        className="card-street p-3 w-full text-left space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          {npc && <span className="text-sm">{npc.icon}</span>}
                          <p className="text-sm font-bold text-text-primary flex-1">{quest.title}</p>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider text-neon-green border border-neon-green"
                            style={{ borderRadius: '8px' }}
                          >
                            Принять
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted">{quest.description}</p>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
