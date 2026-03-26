'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { NPCDef, DialogueNode, DialogueResponse, DialogueEffect } from '@/types/npc';
import { useGameStore, useStats } from '@/stores/game-store';
import { ComicBubble } from './ComicBubble';

interface DialogOverlayProps {
  npc: NPCDef;
  startNode?: string;
  onClose: () => void;
}

export function DialogOverlay({ npc, startNode = 'start', onClose }: DialogOverlayProps) {
  const [currentNodeId, setCurrentNodeId] = useState(startNode);
  const [isTyping, setIsTyping] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const stats = useStats();
  const npcState = useGameStore((s) => s.state.npcs[npc.id]);
  const relationship = npcState?.reputation ?? npc.initialRelationship ?? 0;

  const currentNode: DialogueNode | undefined = npc.dialogues[currentNodeId];

  // Typewriter effect
  useEffect(() => {
    if (!currentNode) return;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const text = currentNode.text;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [currentNodeId, currentNode]);

  // Skip typing on tap
  const skipTyping = () => {
    if (isTyping && currentNode) {
      setDisplayedText(currentNode.text);
      setIsTyping(false);
    }
  };

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

  const isResponseAvailable = (response: DialogueResponse): boolean => {
    if (!response.condition) return true;
    const { minRelationship, maxRelationship } = response.condition;
    if (minRelationship !== undefined && relationship < minRelationship) return false;
    if (maxRelationship !== undefined && relationship > maxRelationship) return false;
    return true;
  };

  const handleResponse = (response: DialogueResponse) => {
    if (response.effect) applyEffect(response.effect);
    if (response.next && npc.dialogues[response.next]) {
      setCurrentNodeId(response.next);
    } else {
      onClose();
    }
  };

  if (!currentNode) {
    onClose();
    return null;
  }

  const availableResponses = currentNode.responses.filter(isResponseAvailable);

  // Determine bubble style based on NPC
  const isSpirit = npc.id === 'spirit';
  const bubbleVariant = isSpirit ? 'thought' as const : 'speech' as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      >
        {/* === TOP: NPC AVATAR with halftone bg === */}
        <div className="relative flex-shrink-0 pt-8 pb-4 flex flex-col items-center">
          {/* Halftone radial pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, ${npc.color} 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />

          {/* NPC icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative z-10 w-20 h-20 flex items-center justify-center text-4xl"
            style={{
              border: `3px solid ${npc.color}`,
              borderRadius: '50%',
              backgroundColor: '#0a0a0a',
              boxShadow: `0 0 30px ${npc.color}50, 4px 4px 0px ${npc.color}40`,
            }}
          >
            {npc.icon}
          </motion.div>

          {/* Name plate */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative z-10 mt-3 px-4 py-1"
            style={{
              background: npc.color,
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
            }}
          >
            <p className="text-xs font-black tracking-[0.2em] text-black">
              {npc.name.toUpperCase()}
            </p>
          </motion.div>

          <p className="relative z-10 text-[10px] text-text-muted mt-1">{npc.role}</p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center z-20"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === MIDDLE: SPEECH BUBBLE === */}
        <div className="flex-1 flex items-center justify-center px-4" onClick={skipTyping}>
          <motion.div
            key={currentNodeId}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-sm"
          >
            <ComicBubble variant={bubbleVariant} color={npc.color} tailDirection="center">
              <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: npc.color }}>
                {currentNode.speaker ?? npc.name}
              </p>
              <p className="text-[15px] text-white leading-relaxed font-medium">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: npc.color }} />
                )}
              </p>
            </ComicBubble>
          </motion.div>
        </div>

        {/* === BOTTOM: RESPONSE OPTIONS === */}
        <div className="flex-shrink-0 px-4 pb-8 space-y-2 max-w-sm mx-auto w-full">
          <AnimatePresence>
            {!isTyping && availableResponses.map((response, i) => (
              <motion.button
                key={`${currentNodeId}-${i}`}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                whileTap={{ scale: 0.95, x: 3 }}
                onClick={() => handleResponse(response)}
                className="w-full text-left p-3 flex items-start gap-3 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${npc.color}60`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                {/* Number badge */}
                <span
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[11px] font-black"
                  style={{
                    background: `${npc.color}20`,
                    color: npc.color,
                    borderRadius: '6px',
                    border: `1px solid ${npc.color}40`,
                  }}
                >
                  {i + 1}
                </span>

                <div className="flex-1">
                  <p className="text-sm text-white/90 leading-snug">{response.text}</p>
                  {response.effect && (
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {response.effect.path_music && response.effect.path_music > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">♪ музыка</span>
                      )}
                      {response.effect.path_chaos && response.effect.path_chaos > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚔ хаос</span>
                      )}
                      {response.effect.path_survival && response.effect.path_survival > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">★ выживание</span>
                      )}
                      {response.effect.cash && response.effect.cash > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">+₽{response.effect.cash}</span>
                      )}
                      {response.effect.cash && response.effect.cash < 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">{response.effect.cash}₽</span>
                      )}
                      {response.effect.stability && response.effect.stability < -10 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">⚠ стабильность</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {isTyping && (
            <p className="text-[10px] text-text-muted text-center animate-pulse">
              нажми чтобы пропустить...
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
