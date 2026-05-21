'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkspaceNavbar, type Language } from '@/components/workspace/navbar';
import { PHRASES } from '@/components/workspace/phrases';
import { ArrowUp, Loader2, Mic, Volume2, Bookmark, BookmarkCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { usePass } from '@/hooks/usePass';
import { useCustomPhrases } from '@/hooks/useCustomPhrases';
import { PaymentModal } from '@/components/PaymentModal';
import { Badge } from '@/components/ui/badge-1';
import { PASS_NAMES } from '@/lib/paymentUtils';
import type { PassType } from '@/lib/passUtils';

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
const utteranceCache = new Map<string, SpeechSynthesisUtterance>();
const SPEECH_LANG: Record<string, string> = { ja: 'ja-JP', en: 'en-US', zh: 'zh-CN' };

async function fetchAudioUrl(
  text: string,
  langCode: string,
): Promise<{ url: string | null; status: number }> {
  const key = `${langCode}:${text}`;
  if (audioCache.has(key)) return { url: audioCache.get(key)!, status: 200 };

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, langCode }),
    });
    if (!res.ok) return { url: null, status: res.status };
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioCache.set(key, url);
    return { url, status: 200 };
  } catch {
    return { url: null, status: 0 }; // 0 = 네트워크 에러
  }
}


