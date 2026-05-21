'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { PassType } from '@/lib/passUtils';

const PLANS = [
  {
    type: '1day' as PassType,
    label: ' 1일 패스',
    price: '990',
    description: '당일치기 여행',
  },
  {
    type: '3day' as PassType,
    label: ' 3일 패스',
    price: '1,900',
    description: '2박 3일 여행',
    recommended: true,
  },
  {
    type: '7day' as PassType,
    label: ' 7일 패스',
    price: '2,900',
    description: '일주일 여행',
  },
];

const CARD_H = 88;
const CARD_GAP = 12;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({ open, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(1);
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    if (buying || !user) return;
    setBuying(true);
    try {
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passType: PLANS[selected].type }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `서버 오류 (${res.status})`);
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[PaymentModal]', msg);
      alert(`결제 오류: ${msg}`);
      setBuying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="border-2 rounded-[32px] p-3 shadow-md w-full max-w-sm flex flex-col items-center gap-3 bg-white pointer-events-auto">

              {/* Header */}
              <div className="w-full flex items-center justify-between px-2 pt-1">
                <p className="text-[17px] font-semibold text-gray-800 font-[family-name:var(--font-noto-sans-kr)] w-full text-center">
                  여행 패스 선택
                </p>
                <button
                  onClick={onClose}
                  disabled={buying}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/[0.06] hover:text-gray-700 transition-colors disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Plan cards */}
              <div className="w-full relative flex flex-col gap-3">
                {PLANS.map((plan, index) => (
                  <div
                    key={plan.type}
                    className="w-full flex items-center justify-between cursor-pointer border-2 border-gray-200 px-4 rounded-2xl"
                    style={{ height: `${CARD_H}px` }}
                    onClick={() => setSelected(index)}
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold text-[15px] text-gray-950 flex items-center gap-2 font-[family-name:var(--font-noto-sans-kr)]">
                        {plan.label}
                        {plan.recommended && (
                          <span className="py-0.5 px-2 rounded-lg bg-yellow-100 text-yellow-900 text-xs font-medium">
                            추천
                          </span>
                        )}
                      </p>
                      <p className="text-gray-400 text-[13px] mt-0.5 font-[family-name:var(--font-noto-sans-kr)]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-gray-800 font-semibold text-[13px] font-[family-name:var(--font-noto-sans-kr)]">
                        ₩{plan.price}
                      </span>
                      <div
                        className="border-2 size-6 rounded-full p-1 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: selected === index ? '#000' : '#94a3b8',
                          transition: 'border-color 0.3s',
                        }}
                      >
                        <div
                          className="size-3 bg-black rounded-full"
                          style={{
                            opacity: selected === index ? 1 : 0,
                            transition: 'opacity 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Moving highlight border */}
                <div
                  className="absolute top-0 left-0 w-full rounded-2xl border-[3px] border-black pointer-events-none"
                  style={{
                    height: `${CARD_H}px`,
                    transform: `translateY(${selected * (CARD_H + CARD_GAP)}px)`,
                    transition: 'transform 0.3s',
                  }}
                />
              </div>

              {/* CTA */}
              <button
                onClick={handleBuy}
                disabled={buying}
                className="rounded-full bg-black text-[15px] text-white w-full py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform duration-300 disabled:opacity-50 font-[family-name:var(--font-noto-sans-kr)]"
              >
                {buying && <Loader2 className="h-4 w-4 animate-spin" />}
                구매하기
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
