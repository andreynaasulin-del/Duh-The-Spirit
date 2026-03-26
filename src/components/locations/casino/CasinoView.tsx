'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Coins, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useGameStore, useKPIs, useSeason } from '@/stores/game-store';

const SLOT_SYMBOLS = ['🔥', '💎', '🎵', '💀', '⚡', '🌟', '👑'];

const PAYOUTS: Record<string, number> = {
  '🔥🔥🔥': 10,
  '💎💎💎': 8,
  '👑👑👑': 15,
  '🌟🌟🌟': 5,
  '🎵🎵🎵': 4,
  '⚡⚡⚡': 6,
  '💀💀💀': -1, // lose everything bet
};

type BetSize = 100 | 500 | 1000 | 'custom';

export function CasinoView() {
  const [reels, setReels] = useState(['❓', '❓', '❓']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState<BetSize>(100);
  const [customBet, setCustomBet] = useState('');
  const [lastResult, setLastResult] = useState<{ win: boolean; amount: number } | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [activeGame, setActiveGame] = useState<'slots' | 'coinflip'>('slots');
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');

  const kpis = useKPIs();
  const season = useSeason();
  const updateKPI = useGameStore((s) => s.updateKPI);
  const addLog = useGameStore((s) => s.addLog);
  const advanceTime = useGameStore((s) => s.advanceTime);

  const getBetAmount = (): number => {
    if (bet === 'custom') {
      const parsed = parseInt(customBet);
      return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
    }
    return bet;
  };

  // === COIN FLIP ===
  const flipCoin = useCallback(() => {
    if (coinFlipping) return;
    const amount = getBetAmount();
    if (!amount || kpis.cash < amount) {
      setLastResult({ win: false, amount: 0 });
      return;
    }

    setCoinFlipping(true);
    setLastResult(null);
    setCoinResult(null);
    updateKPI('cash', -amount);
    advanceTime(5);

    // Animate
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setCoinResult(Math.random() < 0.5 ? 'heads' : 'tails');
      if (tick >= 12) {
        clearInterval(interval);
        // 48% win chance (slight house edge)
        const result: 'heads' | 'tails' = Math.random() < 0.48 ? coinChoice : (coinChoice === 'heads' ? 'tails' : 'heads');
        setCoinResult(result);

        const won = result === coinChoice;
        if (won) {
          const winAmount = amount * 2;
          updateKPI('cash', winAmount);
          addLog(`Монетка: выиграл ₽${winAmount}!`, 'good');
          setLastResult({ win: true, amount: winAmount });
        } else {
          addLog(`Монетка: проиграл ₽${amount}`, 'neutral');
          setLastResult({ win: false, amount: -amount });
        }
        setSpinCount(c => c + 1);
        setCoinFlipping(false);
      }
    }, 100);
  }, [coinFlipping, coinChoice, kpis.cash, bet, customBet, updateKPI, addLog, advanceTime]);

  // === SLOTS ===
  const spin = useCallback(() => {
    if (spinning) return;
    const amount = getBetAmount();
    if (!amount || kpis.cash < amount) {
      setLastResult({ win: false, amount: 0 });
      return;
    }

    setSpinning(true);
    setLastResult(null);
    updateKPI('cash', -amount);
    advanceTime(15);

    // Animate reels
    let tick = 0;
    const maxTicks = 15;
    const interval = setInterval(() => {
      tick++;
      setReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);

      if (tick >= maxTicks) {
        clearInterval(interval);

        // Final result — weighted odds
        const finalReels = generateResult();
        setReels(finalReels);

        const combo = finalReels.join('');
        const multiplier = PAYOUTS[combo] || 0;

        // Check for 2-match (partial win)
        const twoMatch = finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2];

        let winAmount = 0;
        if (multiplier > 0) {
          winAmount = amount * multiplier;
          updateKPI('cash', winAmount);
          addLog(`Казино: выиграл ₽${winAmount}!`, 'good');
        } else if (multiplier === -1) {
          addLog('Казино: 💀💀💀 — полный провал', 'danger');
        } else if (twoMatch) {
          winAmount = Math.round(amount * 0.5);
          updateKPI('cash', winAmount);
          addLog(`Казино: частичное совпадение, +₽${winAmount}`, 'info');
        } else {
          addLog(`Казино: проиграл ₽${amount}`, 'neutral');
        }

        setLastResult({
          win: winAmount > 0,
          amount: winAmount > 0 ? winAmount : -amount,
        });
        setSpinCount((c) => c + 1);
        setSpinning(false);
      }
    }, 80);
  }, [spinning, bet, kpis.cash, updateKPI, addLog, advanceTime]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0 border-2"
          style={{
            borderColor: '#ffd700',
            boxShadow: '0 0 16px rgba(255,215,0,0.3)',
            borderRadius: '10px',
          }}
        >
          <Dice1 className="w-6 h-6" style={{ color: '#ffd700' }} />
        </div>
        <div className="flex-1">
          <h1 className="manga-title text-xl tracking-wider" style={{ color: '#ffd700' }}>
            КАЗИНО
          </h1>
          <p className="text-[11px] text-text-muted tracking-wide">
            Испытай удачу. Или потеряй всё.
          </p>
        </div>
      </div>

      {/* Game Tabs */}
      <div className="flex gap-2">
        {(['slots', 'coinflip'] as const).map((game) => (
          <button
            key={game}
            onClick={() => setActiveGame(game)}
            className="flex-1 py-2.5 text-xs font-bold tracking-wider"
            style={{
              background: activeGame === game ? '#ffd70015' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeGame === game ? '#ffd70066' : 'rgba(255,255,255,0.06)'}`,
              color: activeGame === game ? '#ffd700' : 'var(--color-text-muted)',
              borderRadius: '10px',
            }}
          >
            {game === 'slots' ? '🎰 СЛОТЫ' : '🪙 МОНЕТКА'}
          </button>
        ))}
      </div>

      {/* Slot Machine */}
      {activeGame === 'slots' && (
        <div className="manga-panel p-6">
        {/* Reels */}
        <div className="flex justify-center gap-3 mb-4">
          {reels.map((symbol, i) => (
            <motion.div
              key={i}
              className="w-20 h-20 flex items-center justify-center text-4xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '2px solid rgba(255,215,0,0.2)',
                borderRadius: '4px',
              }}
              animate={spinning ? { y: [0, -5, 5, 0] } : {}}
              transition={spinning ? { repeat: Infinity, duration: 0.15 } : {}}
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {lastResult && !spinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4"
            >
              {lastResult.win ? (
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-neon-green)' }} />
                  <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-neon-green)' }}>
                    +₽{lastResult.amount}
                  </span>
                </div>
              ) : lastResult.amount === 0 ? (
                <p className="text-xs text-danger font-bold">НЕДОСТАТОЧНО СРЕДСТВ</p>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown className="w-5 h-5 text-danger" />
                  <span className="text-lg font-bold font-mono text-danger">
                    ₽{lastResult.amount}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          disabled={spinning}
          className="w-full py-3 text-sm font-bold tracking-widest"
          style={{
            background: spinning
              ? 'rgba(255,255,255,0.05)'
              : 'linear-gradient(135deg, #ffd70022, #ff8c0022)',
            border: '2px solid #ffd70066',
            color: spinning ? 'var(--color-text-muted)' : '#ffd700',
            borderRadius: '10px',
          }}
        >
          {spinning ? '...' : 'КРУТИТЬ'}
        </motion.button>
      </div>
      )}

      {/* Coin Flip */}
      {activeGame === 'coinflip' && (
        <div className="manga-panel p-6">
          {/* Coin display */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-24 h-24 flex items-center justify-center text-5xl"
              style={{
                background: 'rgba(255,215,0,0.08)',
                border: '2px solid rgba(255,215,0,0.3)',
                borderRadius: '50%',
              }}
              animate={coinFlipping ? { rotateY: [0, 180, 360], scale: [1, 1.1, 1] } : {}}
              transition={coinFlipping ? { repeat: Infinity, duration: 0.3 } : {}}
            >
              {coinResult === 'heads' ? '👑' : coinResult === 'tails' ? '💀' : '🪙'}
            </motion.div>
          </div>

          {/* Result */}
          <AnimatePresence>
            {lastResult && !coinFlipping && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mb-4"
              >
                {lastResult.win ? (
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-neon-green)' }} />
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-neon-green)' }}>
                      +₽{lastResult.amount}
                    </span>
                  </div>
                ) : lastResult.amount === 0 ? (
                  <p className="text-xs text-danger font-bold">НЕДОСТАТОЧНО СРЕДСТВ</p>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <TrendingDown className="w-5 h-5 text-danger" />
                    <span className="text-lg font-bold font-mono text-danger">
                      ₽{lastResult.amount}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choice */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCoinChoice('heads')}
              className="flex-1 py-3 text-sm font-bold"
              style={{
                background: coinChoice === 'heads' ? '#ffd70015' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${coinChoice === 'heads' ? '#ffd70066' : 'rgba(255,255,255,0.06)'}`,
                color: coinChoice === 'heads' ? '#ffd700' : 'var(--color-text-muted)',
                borderRadius: '10px',
              }}
            >
              👑 Орёл
            </button>
            <button
              onClick={() => setCoinChoice('tails')}
              className="flex-1 py-3 text-sm font-bold"
              style={{
                background: coinChoice === 'tails' ? '#ffd70015' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${coinChoice === 'tails' ? '#ffd70066' : 'rgba(255,255,255,0.06)'}`,
                color: coinChoice === 'tails' ? '#ffd700' : 'var(--color-text-muted)',
                borderRadius: '10px',
              }}
            >
              💀 Решка
            </button>
          </div>

          {/* Flip button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={flipCoin}
            disabled={coinFlipping}
            className="w-full py-3 text-sm font-bold tracking-widest"
            style={{
              background: coinFlipping ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ffd70022, #ff8c0022)',
              border: '2px solid #ffd70066',
              color: coinFlipping ? 'var(--color-text-muted)' : '#ffd700',
              borderRadius: '10px',
            }}
          >
            {coinFlipping ? '...' : 'БРОСИТЬ x2'}
          </motion.button>
        </div>
      )}

      {/* Bet selector */}
      <div className="manga-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="manga-label">СТАВКА</span>
          <span className="text-[10px] font-mono text-text-muted">
            Баланс: ₽{kpis.cash.toLocaleString()}
          </span>
        </div>
        <div className="flex gap-2">
          {([100, 500, 1000] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBet(b)}
              className="flex-1 py-2 text-xs font-bold font-mono tracking-wider"
              style={{
                background: bet === b ? '#ffd70015' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${bet === b ? '#ffd70066' : 'rgba(255,255,255,0.06)'}`,
                color: bet === b ? '#ffd700' : 'var(--color-text-muted)',
                borderRadius: '10px',
              }}
            >
              ₽{b}
            </button>
          ))}
          <button
            onClick={() => setBet('custom')}
            className="flex-1 py-2 text-xs font-bold tracking-wider"
            style={{
              background: bet === 'custom' ? '#ffd70015' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${bet === 'custom' ? '#ffd70066' : 'rgba(255,255,255,0.06)'}`,
              color: bet === 'custom' ? '#ffd700' : 'var(--color-text-muted)',
              borderRadius: '10px',
            }}
          >
            СВОЯ
          </button>
        </div>
        {bet === 'custom' && (
          <input
            type="number"
            value={customBet}
            onChange={(e) => setCustomBet(e.target.value)}
            placeholder="Сумма ставки..."
            className="mt-2 w-full py-2 px-3 text-sm font-mono text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #ffd70044',
              color: '#ffd700',
              borderRadius: '10px',
              outline: 'none',
            }}
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">СПИНОВ</p>
          <p className="text-xl font-bold font-mono mt-1" style={{ color: '#ffd700' }}>
            {spinCount}
          </p>
        </div>
        <div className="manga-panel p-3 text-center crosshatch">
          <p className="manga-label">БАЛАНС</p>
          <p
            className="text-xl font-bold font-mono mt-1"
            style={{ color: kpis.cash < 500 ? 'var(--color-danger)' : 'var(--color-neon-green)' }}
          >
            ₽{kpis.cash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payout table */}
      <div className="manga-panel p-3">
        <p className="manga-label mb-2">ВЫПЛАТЫ</p>
        <div className="space-y-1 text-[10px] font-mono">
          <div className="flex justify-between text-text-muted">
            <span>👑👑👑</span><span className="text-neon-green">x15</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>🔥🔥🔥</span><span className="text-neon-green">x10</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>💎💎💎</span><span className="text-neon-green">x8</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>⚡⚡⚡</span><span className="text-neon-green">x6</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>🌟🌟🌟</span><span className="text-neon-green">x5</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>🎵🎵🎵</span><span className="text-neon-green">x4</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>2 совпадения</span><span className="text-warning">x0.5</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>💀💀💀</span><span className="text-danger">ПРОВАЛ</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Weighted random result — house edge ~70%
function generateResult(): string[] {
  const roll = Math.random();

  if (roll < 0.01) {
    // 1% — jackpot (👑👑👑)
    return ['👑', '👑', '👑'];
  } else if (roll < 0.04) {
    // 3% — triple match
    const sym = SLOT_SYMBOLS[Math.floor(Math.random() * (SLOT_SYMBOLS.length - 1))]; // exclude 💀
    return [sym, sym, sym];
  } else if (roll < 0.06) {
    // 2% — skull triple
    return ['💀', '💀', '💀'];
  } else if (roll < 0.20) {
    // 14% — two match
    const sym = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    const other = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    const pos = Math.random() < 0.5 ? [sym, sym, other] : [other, sym, sym];
    return pos;
  } else {
    // 80% — no match
    const r1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    let r2 = r1;
    while (r2 === r1) r2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    let r3 = r1;
    while (r3 === r1 || r3 === r2) r3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    return [r1, r2, r3];
  }
}
