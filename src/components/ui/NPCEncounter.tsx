'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { NPCDef } from '@/types/npc';
import { getNPCsByLocation } from '@/config/npcs';
import { useGameStore, useStats } from '@/stores/game-store';
import { DialogOverlay } from './DialogOverlay';
import { Portal } from './Portal';

interface NPCEncounterProps {
  location: string;
}

export function NPCEncounter({ location }: NPCEncounterProps) {
  const [activeNPC, setActiveNPC] = useState<NPCDef | null>(null);
  const [activeNode, setActiveNode] = useState('start');
  const stats = useStats();
  const time = useGameStore((s) => s.state.time);
  const npcStates = useGameStore((s) => s.state.npcs);

  const npcs = getNPCsByLocation(location);

  // Filter NPCs by active hours and trigger conditions
  const availableNPCs = npcs.filter((npc) => {
    // Check active hours
    if (npc.activeHours) {
      const { start, end } = npc.activeHours;
      if (start < end) {
        if (time < start || time > end) return false;
      } else {
        // Overnight range (e.g. 20:00–03:00)
        if (time < start && time > end) return false;
      }
    }

    // Check trigger condition (e.g. Spirit appears when stability < 25)
    if (npc.triggerCondition) {
      const { stat, operator, value } = npc.triggerCondition;
      const current = stats[stat as keyof typeof stats] ?? 50;
      switch (operator) {
        case '<': if (!(current < value)) return false; break;
        case '>': if (!(current > value)) return false; break;
        case '<=': if (!(current <= value)) return false; break;
        case '>=': if (!(current >= value)) return false; break;
        case '==': if (!(current === value)) return false; break;
      }
    }

    return true;
  });

  if (availableNPCs.length === 0) return null;

  const handleTalk = (npc: NPCDef) => {
    // Pick start node based on relationship
    const rep = npcStates[npc.id]?.reputation ?? npc.initialRelationship ?? 0;
    const nodes = Object.keys(npc.dialogues);

    // Simple logic: if relationship > 30 and there are later nodes, use them
    let startNodeId = 'start';
    if (rep > 30 && nodes.includes('studio_talk')) startNodeId = 'studio_talk';
    if (rep > 30 && nodes.includes('respect')) startNodeId = 'respect';
    if (rep > 30 && nodes.includes('returning')) startNodeId = 'returning';
    if (npc.id === 'spirit') startNodeId = 'crisis';

    setActiveNode(startNodeId);
    setActiveNPC(npc);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-3.5 h-3.5" style={{ color: 'var(--season-accent)' }} />
          <h2 className="manga-label">Люди рядом</h2>
        </div>

        {availableNPCs.map((npc, i) => {
          const rep = npcStates[npc.id]?.reputation ?? npc.initialRelationship ?? 0;
          return (
            <motion.button
              key={npc.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTalk(npc)}
              className="card-street p-3 flex items-center gap-3 w-full text-left"
            >
              <div
                className="w-10 h-10 flex items-center justify-center text-xl shrink-0 border"
                style={{
                  borderColor: `${npc.color}60`,
                  borderRadius: '10px',
                  backgroundColor: `${npc.color}10`,
                }}
              >
                {npc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-text-primary truncate">{npc.name}</p>
                  <span
                    className="text-[8px] font-mono px-1 py-0.5"
                    style={{
                      color: rep > 20 ? 'var(--color-neon-green)' : rep < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                      border: `1px solid ${rep > 20 ? 'var(--color-neon-green)' : rep < 0 ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '8px',
                    }}
                  >
                    {rep > 0 ? '+' : ''}{rep}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted truncate">{npc.role} — {npc.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dialog overlay — rendered via Portal to escape overflow:auto */}
      {activeNPC && (
        <Portal>
          <DialogOverlay
            npc={activeNPC}
            startNode={activeNode}
            onClose={() => setActiveNPC(null)}
          />
        </Portal>
      )}
    </>
  );
}
