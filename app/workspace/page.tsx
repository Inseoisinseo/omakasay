'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceNavbar, type Language } from '@/components/workspace/navbar';
import { PHRASES } from '@/components/workspace/phrases';
import { ArrowUp, Square, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BLOCK_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.12)',  border: 'rgba(99, 102, 241, 0.28)'  },
  { bg: 'rgba(168, 85, 247, 0.12)',  border: 'rgba(168, 85, 247, 0.28)'  },
  { bg: 'rgba(20, 184, 166, 0.12)',  border: 'rgba(20, 184, 166, 0.28)'  },
  { bg: 'rgba(239, 68, 68, 0.10)',   border: 'rgba(239, 68, 68, 0.26)'   },
  { bg: 'rgba(234, 179, 8, 0.10)',   border: 'rgba(234, 179, 8, 0.26)'   },
  { bg: 'rgba(59, 130, 246, 0.12)',  border: 'rgba(59, 130, 246, 0.28)'  },
  { bg: 'rgba(34, 197, 94, 0.10)',   border: 'rgba(34, 197, 94, 0.26)'   },
  { bg: 'rgba(249, 115, 22, 0.10)',  border: 'rgba(249, 115, 22, 0.26)'  },
];

let currentAudio: HTMLAudioElement | null = null;

async function speak(text: string, langCode: string) {
  currentAudio?.pause();
  currentAudio = null;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, langCode }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    currentAudio = audio;
    audio.play();
  } catch {
    // silent fail
  }
}

export default function WorkspacePage() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const phrases = selectedLang ? PHRASES[selectedLang.code] : [];
  const hasContent = input.trim().length > 0;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const handleCardClick = (native: string) => {
    if (!selectedLang) return;
    speak(native, selectedLang.code);
  };

  const handleTranslate = async () => {
    if (!hasContent || !selectedLang || loading) return;
    setLoading(true);
    setTranslation('');
    setError('');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim(), langCode: selectedLang.code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '번역 실패');
        return;
      }
      if (data.translated) {
        setTranslation(data.translated);
        speak(data.translated, selectedLang.code);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#171717' }}>
      <WorkspaceNavbar selected={selectedLang} onSelect={setSelectedLang} />

      {/* Phrase cards */}
      {phrases.length > 0 && (
        <section className="px-8 pt-6 md:px-12">
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            {phrases.map((phrase, i) => {
              const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
              return (
                <button
                  key={phrase.native}
                  onClick={() => handleCardClick(phrase.native)}
                  className="flex flex-col gap-1.5 px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:brightness-125 active:scale-[0.97]"
                  style={{ background: color.bg, border: `1px solid ${color.border}` }}
                >
                  <span className="text-lg font-medium text-white/90 font-[family-name:var(--font-noto-sans-kr)]">
                    {phrase.korean}
                  </span>
                  <span className="text-xs text-white/45 font-[family-name:var(--font-dm-mono)]">
                    {phrase.native} · {phrase.pronunciation}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Input section */}
      {selectedLang && (
        <section className="px-8 md:px-12 mt-8 pb-10">
          <div className="max-w-2xl mx-auto">

            {/* Input box */}
            <div
              className={cn(
                'rounded-3xl border bg-[#1F2023] p-2 transition-all duration-300',
                'shadow-[0_8px_30px_rgba(0,0,0,0.24)]',
                loading ? 'border-white/20' : 'border-[#444444]',
              )}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="한국어로 입력하세요…"
                disabled={loading}
                rows={1}
                className="w-full bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none resize-none min-h-[44px] font-[family-name:var(--font-noto-sans-kr)] disabled:opacity-60"
                style={{ maxHeight: 200, overflowY: 'auto' }}
              />

              <div className="flex items-center justify-between px-2 pb-1 pt-1">
                <span className="text-xs text-[#6B7280] font-[family-name:var(--font-dm-mono)] select-none">
                  Enter로 번역 · Shift+Enter 줄바꿈
                </span>

                <button
                  onClick={handleTranslate}
                  disabled={!hasContent || loading}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
                    hasContent && !loading
                      ? 'bg-white text-[#1F2023] hover:bg-white/80'
                      : loading
                      ? 'bg-transparent text-[#9CA3AF]'
                      : 'bg-transparent text-[#9CA3AF] hover:bg-gray-600/30 disabled:opacity-40',
                  )}
                >
                  {loading ? (
                    <Square className="h-3.5 w-3.5 fill-current animate-pulse" />
                  ) : hasContent ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="mt-3 px-1 text-xs text-red-400/80 font-[family-name:var(--font-dm-mono)]"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Translation result */}
            <AnimatePresence>
              {translation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="mt-3 px-4 py-3.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/30 mb-1.5 font-[family-name:var(--font-dm-mono)]">
                        번역 결과
                      </p>
                      <p className="text-base text-white/85 font-[family-name:var(--font-dm-mono)]">
                        {translation}
                      </p>
                    </div>
                    <button
                      onClick={() => selectedLang && speak(translation, selectedLang.code)}
                      className="mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white/35 hover:text-white/80 hover:bg-white/10 transition-all duration-200"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>
      )}
    </main>
  );
}
