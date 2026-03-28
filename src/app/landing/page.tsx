'use client';

import { useState, useEffect } from 'react';

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

export default function LandingPage() {
  const isHuman = useHumanCheck();

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

        /* ══════ NOISE GRAIN OVERLAY ══════ */
        .ld::before {
          content: '';
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          pointer-events: none;
          z-index: 50;
          opacity: 0.6;
          animation: grainShift 0.5s steps(4) infinite;
        }
        @keyframes grainShift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 1%); }
          50% { transform: translate(1%, -2%); }
          75% { transform: translate(-1%, 2%); }
          100% { transform: translate(2%, -1%); }
        }

        /* ══════ BRICK WALL TEXTURE ══════ */
        .wall {
          position: fixed;
          inset: 0;
          background:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 38px,
              rgba(255,255,255,0.018) 38px,
              rgba(255,255,255,0.018) 40px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 78px,
              rgba(255,255,255,0.012) 78px,
              rgba(255,255,255,0.012) 80px
            );
          z-index: 0;
        }
        .wall::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(229,62,62,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(237,137,54,0.05) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.4) 0%, transparent 50%);
        }

        /* ══════ PAINT DRIPS ══════ */
        .drip {
          position: absolute;
          width: 3px;
          background: linear-gradient(180deg, var(--red), transparent);
          border-radius: 0 0 3px 3px;
          opacity: 0.15;
          z-index: 2;
        }

        /* ══════ SPRAY PAINT CIRCLES ══════ */
        .spray-circle {
          position: absolute;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0.06;
          z-index: 2;
          pointer-events: none;
        }

        /* ══════ GHOST HERO ══════ */
        .hero-ghost {
          position: relative;
          width: 100%;
          max-width: 320px;
          aspect-ratio: 1;
          margin: 0 auto;
          z-index: 5;
        }
        .hero-ghost img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 3;
          filter: drop-shadow(0 0 60px rgba(229,62,62,0.3)) drop-shadow(0 0 120px rgba(229,62,62,0.1));
          animation: ghostHover 5s ease-in-out infinite;
        }
        @keyframes ghostHover {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(0.5deg); }
          75% { transform: translateY(4px) rotate(-0.5deg); }
        }

        /* Red glow behind ghost */
        .hero-ghost::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80%;
          height: 80%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(229,62,62,0.15) 0%, transparent 65%);
          z-index: 1;
          animation: glowPulse 3s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.15); }
        }

        /* Smoke wisps */
        .smoke {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,200,220,0.08), transparent 70%);
          filter: blur(20px);
          z-index: 2;
          pointer-events: none;
        }
        .smoke-a {
          width: 150px; height: 150px;
          top: -10%; left: -15%;
          animation: smokeA 7s ease-in-out infinite;
        }
        .smoke-b {
          width: 120px; height: 120px;
          top: -5%; right: -10%;
          animation: smokeB 9s ease-in-out infinite 1.5s;
        }
        .smoke-c {
          width: 180px; height: 180px;
          bottom: -20%; left: 30%;
          animation: smokeC 8s ease-in-out infinite 0.8s;
        }
        @keyframes smokeA {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; }
          50% { transform: translate(-15px, -30px) scale(1.4); opacity: 0.1; }
        }
        @keyframes smokeB {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.4; }
          50% { transform: translate(20px, -25px) scale(1.5); opacity: 0.08; }
        }
        @keyframes smokeC {
          0%, 100% { transform: translate(0,0) scale(1.1); opacity: 0.35; }
          50% { transform: translate(-10px, -35px) scale(1.6); opacity: 0.05; }
        }

        /* ══════ HEADLINE ══════ */
        .headline-wrap {
          position: relative;
          z-index: 5;
          text-align: center;
        }
        .headline {
          font-family: 'Permanent Marker', cursive;
          color: #E2E8F0;
          font-size: clamp(32px, 9vw, 44px);
          line-height: 1.1;
          text-shadow: 3px 3px 0 rgba(229,62,62,0.35);
          transform: rotate(-2deg);
        }

        /* Red underline slash */
        .slash {
          display: block;
          width: 70%;
          height: 4px;
          margin: 6px auto 0;
          background: linear-gradient(90deg, transparent, var(--red), var(--orange), transparent);
          border-radius: 2px;
          opacity: 0.7;
        }

        /* ══════ SUB TEXT ══════ */
        .sub-text {
          color: #A0AEC0;
          font-size: clamp(14px, 3.8vw, 16px);
          text-align: center;
          line-height: 1.6;
          z-index: 5;
          position: relative;
          letter-spacing: 0.3px;
        }
        .sub-text strong {
          color: #E2E8F0;
          font-weight: 600;
        }

        /* ══════ TAGS / FEATURES ══════ */
        .tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          z-index: 5;
          position: relative;
        }
        .tag {
          padding: 6px 14px;
          border: 1px solid rgba(229,62,62,0.2);
          border-radius: 2px;
          color: #CBD5E0;
          font-size: 13px;
          background: rgba(229,62,62,0.05);
          transform: rotate(-0.5deg);
          letter-spacing: 0.5px;
        }
        .tag:nth-child(2) {
          border-color: rgba(237,137,54,0.2);
          background: rgba(237,137,54,0.05);
          transform: rotate(0.8deg);
        }
        .tag:nth-child(3) {
          transform: rotate(-1deg);
        }

        /* ══════ CTA BUTTON ══════ */
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(229,62,62,0.3), 0 4px 30px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 40px rgba(229,62,62,0.5), 0 0 80px rgba(237,137,54,0.2), 0 4px 30px rgba(0,0,0,0.5); }
        }
        @keyframes shineSwipe {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(300%) skewX(-15deg); }
        }

        .cta {
          display: block;
          width: 100%;
          padding: 22px 20px;
          background: linear-gradient(135deg, #C53030 0%, #E53E3E 40%, #ED8936 100%);
          color: #fff;
          font-family: 'Permanent Marker', cursive;
          font-size: clamp(20px, 5.5vw, 24px);
          text-align: center;
          text-decoration: none;
          letter-spacing: 1.5px;
          border: none;
          border-radius: 3px;
          transform: rotate(-0.5deg);
          animation: ctaPulse 2.5s ease-in-out infinite;
          position: relative;
          overflow: hidden;
          z-index: 5;
          -webkit-tap-highlight-color: transparent;
          cursor: pointer;
          text-shadow: 1px 2px 4px rgba(0,0,0,0.4);
        }
        .cta::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shineSwipe 3s ease-in-out infinite 1s;
        }
        .cta:active {
          transform: scale(0.97) rotate(-0.5deg);
          filter: brightness(1.15);
        }
        @media (hover: hover) {
          .cta:hover {
            filter: brightness(1.12);
            transform: scale(1.02) rotate(-0.5deg);
          }
        }

        /* ══════ WAIT PROMPT ══════ */
        .wait-prompt {
          text-align: center;
          color: #4A5568;
          font-size: 14px;
          padding: 22px 0;
          z-index: 5;
          position: relative;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ══════ GRAFFITI TAGS (background) ══════ */
        .graf-tag {
          position: absolute;
          font-family: 'Permanent Marker', cursive;
          pointer-events: none;
          user-select: none;
          z-index: 1;
        }

        /* ══════ SCANLINES ══════ */
        .scanlines {
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 40;
        }

        /* ══════ FADE IN ══════ */
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rise { animation: riseIn 0.7s ease-out both; }
        .rise-1 { animation-delay: 0.05s; }
        .rise-2 { animation-delay: 0.2s; }
        .rise-3 { animation-delay: 0.35s; }
        .rise-4 { animation-delay: 0.5s; }
        .rise-5 { animation-delay: 0.65s; }

        /* ══════ CONTENT WRAPPER ══════ */
        .content {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 24px 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          flex: 1;
          justify-content: center;
        }
      `}</style>

      <div className="ld">
        {/* Texture layers */}
        <div className="wall" />
        <div className="scanlines" />

        {/* Paint drips */}
        <div className="drip" style={{ left: '15%', top: 0, height: 120 }} />
        <div className="drip" style={{ left: '72%', top: 0, height: 80, opacity: 0.1 }} />
        <div className="drip" style={{ right: '10%', top: 0, height: 180, opacity: 0.08, background: 'linear-gradient(180deg, #ED8936, transparent)' }} />
        <div className="drip" style={{ left: '45%', top: 0, height: 50, opacity: 0.12 }} />

        {/* Spray circles */}
        <div className="spray-circle" style={{ width: 120, height: 120, top: '5%', right: '5%', borderColor: 'var(--red)' }} />
        <div className="spray-circle" style={{ width: 60, height: 60, bottom: '12%', left: '8%', borderColor: 'var(--orange)' }} />

        {/* Graffiti tags */}
        <span className="graf-tag" style={{ top: '6%', left: '3%', fontSize: 80, color: 'rgba(229,62,62,0.04)', transform: 'rotate(-20deg)' }}>DUH</span>
        <span className="graf-tag" style={{ bottom: '8%', right: '2%', fontSize: 50, color: 'rgba(237,137,54,0.04)', transform: 'rotate(15deg)' }}>SPIRIT</span>
        <span className="graf-tag" style={{ top: '45%', right: '-2%', fontSize: 28, color: 'rgba(229,62,62,0.05)', transform: 'rotate(90deg)' }}>GETTO</span>
        <span className="graf-tag" style={{ bottom: '30%', left: '2%', fontSize: 22, color: 'rgba(255,255,255,0.03)', transform: 'rotate(-90deg)', letterSpacing: 4 }}>BAR</span>

        <div className="content">
          {/* GHOST */}
          <div className="hero-ghost rise rise-1">
            <div className="smoke smoke-a" />
            <div className="smoke smoke-b" />
            <div className="smoke smoke-c" />
            <img
              src="/spiritnew.jpeg"
              alt="DUH THE SPIRIT"
              width={320}
              height={320}
              loading="eager"
            />
          </div>

          {/* HEADLINE */}
          <div className="headline-wrap rise rise-2">
            <div className="headline">
              DUH THE SPIRIT
            </div>
            <span className="slash" />
            <div className="gf" style={{
              color: '#E53E3E',
              fontSize: 'clamp(18px, 5vw, 24px)',
              textAlign: 'center',
              marginTop: 8,
              transform: 'rotate(1deg)',
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
              letterSpacing: 2,
            }}>
              ВЫБЕРИСЬ ИЗ ГЕТТО
            </div>
          </div>

          {/* HOOK */}
          <p className="sub-text rise rise-3">
            Симулятор жизни <strong>с биполяркой</strong>.<br/>
            Тебя ждёт дно. Сможешь подняться?
          </p>

          {/* TAGS */}
          <div className="tags rise rise-4">
            <span className="tag">Рэпер</span>
            <span className="tag">Авторитет</span>
            <span className="tag">NPC</span>
          </div>

          {/* CTA */}
          <div className="rise rise-5" style={{ width: '100%' }}>
            {isHuman ? (
              <a href="/auth" className="cta">
                ИГРАТЬ БЕСПЛАТНО
              </a>
            ) : (
              <div className="wait-prompt">
                &#9660; ТАПНИ ЧТОБЫ ПРОДОЛЖИТЬ &#9660;
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
