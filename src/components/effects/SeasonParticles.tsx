'use client';

import { useEffect, useRef, useState } from 'react';
import { useSeason } from '@/stores/game-store';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  char?: string;
}

const isMobile = typeof window !== 'undefined' && window.innerWidth < 500;
const MOBILE_FACTOR = isMobile ? 0.3 : 1;

const SEASON_CONFIG = {
  autumn: {
    count: Math.round(12 * MOBILE_FACTOR),
    chars: isMobile ? ['·', '•', '◦'] : ['🍂', '🍁'],
    color: '#ff8c42',
    sizeRange: isMobile ? [3, 8] : [10, 18],
    speedRange: [0.5, 1.5],
    driftRange: [-0.5, 0.5],
  },
  winter: {
    count: Math.round(20 * MOBILE_FACTOR),
    chars: ['·', '•', '◦'],
    color: '#a8c8ff',
    sizeRange: [3, 8],
    speedRange: [0.3, 1.0],
    driftRange: [-0.8, 0.8],
  },
  spring: {
    count: Math.round(10 * MOBILE_FACTOR),
    chars: isMobile ? ['·', '•', '★'] : ['✦', '⚡', '★'],
    color: '#ff2d7b',
    sizeRange: isMobile ? [3, 8] : [6, 14],
    speedRange: [0.8, 2.0],
    driftRange: [-1.0, 1.0],
  },
  summer: {
    count: Math.round(8 * MOBILE_FACTOR),
    chars: isMobile ? ['·', '♪'] : ['♪', '♫', '🔥'],
    color: '#ffd700',
    sizeRange: isMobile ? [3, 8] : [8, 14],
    speedRange: [0.2, 0.8],
    driftRange: [-0.3, 0.3],
  },
} as const;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function SeasonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const season = useSeason();
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  // Delay start to let app hydrate first
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = SEASON_CONFIG[season.id as keyof typeof SEASON_CONFIG] || SEASON_CONFIG.autumn;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    particlesRef.current = Array.from({ length: config.count }, () => ({
      x: rand(0, canvas.width),
      y: rand(-canvas.height, 0),
      size: rand(config.sizeRange[0], config.sizeRange[1]),
      speed: rand(config.speedRange[0], config.speedRange[1]),
      drift: rand(config.driftRange[0], config.driftRange[1]),
      opacity: rand(0.15, 0.45),
      char: config.chars[Math.floor(Math.random() * config.chars.length)],
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.y += p.speed;
        p.x += p.drift + Math.sin(p.y * 0.01) * 0.3;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = rand(0, canvas.width);
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.fillStyle = config.color;
        ctx.fillText(p.char || '·', p.x, p.y);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [season.id, ready]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.35, willChange: 'transform' }}
    />
  );
}
