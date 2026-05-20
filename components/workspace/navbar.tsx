'use client';

import { Search, UserCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Pass } from '@/hooks/usePass';
import { PASS_NAMES } from '@/lib/paymentUtils';
import { Badge } from '@/components/ui/badge-1';

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

function formatPassRemaining(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return '';
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (totalHours < 1) return `${Math.floor(diffMs / 60000)}분 남음`;
  if (totalHours < 24) return `${totalHours}시간 남음`;
  return `D-${Math.floor(totalHours / 24)} 남음`;
}

interface WorkspaceNavbarProps {
  selected: Language | null;
  onSelect: (lang: Language) => void;
  hasActivePass?: boolean;
  activePass?: Pass | null;
}

export function WorkspaceNavbar({ selected, onSelect, hasActivePass, activePass }: WorkspaceNavbarProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, signOut } = useAuth();

  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const nickname: string | undefined = user?.user_metadata?.full_name;
  const email: string = user?.email ?? '';
  const displayName: string = nickname ?? email;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (lang: Language) => {
    onSelect(lang);
    setOpen(false);
  };

  const passRemaining = activePass ? formatPassRemaining(activePass.expires_at) : null;

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-3 relative">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-wider text-gray-900 font-[family-name:var(--font-pacifico)] shrink-0 z-10">
          omakasay
        </Link>

        {/* 로그아웃 상태 */}
        {!user && (
          <Link
            href="/auth"
            className="shrink-0 z-10 text-[14px] text-gray-400 hover:text-gray-700 transition-colors"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            sign in
          </Link>
        )}

        {/* User popover */}
        {user && (
          <div
            ref={profileRef}
            className="relative shrink-0 z-10"
            onMouseEnter={() => {
              if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current)
              setProfileOpen(true)
            }}
            onMouseLeave={() => {
              profileCloseTimer.current = setTimeout(() => setProfileOpen(false), 150)
            }}
          >
            {/* Trigger */}
            <div className="flex items-center gap-2 cursor-pointer">
              {hasActivePass && (
                <Badge variant="turbo" size="sm" capitalize={false}>PRO</Badge>
              )}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <UserCircle2 size={28} className="text-gray-400" />
              )}
              <span
                className="hidden md:block text-[13px] text-gray-600 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-noto-sans-kr)' }}
              >
                {displayName}
              </span>
            </div>

            {/* Popover */}
            {profileOpen && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-2xl py-3 px-1"
                style={{ ...glassStyle, background: 'rgba(255,255,255,0.95)' }}
              >
                {/* 유저 정보 */}
                <div className="flex items-center gap-3 px-3 pb-2.5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <UserCircle2 size={36} className="text-gray-300 shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    {nickname && (
                      <span
                        className="text-[13px] font-medium text-gray-800 truncate"
                        style={{ fontFamily: 'var(--font-noto-sans-kr)' }}
                      >
                        {nickname}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 truncate font-[family-name:var(--font-dm-mono)]">
                      {email}
                    </span>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="mx-3 mb-2 h-px bg-black/5" />

                {/* 패스권 정보 */}
                {hasActivePass && activePass && passRemaining && (
                  <>
                    <div className="px-2 mb-2">
                      <div
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{
                          background: 'rgba(234,179,8,0.09)',
                          border: '1px solid rgba(234,179,8,0.22)',
                        }}
                      >
                        <div>
                          <p className="text-[11px] font-semibold text-amber-700 font-[family-name:var(--font-dm-mono)]">
                            🎫 {PASS_NAMES[activePass.pass_type]}
                          </p>
                          <p className="text-[11px] text-amber-500 mt-0.5 font-[family-name:var(--font-dm-mono)]">
                            {passRemaining}
                          </p>
                        </div>
                        <Badge variant="turbo" size="sm" capitalize={false}>PRO</Badge>
                      </div>
                    </div>
                    <div className="mx-3 mb-1.5 h-px bg-black/5" />
                  </>
                )}

                {/* Sign Out */}
                <button
                  onClick={signOut}
                  className="w-full text-left px-3 py-2 text-[13px] text-red-400 rounded-xl transition-colors hover:bg-red-50"
                  style={{ fontFamily: 'var(--font-noto-sans-kr)' }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}

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
