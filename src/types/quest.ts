export type QuestObjectiveType = 'action_completed' | 'kpi_reached' | 'stat_reached' | 'items_bought';

export interface QuestObjectiveDef {
  id: string;
  type: QuestObjectiveType;
  target: number;
  actionId?: string;
  kpi?: string;
  stat?: string;
  description?: string;
}

export interface QuestRewards {
  cash?: number;
  respect?: number;
  fame?: number;
  energy?: number;
  health?: number;
  stability?: number;
  mood?: number;
  adequacy?: number;
  relationship?: number;
  path_chaos?: number;
  path_music?: number;
  path_survival?: number;
}

export interface QuestDef {
  id: string;
  npc: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily';
  objectives: QuestObjectiveDef[];
  rewards: QuestRewards;
  unlocks?: string[];
  minRelationship?: number;
}

export interface ActiveQuest {
  questId: string;
  objectives: {
    id: string;
    current: number;
    completed: boolean;
  }[];
  startedAt: number;
}
