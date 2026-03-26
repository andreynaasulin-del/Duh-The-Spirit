import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Permanent_Marker } from "next/font/google";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AgeGate } from "@/components/game/AgeGate";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const marker = Permanent_Marker({
  variable: "--font-marker",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duh The Spirit",
  description: "Выживай. Зарабатывай. Не теряй рассудок.",
  keywords: ["game", "rpg", "telegram", "mini app", "interactive fiction", "rapper"],
  authors: [{ name: "@duhthespiritbot" }],
  icons: {
    icon: '/favicon.jpg',
    apple: '/apple-touch-icon.jpg',
  },
  openGraph: {
    title: "Duh The Spirit",
    description: "Выживай. Зарабатывай. Не теряй рассудок.",
    type: "website",
    images: [{ url: '/og-image.jpg', width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrains.variable} ${marker.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="min-h-dvh bg-bg-primary text-text-primary overflow-x-hidden" suppressHydrationWarning>
        <TelegramProvider>
          <SupabaseProvider>
            <ThemeProvider>
              <AgeGate>
                {children}
              </AgeGate>
            </ThemeProvider>
          </SupabaseProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
