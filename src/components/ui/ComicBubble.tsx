'use client';

/**
 * Comic-style speech bubbles — SVG based, no images needed.
 * Styles: speech (rounded with tail), shout (starburst), thought (cloud)
 */

interface ComicBubbleProps {
  children: React.ReactNode;
  variant?: 'speech' | 'shout' | 'thought';
  color?: string;
  tailDirection?: 'left' | 'center' | 'right';
  className?: string;
}

export function ComicBubble({
  children,
  variant = 'speech',
  color = '#ffffff',
  tailDirection = 'center',
  className = '',
}: ComicBubbleProps) {
  if (variant === 'shout') {
    return <ShoutBubble color={color} className={className}>{children}</ShoutBubble>;
  }

  if (variant === 'thought') {
    return <ThoughtBubble color={color} className={className}>{children}</ThoughtBubble>;
  }

  return (
    <SpeechBubble color={color} tailDirection={tailDirection} className={className}>
      {children}
    </SpeechBubble>
  );
}

// === SPEECH BUBBLE — classic rounded with tail ===
function SpeechBubble({
  children,
  color,
  tailDirection,
  className,
}: {
  children: React.ReactNode;
  color: string;
  tailDirection: 'left' | 'center' | 'right';
  className: string;
}) {
  const tailX = tailDirection === 'left' ? '25%' : tailDirection === 'right' ? '75%' : '50%';

  return (
    <div className={`relative ${className}`}>
      {/* Main bubble */}
      <div
        className="relative px-5 py-4"
        style={{
          background: '#0d0d0d',
          border: `2px solid ${color}`,
          borderRadius: '20px 20px 20px 4px',
          boxShadow: `4px 4px 0px ${color}30`,
        }}
      >
        {children}
      </div>

      {/* Tail */}
      <svg
        width="24"
        height="16"
        viewBox="0 0 24 16"
        fill="none"
        className="absolute -bottom-[14px]"
        style={{ left: tailX, transform: 'translateX(-50%)' }}
      >
        <path
          d="M0 0 L12 14 L24 0"
          fill="#0d0d0d"
          stroke={color}
          strokeWidth="2"
        />
        {/* Cover the top border line */}
        <rect x="1" y="0" width="22" height="2" fill="#0d0d0d" />
      </svg>
    </div>
  );
}

// === SHOUT BUBBLE — starburst/explosion for dramatic moments ===
function ShoutBubble({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: string;
  className: string;
}) {
  // Generate starburst points
  const points = 12;
  const outerR = 50;
  const innerR = 38;
  const pathParts: string[] = [];

  for (let i = 0; i < points; i++) {
    const outerAngle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const innerAngle = ((i + 0.5) / points) * Math.PI * 2 - Math.PI / 2;

    const ox = 50 + outerR * Math.cos(outerAngle);
    const oy = 50 + outerR * Math.sin(outerAngle);
    const ix = 50 + innerR * Math.cos(innerAngle);
    const iy = 50 + innerR * Math.sin(innerAngle);

    if (i === 0) {
      pathParts.push(`M ${ox} ${oy}`);
    } else {
      pathParts.push(`L ${ox} ${oy}`);
    }
    pathParts.push(`L ${ix} ${iy}`);
  }
  pathParts.push('Z');

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d={pathParts.join(' ')}
          fill="#0d0d0d"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <div className="relative z-10 px-8 py-6 text-center">
        {children}
      </div>
    </div>
  );
}

// === THOUGHT BUBBLE — cloud-like with small circles ===
function ThoughtBubble({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: string;
  className: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Main cloud */}
      <div
        className="relative px-5 py-4"
        style={{
          background: '#0d0d0d',
          border: `2px solid ${color}40`,
          borderRadius: '24px',
          boxShadow: `3px 3px 0px ${color}15`,
        }}
      >
        {children}
      </div>

      {/* Thought dots */}
      <div className="absolute -bottom-3 left-8 flex items-end gap-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: '#0d0d0d', border: `1.5px solid ${color}40` }}
        />
        <div
          className="w-2 h-2 rounded-full -mb-2"
          style={{ background: '#0d0d0d', border: `1.5px solid ${color}40` }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full -mb-4"
          style={{ background: '#0d0d0d', border: `1px solid ${color}40` }}
        />
      </div>
    </div>
  );
}
