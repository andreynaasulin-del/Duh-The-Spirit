'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Anti-bot: CTA unlocks after interaction ─── */
function useHumanCheck() {
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    if (verified) return;
    const mark = () => setVerified(true);
    window.addEventListener('touchstart', mark, { once: true, passive: true });
    window.addEventListener('scroll', mark, { once: true, passive: true });
    window.addEventListener('mousemove', mark, { once: true, passive: true });
    return () => {
      window.removeEventListener('touchstart', mark);
      window.removeEventListener('scroll', mark);
      window.removeEventListener('mousemove', mark);
    };
  }, [verified]);
  return verified;
}

/* ─── Fake live counter for social proof ─── */
function usePlayerCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const base = 847 + Math.floor((Date.now() / 86400000) % 200);
    setCount(base);
    const iv = setInterval(() => {
      setCount(c => c + (Math.random() > 0.6 ? 1 : 0));
    }, 8000);
    return () => clearInterval(iv);
  }, []);
  return count;
}

/* ─── Pass UTMs from ad network to CTA ─── */
function getAuthUrl() {
  if (typeof window === 'undefined') return '/auth';
  const params = new URLSearchParams(window.location.search);
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const keep = new URLSearchParams();
  utms.forEach(k => { const v = params.get(k); if (v) keep.set(k, v); });
  const qs = keep.toString();
  return qs ? `/auth?${qs}` : '/auth';
}

