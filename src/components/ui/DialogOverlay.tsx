'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { NPCDef, DialogueNode, DialogueResponse, DialogueEffect } from '@/types/npc';
import { useGameStore, useStats } from '@/stores/game-store';

interface DialogOverlayProps {
  npc: NPCDef;
  startNode?: string;
  onClose: () => void;
}

export function DialogOverlay({ npc, startNode = 'start', onClose }: DialogOverlayProps) {
  const [currentNodeId, setCurrentNodeId] = useState(startNode);
  const [isTyping, setIsTyping] = useState(true);
  const stats = useStats();
  const npcState = useGameStore((s) => s.state.npcs[npc.id]);
  const relationship = npcState?.reputation ?? npc.initialRelationship ?? 0;

  const currentNode: DialogueNode | undefined = npc.dialogues[currentNodeId];

  // Apply dialog effects to game state
  const applyEffect = useCallback((effect: DialogueEffect) => {
    const store = useGameStore.getState();

    if (effect.mood) store.updateStat('mood', effect.mood);
    if (effect.stability) store.updateStat('stability', effect.stability);
    if (effect.energy) store.updateStat('energy', effect.energy);
    if (effect.health) store.updateStat('health', effect.health);
    if (effect.cash) store.updateKPI('cash', effect.cash);
    if (effect.respect) store.updateKPI('respect', effect.respect);
    if (effect.path_music) store.updatePath('music', effect.path_music);
    if (effect.path_chaos) store.updatePath('chaos', effect.path_chaos);
    if (effect.path_survival) store.updatePath('survival', effect.path_survival);

    // Update NPC relationship
    if (effect.relationship) {
      const current = store.state.npcs[npc.id]?.reputation ?? npc.initialRelationship ?? 0;
      store.setState({
        ...store.state,
        npcs: {
          ...store.state.npcs,
          [npc.id]: { reputation: current + (effect.relationship ?? 0) },
        },
      });
    }
  }, [npc.id, npc.initialRelationship]);

  // Check if a response's condition is met
  const isResponseAvailable = (response: DialogueResponse): boolean => {
    if (!response.condition) return true;
    const { minRelationship, maxRelationship } = response.condition;
    if (minRelationship !== undefined && relationship < minRelationship) return false;
    if (maxRelationship !== undefined && relationship > maxRelationship) return false;
    return true;
  };

  const handleResponse = (response: DialogueResponse) => {
    // Apply effects
    if (response.effect) {
      applyEffect(response.effect);
    }

    // Navigate or close
    if (response.next && npc.dialogues[response.next]) {
      setCurrentNodeId(response.next);
      setIsTyping(true);
    } else {
      onClose();
    }
  };

  // Auto-finish typing after delay
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 800);
    return () => clearTimeout(timer);
  }, [currentNodeId]);

  if (!currentNode) {
    onClose();
    return null;
  }

  const availableResponses = currentNode.responses.filter(isResponseAvailable);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        {/* NPC avatar area */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 flex items-center justify-center text-3xl border-2"
            style={{
              borderColor: npc.color,
              boxShadow: `0 0 20px ${npc.color}40`,
              borderRadius: '10px',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            {npc.icon}
          </div>
          <p className="text-xs font-bold tracking-wider" style={{ color: npc.color }}>
            {npc.name.toUpperCase()}
          </p>
          <p className="text-[10px] text-text-muted">{npc.role}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog panel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-lg p-4 pb-8 space-y-4"
        >
          {/* Speech bubble */}
          <div
            className="manga-panel p-4"
            style={{ borderColor: `${npc.color}40` }}
          >
            <p className="text-[10px] font-bold tracking-wider mb-2" style={{ color: npc.color }}>
              {currentNode.speaker ?? npc.name}
            </p>
            <motion.p
              key={currentNodeId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-text-primary leading-relaxed"
            >
              {currentNode.text}
            </motion.p>
          </div>

          {/* Response options */}
          <div className="space-y-2">
            {availableResponses.map((response, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleResponse(response)}
                className="w-full text-left p-3 border border-white/10 hover:border-white/30 transition-colors"
                style={{ borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <p className="text-sm text-text-secondary">{response.text}</p>
                {response.effect && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {response.effect.path_music && response.effect.path_music > 0 && (
                      <span className="text-[9px] text-neon-cyan">+музыка</span>
                    )}
                    {response.effect.path_chaos && response.effect.path_chaos > 0 && (
                      <span className="text-[9px] text-danger">+хаос</span>
                    )}
                    {response.effect.path_survival && response.effect.path_survival > 0 && (
                      <span className="text-[9px] text-neon-green">+выживание</span>
                    )}
                    {response.effect.cash && response.effect.cash > 0 && (
                      <span className="text-[9px] text-neon-green">+₽{response.effect.cash}</span>
                    )}
                    {response.effect.cash && response.effect.cash < 0 && (
                      <span className="text-[9px] text-warning">{response.effect.cash}₽</span>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
