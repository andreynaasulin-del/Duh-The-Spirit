import type { PathKey, StatKey } from './game';

export interface DialogueEffect {
  relationship?: number;
  mood?: number;
  stability?: number;
  energy?: number;
  health?: number;
  trip?: number;
  cash?: number;
  fame?: number;
  respect?: number;
  path_music?: number;
  path_chaos?: number;
  path_survival?: number;
  creativity?: number;
}

export interface DialogueResponse {
  text: string;
  next?: string;
  action?: string;
  effect?: DialogueEffect;
  condition?: {
    minRelationship?: number;
    maxRelationship?: number;
    minStat?: { key: StatKey; value: number };
    hasItem?: string;
  };
}

export interface DialogueNode {
  text: string;
  speaker?: string;
  responses: DialogueResponse[];
}

export type DialogueTree = Record<string, DialogueNode>;

export interface NPCDef {
  id: string;
  name: string;
  role: string;
  path: PathKey | 'all';
  icon: string;
  color: string;
  description: string;
  location: string | null;
  activeHours?: { start: number; end: number };
  initialRelationship?: number;
  triggerCondition?: {
    stat?: StatKey;
    operator: '<' | '>' | '==' | '<=' | '>=';
    value: number;
  };
  dialogues: DialogueTree;
  quests?: NPCQuestDef[];
}

export interface NPCQuestDef {
  id: string;
  title: string;
  description: string;
  reward: Record<string, number>;
}

export type RelationshipLevel = 'enemy' | 'dislike' | 'neutral' | 'known' | 'friend' | 'family';

export function getRelationshipLevel(value: number): RelationshipLevel {
  if (value < -30) return 'enemy';
  if (value < 0) return 'dislike';
  if (value < 20) return 'neutral';
  if (value < 50) return 'known';
  if (value < 80) return 'friend';
  return 'family';
}
