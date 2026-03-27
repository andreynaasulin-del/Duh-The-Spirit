'use client';

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

const NAV_ITEMS = [
  { href: '/game/home', icon: Home, label: 'База' },
  { href: '/game/street', icon: MapPin, label: 'Улица' },
  { href: '/game/club', icon: Music, label: 'Клуб' },
  { href: '/game/farm', icon: Cpu, label: 'Лаба' },
  { href: '/game/shop', icon: ShoppingBag, label: 'Маркет' },
  { href: '/game/casino', icon: Dice5, label: 'Казино' },
  { href: '/game/doctor', icon: Stethoscope, label: 'Док' },
  { href: '/game/prison', icon: Lock, label: 'Тюрьма' },
  { href: '/game/memory', icon: Brain, label: 'Память' },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-t-2 border-white/10 safe-area-bottom">
      <div
        className="flex items-center px-1 py-1 max-w-lg mx-auto overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname?.startsWith(href + '/');

          return (
            <button
              key={href}
              onClick={() => {
                window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
                router.push(href);
              }}
              className="flex flex-col items-center gap-0.5 px-1 py-1 min-w-[38px] shrink-0 transition-all relative"
            >
              {/* Active indicator — manga accent box */}
              {isActive && (
                <div
                  className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-6 h-[2px]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              )}
              <div
                className={`
                  w-7 h-7 flex items-center justify-center rounded-[2px] transition-all
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
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--color-accent)]' : 'text-text-muted'}`}
                  style={isActive ? { color: 'var(--color-accent)' } : undefined}
                />
              </div>
              <span
                className={`text-[8px] font-bold uppercase tracking-wider leading-none ${
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
  );
}
