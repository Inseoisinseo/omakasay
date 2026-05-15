'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceNavbar, type Language } from '@/components/workspace/navbar';
import { PHRASES } from '@/components/workspace/phrases';
import { ArrowUp, Square, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_SHORT: Record<string, string> = {
  greeting:      '인사',
  hotel:         '숙소',
  restaurant:    '식당',
  transport:     '교통',
  shopping:      '쇼핑',
  emergency:     '긴급',
  communication: '소통',
};

const BLOCK_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.10)',  border: 'rgba(99, 102, 241, 0.30)'  },
  { bg: 'rgba(168, 85, 247, 0.10)',  border: 'rgba(168, 85, 247, 0.30)'  },
  { bg: 'rgba(20, 184, 166, 0.10)',  border: 'rgba(20, 184, 166, 0.30)'  },
  { bg: 'rgba(239, 68, 68, 0.08)',   border: 'rgba(239, 68, 68, 0.28)'   },
  { bg: 'rgba(234, 179, 8, 0.10)',   border: 'rgba(234, 179, 8, 0.32)'   },
  { bg: 'rgba(59, 130, 246, 0.10)',  border: 'rgba(59, 130, 246, 0.30)'  },
  { bg: 'rgba(34, 197, 94, 0.08)',   border: 'rgba(34, 197, 94, 0.28)'   },
  { bg: 'rgba(249, 115, 22, 0.08)',  border: 'rgba(249, 115, 22, 0.28)'  },
];

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>();

async function fetchAudioUrl(text: string, langCode: string): Promise<string | null> {
  const key = `${langCode}:${text}`;
  if (audioCache.has(key)) return audioCache.get(key)!;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, langCode }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

async function speak(text: string, langCode: string) {
  currentAudio?.pause();
  currentAudio = null;

  const url = await fetchAudioUrl(text, langCode);
  if (!url) return;

  const audio = new Audio(url);
  currentAudio = audio;
  audio.play();
}

export default function WorkspacePage() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const allCategories = selectedLang ? (PHRASES[selectedLang.code] ?? []) : [];
  const categories = selectedCategory
    ? allCategories.filter((c) => c.id === selectedCategory)
    : allCategories;
  const hasContent = input.trim().length > 0;

  useEffect(() => {
    setSelectedCategory(null);
    if (!selectedLang) return;
    const phrases = (PHRASES[selectedLang.code] ?? []).flatMap((c) => c.phrases);
    for (const phrase of phrases) {
      fetchAudioUrl(phrase.native, selectedLang.code);
    }
  }, [selectedLang]);

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
    <main className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#fffcef' }}>
      <WorkspaceNavbar selected={selectedLang} onSelect={setSelectedLang} />

      {/* Category pills */}
      {allCategories.length > 0 && (
        <div className="px-8 pt-4 md:px-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'flex items-center justify-center rounded-full font-sans font-medium transition-all duration-150',
                  'text-[12px] h-8 px-2 gap-1 leading-tight text-center',
                  selectedCategory === null
                    ? 'bg-black/8 text-gray-900 border border-black/20'
                    : 'bg-transparent text-gray-400 border border-black/10 hover:text-gray-700 hover:border-black/20',
                )}
              >
                전체
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={cn(
                    'flex items-center justify-center rounded-full font-sans font-medium transition-all duration-150',
                    'text-[12px] h-8 px-2 gap-1 leading-tight text-center',
                    selectedCategory === cat.id
                      ? 'bg-black/8 text-gray-900 border border-black/20'
                      : 'bg-transparent text-gray-400 border border-black/10 hover:text-gray-700 hover:border-black/20',
                  )}
                >
                  {cat.emoji} {CATEGORY_SHORT[cat.id] ?? cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phrase cards */}
      {categories.length > 0 && (
        <section className="px-8 pt-6 md:px-12 space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="max-w-2xl mx-auto">
              <p className="text-xs text-gray-400 mb-2.5 font-[family-name:var(--font-dm-mono)]">
                {category.emoji} {category.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {category.phrases.map((phrase, i) => {
                  const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
                  const koreanSize =
                    phrase.korean.length <= 10 ? 'text-[15px]'
                    : phrase.korean.length <= 12 ? 'text-[13px]'
                    : 'text-[11px]';
                  return (
                    <button
                      key={phrase.id}
                      onClick={() => handleCardClick(phrase.native)}
                      className="flex flex-col gap-1 px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:brightness-95 active:scale-[0.97]"
                      style={{ background: color.bg, border: `1px solid ${color.border}` }}
                    >
                      <span className={`${koreanSize} font-medium text-gray-900 font-[family-name:var(--font-noto-sans-kr)] leading-snug whitespace-nowrap`}>
                        {phrase.korean}
                      </span>
                      <span className="text-[11px] text-gray-500 font-[family-name:var(--font-dm-mono)] leading-snug break-all">
                        {phrase.native}
                      </span>
                      <span className="text-[11px] text-gray-400 font-[family-name:var(--font-noto-sans-kr)] leading-snug">
                        {phrase.pronunciation}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Input section */}
      {selectedLang && (
        <section className="px-8 md:px-12 mt-8 pb-10">
          <div className="max-w-2xl mx-auto">

            {/* Input box */}
            <div
              className={cn(
                'rounded-3xl border bg-white p-2 transition-all duration-300',
                'shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
                loading ? 'border-black/10' : 'border-black/12',
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
                className="w-full bg-transparent px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus-visible:outline-none resize-none min-h-[44px] font-[family-name:var(--font-noto-sans-kr)] disabled:opacity-60"
                style={{ maxHeight: 200, overflowY: 'auto' }}
              />

              <div className="flex items-center justify-between px-2 pb-1 pt-1">
                <span className="text-xs text-gray-400 font-[family-name:var(--font-dm-mono)] select-none">
                  Enter로 번역 · Shift+Enter 줄바꿈
                </span>

                <button
                  onClick={handleTranslate}
                  disabled={!hasContent || loading}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
                    hasContent && !loading
                      ? 'bg-gray-900 text-white hover:bg-gray-700'
                      : loading
                      ? 'bg-transparent text-gray-400'
                      : 'bg-transparent text-gray-400 hover:bg-black/5 disabled:opacity-40',
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
                  className="mt-3 px-1 text-xs text-red-500/80 font-[family-name:var(--font-dm-mono)]"
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
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-1.5 font-[family-name:var(--font-dm-mono)]">
                        번역 결과
                      </p>
                      <p className="text-base text-gray-900 font-[family-name:var(--font-dm-mono)]">
                        {translation}
                      </p>
                    </div>
                    <button
                      onClick={() => selectedLang && speak(translation, selectedLang.code)}
                      className="mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-all duration-200"
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
