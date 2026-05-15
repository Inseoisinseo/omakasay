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
  background: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
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
    <nav className="flex items-center justify-between px-6 py-3 relative">
      {/* Logo */}
      <span className="text-xl font-bold tracking-wider text-white font-[family-name:var(--font-pacifico)] shrink-0 z-10">
        omakasay
      </span>

      {/* Search — centered absolutely */}
      <div className="absolute left-1/2 -translate-x-1/2 z-50" ref={ref}>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer"
          style={glassStyle}
          onClick={() => setOpen((v) => !v)}
        >
          <Search size={14} className="text-white/40 shrink-0" />
          <span className={`text-sm w-56 font-[family-name:var(--font-dm-mono)] select-none ${selected ? 'text-white/80' : 'text-white/30'}`}>
            {selected ? `${selected.native} · ${selected.label}` : 'Select language...'}
          </span>
        </div>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-64 rounded-2xl overflow-hidden py-1"
            style={{ ...glassStyle, background: 'rgba(30, 30, 30, 0.7)' }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/10"
              >
                <span className="text-sm text-white/80 font-[family-name:var(--font-dm-mono)]">{lang.label}</span>
                <span className="text-sm text-white/40 font-[family-name:var(--font-dm-mono)]">{lang.native}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
