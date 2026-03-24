export type CasinoGameType = 'slots' | 'dice' | 'blackjack' | 'crash' | 'roulette' | 'thimbles';

// --- Slots ---
export type SlotSymbol = 'ghost' | 'seven' | 'diamond' | 'bar' | 'cherry';

export interface SlotsResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  win: number;
  message: string;
  isJackpot: boolean;
}

// --- Dice ---
export type DiceBetType = 'over' | 'under' | 'even' | 'odd';

export interface DiceResult {
  dice: [number, number];
  total: number;
  betType: DiceBetType;
  win: number;
  message: string;
}

// --- Blackjack ---
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  value: number;
  hidden?: boolean;
}

export type BlackjackAction = 'deal' | 'hit' | 'stand' | 'double';

export interface BlackjackState {
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  bet: number;
  status: 'playing' | 'player_bust' | 'dealer_bust' | 'player_win' | 'dealer_win' | 'push' | 'blackjack';
  sessionId: string;
}

// --- Crash ---
export interface CrashResult {
  crashPoint: number;
  cashoutAt: number | null;
  win: number;
  message: string;
}

// --- Roulette ---
export type RouletteColor = 'red' | 'black' | 'green';
export type RouletteBetType = 'color' | 'number' | 'parity' | 'range';

export interface RouletteBet {
  type: RouletteBetType;
  value: string;
  amount: number;
}

export interface RouletteResult {
  number: number;
  color: RouletteColor;
  bets: RouletteBet[];
  totalWin: number;
  message: string;
}

// --- Thimbles ---
export interface ThimblesResult {
  correctCup: number;
  chosenCup: number;
  win: number;
  message: string;
}

// --- Generic Casino Request/Response ---
export interface CasinoBetRequest {
  gameType: CasinoGameType;
  bet: number;
  params?: Record<string, unknown>;
  clientSeed?: string;
}

export interface CasinoResponse<T = unknown> {
  success: boolean;
  result: T;
  chips: number;
  xp: number;
  message: string;
}

// --- Casino Log ---
export interface CasinoLog {
  id: string;
  user_id: string;
  game_type: CasinoGameType;
  bet: number;
  result: unknown;
  payout: number;
  server_seed: string;
  client_seed: string | null;
  nonce: number;
  created_at: string;
}

// --- Provably Fair ---
export interface ProvablyFairData {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}
