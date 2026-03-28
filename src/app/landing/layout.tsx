import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DUH THE SPIRIT — Выберись из гетто',
  description: 'RPG-симулятор жизни с биполяркой. Стань рэпером, авторитетом или останься NPC. Бесплатно в Telegram.',
  openGraph: {
    title: 'DUH THE SPIRIT — Выберись из гетто',
    description: 'Биполярка. Улица. Один шанс. Бесплатная RPG в Telegram.',
    images: ['/spiritnew.jpeg'],
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DUH THE SPIRIT',
    description: 'RPG-симулятор жизни с биполяркой. Бесплатно в Telegram.',
    images: ['/spiritnew.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
