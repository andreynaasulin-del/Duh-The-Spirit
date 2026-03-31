'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  MapPin,
  Music,
  Cpu,
  ShoppingBag,
  Dice5,
  Stethoscope,
  Lock,
  Brain,
} from 'lucide-react';
import { useGameStore } from '@/stores/game-store';

interface LockState {
  day: number;
  paths: { music: number; chaos: number; survival: number };
  quests: { completed: string[] };
  kpis: { cash: number };
  status: string;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  lockCondition?: (state: LockState) => boolean;
  lockHint?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/game/home', icon: Home, label: 'База' },
  { href: '/game/street', icon: MapPin, label: 'Улица' },
  {
    href: '/game/club', icon: Music, label: 'Клуб',
    lockCondition: (s) => s.quests.completed.length < 2 && s.paths.music < 3,
    lockHint: 'Выполни 2 квеста или прокачай музыку',
  },
  {
    href: '/game/farm', icon: Cpu, label: 'Лаба',
    lockCondition: (s) => s.day < 10 && s.paths.chaos < 10,
    lockHint: 'День 10 или хаос выше 10',
  },
  { href: '/game/shop', icon: ShoppingBag, label: 'Маркет' },
  {
    href: '/game/casino', icon: Dice5, label: 'Казино',
    lockCondition: (s) => s.day < 5 && s.kpis.cash < 15000,
    lockHint: 'День 5 или 15K₽ на руках',
  },
  { href: '/game/doctor', icon: Stethoscope, label: 'Док' },
  {
    href: '/game/prison', icon: Lock, label: 'Тюрьма',
    lockCondition: (s) => s.status !== 'PRISON',
    lockHint: 'Только при аресте',
  },
  {
    href: '/game/memory', icon: Brain, label: 'Память',
    lockCondition: (s) => s.day < 30,
    lockHint: 'Доступно с 30 дня',
  },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const gameState = useGameStore((s) => s.state);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Track previously locked items to detect unlocks
  const [prevLocked, setPrevLocked] = useState<Set<string>>(new Set());
  useEffect(() => {
    const currentLocked = new Set<string>();
    const lockState: LockState = {
      day: gameState.day ?? 1,
      paths: gameState.paths ?? { music: 0, chaos: 0, survival: 0 },
      quests: gameState.quests ?? { completed: [], active: [], available: [], progress: {} },
      kpis: { cash: gameState.kpis?.cash ?? 0 },
      status: gameState.status ?? 'FREE',
    };

    for (const item of NAV_ITEMS) {
      if (item.lockCondition) {
        try {
          if (item.lockCondition(lockState)) {
            currentLocked.add(item.href);
          } else if (prevLocked.has(item.href)) {
            // Just unlocked!
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
            showToast(`🔓 ${item.label} открыт!`);
          }
        } catch { /* ignore */ }
      }
    }
    setPrevLocked(currentLocked);
  }, [gameState.day, gameState.paths, gameState.kpis?.cash, gameState.status]);

  const lockState: LockState = {
    day: gameState.day ?? 1,
    paths: gameState.paths ?? { music: 0, chaos: 0, survival: 0 },
    quests: gameState.quests ?? { completed: [], active: [], available: [], progress: {} },
    kpis: { cash: gameState.kpis?.cash ?? 0 },
    status: gameState.status ?? 'FREE',
  };

  return (
    <>
      {/* Unlock toast */}
      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 text-xs font-bold tracking-wider animate-pulse"
          style={{
            backgroundColor: 'rgba(0,0,0,0.9)',
            border: '1px solid var(--color-accent)',
            borderRadius: '8px',
            color: 'var(--color-accent)',
          }}
        >
          {toast}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-t-2 border-white/10 safe-area-bottom">
        <div
          className="flex items-center px-0.5 py-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label, lockCondition, lockHint }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            let isLocked = false;
            try {
              isLocked = lockCondition ? lockCondition(lockState) : false;
            } catch { isLocked = false; }

            return (
              <button
                key={href}
                onClick={() => {
                  if (isLocked) {
                    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error');
                    if (lockHint) showToast(`🔒 ${lockHint}`);
                    return;
                  }
                  window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
                  router.push(href);
                }}
                className={`flex flex-col items-center gap-0.5 px-0.5 py-1 min-w-[34px] shrink-0 transition-all relative ${isLocked ? 'opacity-30' : ''}`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-5 h-[2px]"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                )}
                <div
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-[2px] transition-all
                    ${isActive
                      ? 'border border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border border-transparent'
                    }
                  `}
                  style={isActive ? {
                    borderColor: 'var(--color-accent)',
                    backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                    boxShadow: '2px 2px 0px var(--color-accent-glow)',
                  } : undefined}
                >
                  {isLocked ? (
                    <Lock className="w-2.5 h-2.5 text-text-muted" />
                  ) : (
                    <Icon
                      className={`w-3 h-3 ${isActive ? 'text-[var(--color-accent)]' : 'text-text-muted'}`}
                      style={isActive ? { color: 'var(--color-accent)' } : undefined}
                    />
                  )}
                </div>
                <span
                  className={`text-[7px] font-bold uppercase tracking-wider leading-none ${
                    isActive ? '' : 'text-text-muted'
                  }`}
                  style={isActive ? { color: 'var(--color-accent)' } : undefined}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
