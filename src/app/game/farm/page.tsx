'use client';

import { motion } from 'framer-motion';

const LOCATION_MAP: Record<string, { title: string; subtitle: string; emoji: string }> = {
  street: { title: 'УЛИЦА', subtitle: 'Хастл, работа, случайные встречи', emoji: '🌆' },
  club: { title: 'КЛУБ', subtitle: 'Студия, баттлы, музыка', emoji: '🎤' },
  farm: { title: 'ФЕРМА', subtitle: 'Майнинг, теплица, крипта', emoji: '⛏️' },
  shop: { title: 'МАРКЕТ', subtitle: 'Купить, продать, экипировка', emoji: '🛒' },
  casino: { title: 'КАЗИНО', subtitle: 'Слоты, кости, блэкджек', emoji: '🎰' },
  doctor: { title: 'ДОКТОР', subtitle: 'Лечение, импланты, терапия', emoji: '🏥' },
  prison: { title: 'ТЮРЬМА', subtitle: 'Выживание за решёткой', emoji: '🔒' },
  memory: { title: 'ПАМЯТЬ', subtitle: 'История, достижения, лор', emoji: '🧠' },
};

export default function LocationPage() {
  const path = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : '';
  const loc = LOCATION_MAP[path] || { title: 'ЗАГРУЗКА...', subtitle: '', emoji: '⏳' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-4"
    >
      <span className="text-5xl">{loc.emoji}</span>
      <h1 className="text-xl font-bold tracking-tight">{loc.title}</h1>
      <p className="text-sm text-text-muted text-center">{loc.subtitle}</p>
      <div className="card-street px-4 py-2 text-xs text-text-muted">
        В разработке — скоро здесь будет жарко
      </div>
    </motion.div>
  );
}
