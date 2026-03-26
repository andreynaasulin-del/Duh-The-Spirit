'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Heart, X } from 'lucide-react';
import { detectSafetyLevel, HELPLINE_INFO, type SafetyLevel } from '@/config/safety';
import { ComicBubble } from './ComicBubble';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DoctorChatProps {
  onClose: () => void;
}

export function DoctorChat({ onClose }: DoctorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Рад что зашёл. Тут нет осуждения — только разговор. Как ты себя сегодня чувствуешь?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [currentSafety, setCurrentSafety] = useState<SafetyLevel>('safe');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // Client-side safety check BEFORE sending
    const safety = detectSafetyLevel(text);
    setCurrentSafety(safety);

    if (safety === 'crisis') {
      setShowCrisisBanner(true);
    }

    // Add user message
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/doctor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (data.safetyLevel === 'crisis') {
        setShowCrisisBanner(true);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Связь прервалась. Но я тут. Попробуй ещё раз.',
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000',
        zIndex: 99999,
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b border-white/10">
        <div
          className="w-10 h-10 flex items-center justify-center text-xl rounded-full"
          style={{ backgroundColor: 'rgba(0,230,180,0.1)', border: '2px solid #00e6b4' }}
        >
          🧠
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Док</p>
          <p className="text-[10px] text-text-muted">Терапевт • Конфиденциально</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-text-muted">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Crisis banner */}
      <AnimatePresence>
        {showCrisisBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="p-4 mx-3 mt-3 rounded-xl" style={{ backgroundColor: 'rgba(255,45,45,0.1)', border: '1px solid rgba(255,45,45,0.3)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <p className="text-sm font-bold text-red-400">{HELPLINE_INFO.title}</p>
                <button
                  onClick={() => setShowCrisisBanner(false)}
                  className="ml-auto text-text-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-red-300/80 mb-3">{HELPLINE_INFO.message}</p>
              {HELPLINE_INFO.lines.map((line) => (
                <a
                  key={line.number}
                  href={`tel:${line.number.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2 p-2 mb-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgba(255,45,45,0.1)', border: '1px solid rgba(255,45,45,0.2)' }}
                >
                  <Phone className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-sm font-bold text-white">{line.number}</p>
                    <p className="text-[10px] text-red-300/60">{line.name} • {line.note}</p>
                  </div>
                </a>
              ))}
              <p className="text-[10px] text-red-300/50 mt-2 italic">{HELPLINE_INFO.footer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="flex-shrink-0 px-4 py-2">
        <p className="text-[9px] text-text-muted text-center">
          Это игровой персонаж, не заменяет реальную помощь. Телефон доверия: 8-800-2000-122
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' ? (
              <div className="max-w-[85%]">
                <ComicBubble variant="speech" color="#00e6b4" tailDirection="left">
                  <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                </ComicBubble>
              </div>
            ) : (
              <div
                className="max-w-[85%] px-4 py-3"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px 16px 4px 16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <p className="text-sm text-white/90 leading-relaxed">{msg.content}</p>
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(0,230,180,0.05)', border: '1px solid rgba(0,230,180,0.2)' }}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 border-t border-white/10">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напиши что чувствуешь..."
            maxLength={500}
            className="flex-1 px-4 py-3 text-sm text-white placeholder-text-muted bg-transparent outline-none"
            style={{
              border: '2px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00e6b450')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition-colors disabled:opacity-30"
            style={{
              backgroundColor: input.trim() ? '#00e6b4' : 'rgba(255,255,255,0.05)',
            }}
          >
            <Send className="w-5 h-5" style={{ color: input.trim() ? '#000' : '#666' }} />
          </button>
        </form>
      </div>
    </div>
  );
}
