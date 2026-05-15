'use client';

import { useState } from 'react';
import { WorkspaceNavbar, type Language } from '@/components/workspace/navbar';
import { PHRASES } from '@/components/workspace/phrases';

const BLOCK_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.12)',  border: 'rgba(99, 102, 241, 0.28)'  },  // indigo
  { bg: 'rgba(168, 85, 247, 0.12)',  border: 'rgba(168, 85, 247, 0.28)'  },  // purple
  { bg: 'rgba(20, 184, 166, 0.12)',  border: 'rgba(20, 184, 166, 0.28)'  },  // teal
  { bg: 'rgba(239, 68, 68, 0.10)',   border: 'rgba(239, 68, 68, 0.26)'   },  // rose
  { bg: 'rgba(234, 179, 8, 0.10)',   border: 'rgba(234, 179, 8, 0.26)'   },  // amber
  { bg: 'rgba(59, 130, 246, 0.12)',  border: 'rgba(59, 130, 246, 0.28)'  },  // blue
  { bg: 'rgba(34, 197, 94, 0.10)',   border: 'rgba(34, 197, 94, 0.26)'   },  // green
  { bg: 'rgba(249, 115, 22, 0.10)',  border: 'rgba(249, 115, 22, 0.26)'  },  // orange
];

export default function WorkspacePage() {
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  const phrases = selectedLang ? PHRASES[selectedLang.code] : [];

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: '#171717' }}>
      <WorkspaceNavbar selected={selectedLang} onSelect={setSelectedLang} />

      {phrases.length > 0 && (
        <section className="px-8 pt-6 md:px-12">
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            {phrases.map((phrase, i) => {
              const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
              return (
                <button
                  key={phrase.native}
                  className="flex flex-col gap-1.5 px-4 py-3.5 rounded-xl text-left transition-colors cursor-pointer"
                  style={{
                    background: color.bg,
                    border: `1px solid ${color.border}`,
                  }}
                >
                  <span className="text-sm font-medium text-white/90 font-[family-name:var(--font-noto-sans-kr)]">
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
    </main>
  );
}
