'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { PassType } from '@/lib/passUtils';
import { PASS_NAMES } from '@/lib/paymentUtils';

interface Plan {
  type: PassType;
  price: string;
  description: string;
  recommended?: boolean;
  bg: string;
  border: string;
}

const PLANS: Plan[] = [
  {
    type: '1day',
    price: '990원',
    description: '당일치기 여행',
    bg: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.22)',
  },
  {
    type: '3day',
    price: '1,900원',
    description: '2박 3일 여행',
    recommended: true,
    bg: 'rgba(234,179,8,0.10)',
    border: 'rgba(234,179,8,0.38)',
  },
  {
    type: '7day',
    price: '2,900원',
    description: '일주일 여행',
    bg: 'rgba(20,184,166,0.07)',
    border: 'rgba(20,184,166,0.22)',
  },
];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [buying, setBuying] = useState<PassType | null>(null);

  const handleBuy = async (passType: PassType) => {
    if (buying || !user) return;
    setBuying(passType);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passType }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? '결제 세션 생성 실패');
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[PaymentModal] 결제 오류:', err);
      alert('결제를 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      setBuying(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 z-50 w-[calc(100%-2rem)] max-w-md rounded-3xl p-6 overflow-hidden"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fffcef',
              boxShadow: '0 12px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* Soft yellow glow */}
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 60%, #FFF991 0%, transparent 68%)',
                opacity: 0.55,
                mixBlendMode: 'multiply',
              }}
            />
            {/* Header */}
            <div className="relative z-10 flex items-start justify-between mb-5">
              <h2 className="text-[15px] font-semibold text-gray-900 leading-snug pr-4 font-[family-name:var(--font-noto-sans-kr)]">
                🎌 AI 번역을 사용하려면
                <br />
                여행 패스가 필요해요
              </h2>
              <button
                onClick={onClose}
                disabled={!!buying}
                className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/8 hover:text-gray-700 transition-all duration-150 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Plan cards */}
            <div className="relative z-10 flex flex-col gap-2.5 mb-5">
              {PLANS.map((plan) => {
                const isBuying = buying === plan.type;
                return (
                  <div
                    key={plan.type}
                    className="relative flex items-center justify-between rounded-2xl px-4 py-3.5"
                    style={{ background: plan.bg, border: `1px solid ${plan.border}` }}
                  >
                    {plan.recommended && (
                      <span
                        className="absolute -top-2.5 left-4 text-[10px] font-semibold rounded-full px-2 py-0.5 font-[family-name:var(--font-dm-mono)]"
                        style={{ background: 'rgba(234,179,8,0.9)', color: '#713f12' }}
                      >
                        추천
                      </span>
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900 font-[family-name:var(--font-noto-sans-kr)]">
                        {PASS_NAMES[plan.type]}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-[family-name:var(--font-dm-mono)]">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-bold text-gray-800 font-[family-name:var(--font-dm-mono)]">
                        {plan.price}
                      </span>
                      <button
                        onClick={() => handleBuy(plan.type)}
                        disabled={!!buying}
                        className="h-8 px-3.5 rounded-full text-[12px] font-medium text-white transition-all duration-150 hover:opacity-85 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 font-[family-name:var(--font-dm-mono)]"
                        style={{ backgroundColor: '#1a1a1a' }}
                      >
                        {isBuying && <Loader2 className="h-3 w-3 animate-spin" />}
                        구매하기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <p className="relative z-10 text-center text-[11px] text-gray-400 font-[family-name:var(--font-dm-mono)]">
              패스권 구매 시 자연스러운 목소리로 업그레이드!
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