export default function LandingPage() {
  const isHuman = useHumanCheck();
  const playerCount = usePlayerCount();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .ld {
          --red: #E53E3E;
          --orange: #ED8936;
          --dark: #0A0E17;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100dvh;
          background: var(--dark);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .gf { font-family: 'Permanent Marker', cursive; }

        /* ══════ GRAIN ══════ */
        .ld::before {
          content: '';
          position: fixed; inset: -50%;
          width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          pointer-events: none; z-index: 50; opacity: 0.5;
          animation: grain 0.5s steps(4) infinite;
        }
        @keyframes grain {
          0% { transform: translate(0,0); }
          25% { transform: translate(-2%,1%); }
          50% { transform: translate(1%,-2%); }
          75% { transform: translate(-1%,2%); }
          100% { transform: translate(2%,-1%); }
        }

        /* ══════ WALL ══════ */
        .wall {
          position: fixed; inset: 0; z-index: 0;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(255,255,255,0.015) 38px, rgba(255,255,255,0.015) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 78px, rgba(255,255,255,0.01) 78px, rgba(255,255,255,0.01) 80px);
        }
        .wall::after {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 15%, rgba(229,62,62,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 75%, rgba(237,137,54,0.05) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.7) 0%, transparent 60%);
        }

        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 40;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
        }

        /* ══════ DRIPS ══════ */
        .drip { position: absolute; width: 3px; background: linear-gradient(180deg, var(--red), transparent); border-radius: 0 0 3px 3px; opacity: 0.15; z-index: 2; }

        /* ══════ GRAFFITI BG ══════ */
        .graf { position: absolute; font-family: 'Permanent Marker', cursive; pointer-events: none; user-select: none; z-index: 1; }

        /* ══════ GHOST ══════ */
        .ghost {
          position: relative;
          width: clamp(150px, 42vw, 200px);
          aspect-ratio: 1;
          margin: 0 auto;
          z-index: 5;
        }
        .ghost img {
          width: 100%; height: 100%; object-fit: contain;
          position: relative; z-index: 3;
          filter: drop-shadow(0 0 50px rgba(229,62,62,0.3));
          animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .ghost::before {
          content: ''; position: absolute; top: 50%; left: 50%;
          width: 75%; height: 75%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(229,62,62,0.18) 0%, transparent 65%);
          z-index: 1;
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%,-50%) scale(1.2); }
        }
        .smk {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,200,220,0.07), transparent 70%);
          filter: blur(18px); z-index: 2; pointer-events: none;
        }
        .smk-a { width: 130px; height: 130px; top: -8%; left: -12%; animation: sa 7s ease-in-out infinite; }
        .smk-b { width: 100px; height: 100px; top: -3%; right: -8%; animation: sb 9s ease-in-out infinite 1.5s; }
        @keyframes sa { 0%,100%{transform:translate(0,0) scale(1);opacity:.4} 50%{transform:translate(-12px,-25px) scale(1.3);opacity:.08} }
        @keyframes sb { 0%,100%{transform:translate(0,0) scale(1);opacity:.3} 50%{transform:translate(15px,-20px) scale(1.4);opacity:.06} }

        /* ══════ CONTENT ══════ */
        .cnt {
          position: relative; z-index: 5;
          width: 100%; max-width: 400px;
          margin: 0 auto;
          padding: 12px 20px 24px;
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          flex: 1;
        }

        /* ══════ HEADLINE ══════ */
        .h-wrap { position: relative; z-index: 5; text-align: center; }
        .h1 {
          font-family: 'Permanent Marker', cursive;
          color: #E2E8F0;
          font-size: clamp(26px, 7.5vw, 38px);
          line-height: 1.05;
          text-shadow: 3px 3px 0 rgba(229,62,62,0.35);
          transform: rotate(-1.5deg);
        }
        .h-slash {
          display: block; width: 65%; height: 3px;
          margin: 5px auto 0;
          background: linear-gradient(90deg, transparent, var(--red), var(--orange), transparent);
          border-radius: 2px; opacity: 0.6;
        }
        .h-sub {
          font-family: 'Permanent Marker', cursive;
          color: var(--red);
          font-size: clamp(17px, 4.5vw, 22px);
          text-align: center; margin-top: 6px;
          transform: rotate(0.8deg);
          text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
          letter-spacing: 1.5px;
        }

        /* ══════ HOOK TEXT ══════ */
        .hook {
          color: #A0AEC0; font-size: clamp(14px, 3.6vw, 15px);
          text-align: center; line-height: 1.6; z-index: 5; position: relative;
        }
        .hook b { color: #E2E8F0; font-weight: 600; }
        .hook em { color: var(--red); font-style: normal; font-weight: 600; }

        /* ══════ SELLING POINTS ══════ */
        .points {
          display: flex; flex-direction: column; gap: 8px;
          width: 100%; z-index: 5; position: relative;
        }
        .point {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.025);
          border-left: 2px solid var(--red);
          border-radius: 0 3px 3px 0;
          color: #CBD5E0; font-size: 13px; line-height: 1.4;
        }
        .point:nth-child(2) { border-left-color: var(--orange); }
        .point:nth-child(3) { border-left-color: #9F7AEA; }
        .point-icon { font-size: 18px; flex-shrink: 0; }

        /* ══════ SOCIAL PROOF ══════ */
        .proof {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          z-index: 5; position: relative;
          color: #4A5568; font-size: 12px;
        }
        .proof-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #48BB78;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .proof-num { color: #68D391; font-weight: 600; }

        /* ══════ CTA ══════ */
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(229,62,62,0.3), 0 4px 30px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 45px rgba(229,62,62,0.5), 0 0 90px rgba(237,137,54,0.2), 0 4px 30px rgba(0,0,0,0.5); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }
        .cta {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 20px 20px;
          background: linear-gradient(135deg, #C53030 0%, #E53E3E 40%, #ED8936 100%);
          color: #fff;
          font-family: 'Permanent Marker', cursive;
          font-size: clamp(18px, 5vw, 22px);
          text-align: center; text-decoration: none;
          letter-spacing: 1px;
          border: none; border-radius: 3px;
          transform: rotate(-0.3deg);
          animation: ctaPulse 2.5s ease-in-out infinite;
          position: relative; overflow: hidden;
          z-index: 5; cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          text-shadow: 1px 2px 4px rgba(0,0,0,0.4);
        }
        .cta::after {
          content: ''; position: absolute; top: 0; left: 0;
          width: 35%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shine 3s ease-in-out infinite 1s;
        }
        .cta:active { transform: scale(0.97) rotate(-0.3deg); filter: brightness(1.15); }
        @media (hover: hover) { .cta:hover { filter: brightness(1.12); transform: scale(1.02) rotate(-0.3deg); } }
        .cta svg { flex-shrink: 0; }

        .cta-sub {
          text-align: center; color: #4A5568; font-size: 11px;
          z-index: 5; position: relative; letter-spacing: 0.3px;
        }

        /* ══════ WAIT ══════ */
        .wait {
          text-align: center; color: #4A5568; font-size: 14px;
          padding: 20px 0; z-index: 5; position: relative;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ══════ RISE IN ══════ */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(25px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .r { animation: riseIn 0.6s ease-out both; }
        .r1 { animation-delay: 0.05s; }
        .r2 { animation-delay: 0.15s; }
        .r3 { animation-delay: 0.25s; }
        .r4 { animation-delay: 0.35s; }
        .r5 { animation-delay: 0.45s; }
        .r6 { animation-delay: 0.55s; }
      `}</style>

      <div className="ld">
        <div className="wall" />
        <div className="scanlines" />

        <div className="drip" style={{ left: '15%', top: 0, height: 100 }} />
        <div className="drip" style={{ left: '72%', top: 0, height: 70, opacity: 0.1 }} />
        <div className="drip" style={{ right: '10%', top: 0, height: 140, opacity: 0.08, background: 'linear-gradient(180deg, #ED8936, transparent)' }} />

        <span className="graf" style={{ top: '5%', left: '2%', fontSize: 70, color: 'rgba(229,62,62,0.04)', transform: 'rotate(-18deg)' }}>DUH</span>
        <span className="graf" style={{ bottom: '6%', right: '1%', fontSize: 45, color: 'rgba(237,137,54,0.04)', transform: 'rotate(14deg)' }}>SPIRIT</span>

        <div className="cnt">
          {/* GHOST — compact */}
          <div className="ghost r r1">
            <div className="smk smk-a" />
            <div className="smk smk-b" />
            <img src="/spiritnew.jpeg" alt="DUH THE SPIRIT" width={260} height={260} loading="eager" />
          </div>

          {/* HEADLINE */}
          <div className="h-wrap r r2">
            <div className="h1">DUH THE SPIRIT</div>
            <span className="h-slash" />
            <div className="h-sub">ВЫБЕРИСЬ ИЗ ГЕТТО</div>
          </div>

          {/* HOOK — emotional, short */}
          <p className="hook r r3">
            <em>Биполярка. Улица. Один шанс.</em><br/>
            Стань рэпером, авторитетом или сдохни NPC.
          </p>

          {/* SELLING POINTS — why play */}
          <div className="points r r4">
            <div className="point">
              <span className="point-icon">&#127908;</span>
              Треки, баттлы, фанаты — путь рэпера
            </div>
            <div className="point">
              <span className="point-icon">&#128163;</span>
              Криминал, казино, тюрьма — путь авторитета
            </div>
          </div>

          {/* CTA */}
          <div className="r r5" style={{ width: '100%' }}>
            {isHuman ? (
              <>
                <a href={getAuthUrl()} className="cta">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 8-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.53.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/></svg>
                  ИГРАТЬ БЕСПЛАТНО
                </a>
                <p className="cta-sub" style={{ marginTop: 8 }}>Telegram-игра, без скачивания</p>
              </>
            ) : (
              <div className="wait">&#9660; ТАПНИ ЧТОБЫ ПРОДОЛЖИТЬ &#9660;</div>
            )}
          </div>

          {/* SOCIAL PROOF */}
          <div className="proof r r6">
            <div className="proof-dot" />
            <span><span className="proof-num">{playerCount}</span> играют прямо сейчас</span>
          </div>
        </div>
      </div>
    </>
  );
}
