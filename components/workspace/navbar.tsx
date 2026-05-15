'use client';

import { Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'ja', label: 'Japanese', native: '일본어' },
  { code: 'en', label: 'English',  native: '영어'   },
  { code: 'zh', label: 'Chinese',  native: '중국어' },
];

export type Language = typeof LANGUAGES[0];

const glassStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(0, 0, 0, 0.10)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
};

interface WorkspaceNavbarProps {
  selected: Language | null;
  onSelect: (lang: Language) => void;
}

export function WorkspaceNavbar({ selected, onSelect }: WorkspaceNavbarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (lang: Language) => {
    onSelect(lang);
    setOpen(false);
  };

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-3 relative">
        {/* Logo */}
        <span className="text-xl font-bold tracking-wider text-gray-900 font-[family-name:var(--font-pacifico)] shrink-0 z-10">
          omakasay
        </span>

        {/* Desktop: search dropdown (md 이상에서만 표시) */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 z-50" ref={ref}>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer"
            style={glassStyle}
            onClick={() => setOpen((v) => !v)}
          >
            <Search size={14} className="text-gray-400 shrink-0" />
            <span className={`text-sm w-56 font-[family-name:var(--font-dm-mono)] select-none ${selected ? 'text-gray-800' : 'text-gray-400'}`}>
              {selected ? `${selected.native} · ${selected.label}` : 'Select language...'}
            </span>
          </div>

          {open && (
            <div
              className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-64 rounded-2xl overflow-hidden py-1"
              style={{ ...glassStyle, background: 'rgba(255, 255, 255, 0.95)' }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-black/5"
                >
                  <span className="text-sm text-gray-800 font-[family-name:var(--font-dm-mono)]">{lang.label}</span>
                  <span className="text-sm text-gray-400 font-[family-name:var(--font-dm-mono)]">{lang.native}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile: 언어 버튼 펼침 (md 미만에서만 표시) */}
      <div className="md:hidden px-6 pb-2">
        <p className="text-[11px] text-gray-400 mb-2.5 font-[family-name:var(--font-dm-mono)]">
          언어 선택
        </p>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = selected?.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelect(lang)}
                className="flex-1 flex flex-col items-center gap-0.5 py-3 rounded-2xl transition-all duration-150 font-sans"
                style={
                  isSelected
                    ? { ...glassStyle, background: 'rgba(0,0,0,0.07)' }
                    : { background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }
                }
              >
                <span className={`text-sm font-medium font-[family-name:var(--font-dm-mono)] ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                  {lang.label}
                </span>
                <span className={`text-xs font-[family-name:var(--font-noto-sans-kr)] ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                  {lang.native}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