export default function WorkspacePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { hasActivePass, activePass, loading: passLoading, refetch: refetchPass } = usePass();

  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successPassType, setSuccessPassType] = useState<PassType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [savedThisSession, setSavedThisSession] = useState(false);
  const [showCustomPhrasePaymentPrompt, setShowCustomPhrasePaymentPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { phrases: customPhrases, save: savePhrase, remove: removePhrase } = useCustomPhrases(selectedLang?.code ?? null);

  // Web Speech API 폴백
  const fallbackWebSpeech = (text: string, langCode: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_LANG[langCode] ?? langCode;
    window.speechSynthesis.speak(u);
  };

  const logTranslation = async (params: {
    sourceType: 'block' | 'direct';
    originalText: string;
    translatedText: string;
    languageCode: string;
    phraseCategory?: string | null;
  }) => {
    if (!user) return;
    await supabase.from('translation_logs').insert({
      user_id: user.id,
      source_type: params.sourceType,
      original_text: params.originalText,
      translated_text: params.translatedText,
      language_code: params.languageCode,
      phrase_category: params.phraseCategory ?? null,
    });
  };

  const speak = async (text: string, langCode: string) => {
    currentAudio?.pause();
    currentAudio = null;

    if (!hasActivePass) {
      // 무료 유저: Web Speech API
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const key = `${langCode}:${text}`;
        const u = utteranceCache.get(key) ?? (() => {
          const nu = new SpeechSynthesisUtterance(text);
          nu.lang = SPEECH_LANG[langCode] ?? langCode;
          return nu;
        })();
        u.onend = () => setActiveBlockId(null);
        u.onerror = () => setActiveBlockId(null);
        window.speechSynthesis.speak(u);
      }
      return;
    }

    // 패스 유저: OpenAI TTS
    setTtsLoading(true);
    const { url, status } = await fetchAudioUrl(text, langCode);

    if (!url) {
      setTtsLoading(false);
      setActiveBlockId(null);

      if (status === 403) {
        setToast('패스권이 만료되었어요 😢');
        refetchPass();
        setShowPaymentModal(true);
      }
      fallbackWebSpeech(text, langCode);
      return;
    }

    const audio = new Audio(url);
    currentAudio = audio;
    audio.addEventListener('play', () => setTtsLoading(false));
    audio.addEventListener('ended', () => setActiveBlockId(null));
    audio.addEventListener('error', () => {
      setTtsLoading(false);
      setActiveBlockId(null);
      fallbackWebSpeech(text, langCode);
    });
    audio.play().catch(() => { setTtsLoading(false); setActiveBlockId(null); });
  };

  const allCategories = selectedLang ? (PHRASES[selectedLang.code] ?? []) : [];
  const categories = selectedCategory
    ? allCategories.filter((c) => c.id === selectedCategory)
    : allCategories;
  const hasContent = input.trim().length > 0;

  // 번역 바뀌면 저장 버튼 초기화
  useEffect(() => { setSavedThisSession(false); }, [translation]);

  // 토스트 자동 해제
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // 앱 마운트: Web Speech API 워밍업 + 서버 콜드스타트 방지 + 결제 성공 감지
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const warmup = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(warmup);
      window.speechSynthesis.cancel();
    }
    fetch('/api/warmup').catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const type = params.get('type') as PassType | null;
      setSuccessPassType(type);
      setShowSuccessOverlay(true);
      refetchPass();
      window.history.replaceState({}, '', '/workspace');
    }
  }, []);

  // 언어 변경 시 utterance 미리 생성 (무료 유저 워밍업)
  useEffect(() => {
    setSelectedCategory(null);
    if (!selectedLang) return;
    const phrases = (PHRASES[selectedLang.code] ?? []).flatMap((c) => c.phrases);

    if ('speechSynthesis' in window) {
      const bcp47 = SPEECH_LANG[selectedLang.code] ?? selectedLang.code;
      phrases.slice(0, 10).forEach((phrase) => {
        const key = `${selectedLang.code}:${phrase.native}`;
        if (!utteranceCache.has(key)) {
          const u = new SpeechSynthesisUtterance(phrase.native);
          u.lang = bcp47;
          utteranceCache.set(key, u);
        }
      });
    }
  }, [selectedLang]);

  // 패스 유저: 언어 선택 or 패스 활성화 시 OpenAI TTS 프리페치
  useEffect(() => {
    if (!selectedLang || !hasActivePass) return;
    const phrases = (PHRASES[selectedLang.code] ?? []).flatMap((c) => c.phrases);
    for (const phrase of phrases) {
      fetchAudioUrl(phrase.native, selectedLang.code);
    }
  }, [selectedLang, hasActivePass]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const handleCardClick = (native: string, korean: string, categoryId: string, phraseId: string) => {
    if (!selectedLang) return;
    setActiveBlockId(phraseId);
    speak(native, selectedLang.code);
    logTranslation({
      sourceType: 'block',
      originalText: korean,
      translatedText: native,
      languageCode: selectedLang.code,
      phraseCategory: categoryId,
    });
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
        logTranslation({
          sourceType: 'direct',
          originalText: input.trim(),
          translatedText: data.translated,
          languageCode: selectedLang.code,
        });
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
      <WorkspaceNavbar
        selected={selectedLang}
        onSelect={setSelectedLang}
        hasActivePass={hasActivePass}
        activePass={activePass}
      />

      {/* Category pills */}
      {allCategories.length > 0 && (
        <div className="px-4 pt-4 md:px-12">
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
        <section className="px-4 pt-6 md:px-12 space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="max-w-2xl mx-auto">
              <p className="text-xs text-gray-400 mb-2.5 font-[family-name:var(--font-dm-mono)]">
                {category.emoji} {category.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {category.phrases.map((phrase, i) => {
                  const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
                  const isActive = activeBlockId === phrase.id;
                  const koreanSize =
                    phrase.korean.length <= 10 ? 'text-[15px]'
                    : phrase.korean.length <= 12 ? 'text-[13px]'
                    : 'text-[11px]';
                  return (
                    <button
                      key={phrase.id}
                      onClick={() => handleCardClick(phrase.native, phrase.korean, category.id, phrase.id)}
                      className="flex flex-col gap-1 px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer hover:brightness-95 active:scale-[0.97]"
                      style={{ background: color.bg, border: `1px solid ${color.border}` }}
                    >
                      <span className={`${koreanSize} font-medium text-gray-900 font-[family-name:var(--font-noto-sans-kr)] leading-snug whitespace-nowrap`}>
                        {phrase.korean}
                      </span>
                      <span className="text-[11px] text-gray-500 font-[family-name:var(--font-dm-mono)] leading-snug break-all">
                        {phrase.native}
                      </span>
                      {/* 파형 애니메이션 or 발음 표기 */}
                      {isActive ? (
                        <span className="flex items-end gap-[3px] h-[14px] mt-0.5">
                          {[0, 1, 2, 3].map((j) => (
                            <motion.span
                              key={j}
                              className="w-[3px] rounded-full bg-gray-500"
                              animate={{ height: ['3px', '11px', '3px'] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.12, ease: 'easeInOut' }}
                              style={{ height: '3px', display: 'block' }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 font-[family-name:var(--font-noto-sans-kr)] leading-snug">
                          {phrase.pronunciation}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 나만의 표현 블럭 */}
      {selectedLang && customPhrases.length > 0 && (
        <section className="px-4 md:px-12 pt-6">
          <div className="max-w-2xl mx-auto">
            <p className={cn(
              "text-xs mb-2.5 font-[family-name:var(--font-dm-mono)]",
              hasActivePass ? "text-gray-400" : "text-gray-300"
            )}>
              📌 나만의 표현
            </p>
            <div className="grid grid-cols-2 gap-3">
              {customPhrases.map((phrase, i) => {
                const isLocked = !passLoading && !hasActivePass;
                const color = isLocked
                  ? { bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)' }
                  : BLOCK_COLORS[i % BLOCK_COLORS.length];
                const isActive = activeBlockId === phrase.id;
                const koreanSize =
                  phrase.korean.length <= 10 ? 'text-[15px]'
                  : phrase.korean.length <= 12 ? 'text-[13px]'
                  : 'text-[11px]';

                if (isLocked) {
                  return (
                    <button
                      key={phrase.id}
                      onClick={() => setShowCustomPhrasePaymentPrompt(true)}
                      className="flex flex-col gap-1 px-4 py-3.5 rounded-xl text-left cursor-pointer"
                      style={{ background: color.bg, border: `1px solid ${color.border}` }}
                    >
                      <span className={`${koreanSize} font-medium text-gray-300 font-[family-name:var(--font-noto-sans-kr)] leading-snug`}>
                        {phrase.korean}
                      </span>
                      <span className="text-[11px] text-gray-300 font-[family-name:var(--font-dm-mono)] leading-snug break-all">
                        {phrase.native}
                      </span>
                      <span className="h-[14px] mt-0.5" />
                    </button>
                  );
                }

                return (
                  <div
                    key={phrase.id}
                    className="relative flex flex-col gap-1 px-4 py-3.5 rounded-xl"
                    style={{ background: color.bg, border: `1px solid ${color.border}` }}
                  >
                    <button
                      onClick={() => {
                        setActiveBlockId(phrase.id);
                        speak(phrase.native, selectedLang.code);
                      }}
                      className="flex flex-col gap-1 text-left w-full"
                    >
                      <span className={`${koreanSize} font-medium text-gray-900 font-[family-name:var(--font-noto-sans-kr)] leading-snug`}>
                        {phrase.korean}
                      </span>
                      <span className="text-[11px] text-gray-500 font-[family-name:var(--font-dm-mono)] leading-snug break-all">
                        {phrase.native}
                      </span>
                      {isActive ? (
                        <span className="flex items-end gap-[3px] h-[14px] mt-0.5">
                          {[0, 1, 2, 3].map((j) => (
                            <motion.span
                              key={j}
                              className="w-[3px] rounded-full bg-gray-500"
                              animate={{ height: ['3px', '11px', '3px'] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: j * 0.12, ease: 'easeInOut' }}
                              style={{ height: '3px', display: 'block' }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="h-[14px] mt-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => removePhrase(phrase.id)}
                      className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-black/8 transition-all duration-150"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Input section */}
      {selectedLang && (
        <section className="px-4 md:px-12 mt-8 pb-10">
          <div className="max-w-2xl mx-auto">

            {/* Input box */}
            <div
              className={cn(
                'rounded-3xl border bg-white p-2 transition-all duration-300',
                'shadow-[0_4px_20px_rgba(0,0,0,0.08)]',
                loading ? 'border-indigo-200/70' : 'border-black/12',
              )}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={(e) => {
                  if (!passLoading && !hasActivePass) {
                    e.preventDefault();
                    textareaRef.current?.blur();
                    setShowPaymentModal(true);
                  }
                }}
                placeholder="한국어로 입력하세요…"
                disabled={loading}
                rows={1}
                className="w-full bg-transparent px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus-visible:outline-none resize-none min-h-[44px] font-[family-name:var(--font-noto-sans-kr)] disabled:opacity-60"
                style={{ maxHeight: 200, overflowY: 'auto' }}
              />

              <div className="flex items-center justify-between px-2 pb-1 pt-1">
                <span className="text-xs text-gray-400 font-[family-name:var(--font-dm-mono)] select-none transition-all">
                  {loading ? '번역 중…' : 'Enter로 번역 · Shift+Enter 줄바꿈'}
                </span>

                <button
                  onClick={handleTranslate}
                  disabled={!hasContent || loading}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0',
                    hasContent && !loading
                      ? 'bg-gray-900 text-white hover:bg-gray-700'
                      : loading
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-transparent text-gray-400 hover:bg-black/5 disabled:opacity-40',
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                    <div className="flex gap-1 mt-0.5 shrink-0">
                      <button
                        onClick={() => selectedLang && speak(translation, selectedLang.code)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-all duration-200"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      {user && (
                        <button
                          onClick={async () => {
                            if (savedThisSession) return;
                            await savePhrase(input.trim(), translation);
                            setSavedThisSession(true);
                          }}
                          className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/5"
                          style={{ color: savedThisSession ? '#f59e0b' : 'rgba(0,0,0,0.3)' }}
                          title={savedThisSession ? '저장됨' : '블럭으로 저장'}
                        >
                          {savedThisSession
                            ? <BookmarkCheck className="h-4 w-4" />
                            : <Bookmark className="h-4 w-4" />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>
      )}

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* TTS 로딩 (화면 중앙) */}
      <AnimatePresence>
        {ttsLoading && (
          <motion.div
            key="tts-loading"
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[13px] font-medium text-white font-[family-name:var(--font-dm-mono)]"
              style={{ backgroundColor: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(14px)' }}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              음성 준비 중
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-[13px] font-medium text-white shadow-lg font-[family-name:var(--font-noto-sans-kr)] whitespace-nowrap"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 나만의 표현 잠금 확인 팝업 */}
      <AnimatePresence>
        {showCustomPhrasePaymentPrompt && (
          <motion.div
            key="custom-phrase-payment-prompt"
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowCustomPhrasePaymentPrompt(false)}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              className="relative w-[calc(100%-3rem)] max-w-xs rounded-3xl p-7 text-center"
              style={{
                backgroundColor: '#fffcef',
                boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
              }}
              initial={{ scale: 0.88, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[15px] font-medium text-gray-900 mb-6 font-[family-name:var(--font-noto-sans-kr)] leading-snug">
                패스권 결제시 이용가능합니다.<br />결제 하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCustomPhrasePaymentPrompt(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 h-11 rounded-full text-[13px] font-medium text-white transition-all hover:opacity-85 active:scale-95 font-[family-name:var(--font-dm-mono)]"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  네
                </button>
                <button
                  onClick={() => setShowCustomPhrasePaymentPrompt(false)}
                  className="flex-1 h-11 rounded-full text-[13px] font-medium text-gray-600 border border-black/10 transition-all hover:bg-black/5 active:scale-95 font-[family-name:var(--font-dm-mono)]"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결제 성공 오버레이 */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div
            key="success-overlay"
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowSuccessOverlay(false)}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(4px)' }}
            />

            <motion.div
              className="relative w-[calc(100%-3rem)] max-w-xs rounded-3xl p-8 text-center overflow-hidden"
              style={{
                backgroundColor: '#fffcef',
                boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
              }}
              initial={{ scale: 0.82, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: -8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 40%, #FFF991 0%, transparent 65%)',
                  opacity: 0.7,
                  mixBlendMode: 'multiply',
                }}
              />

              <div className="relative z-10">
                <h2 className="text-[20px] font-bold text-gray-900 mb-1.5 font-[family-name:var(--font-noto-sans-kr)]">
                  패스권 활성화!
                </h2>
                <p className="text-[12px] text-gray-500 mb-5 font-[family-name:var(--font-dm-mono)]">
                  {successPassType ? PASS_NAMES[successPassType] : '여행 패스'} · AI 음성으로 업그레이드됐어요
                </p>

                <div className="flex justify-center mb-5">
                  <Badge variant="turbo" size="sm" capitalize={false}>PREMIUM UNLOCKED</Badge>
                </div>

                <button
                  onClick={() => setShowSuccessOverlay(false)}
                  className="h-11 px-8 rounded-full text-[13px] font-medium text-white transition-all hover:opacity-85 active:scale-95 font-[family-name:var(--font-dm-mono)]"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  여행 시작하기 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
