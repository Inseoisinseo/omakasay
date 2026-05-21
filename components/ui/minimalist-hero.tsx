'use client';

import { motion } from 'framer-motion';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';

interface HeroProps {
  getStartedHref: string;
}

export const MinimalistHero = ({ getStartedHref }: HeroProps) => {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="z-30 flex w-full items-center justify-between px-8 pt-8 md:px-12">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold tracking-wider font-[family-name:var(--font-pacifico)] text-black"
        >
          omakasay
        </motion.span>
        <motion.a
          href={getStartedHref}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full border border-black text-black px-5 py-2 text-sm font-medium tracking-wide transition-colors hover:bg-[#FFEC47] hover:border-[#FFEC47] hover:text-black"
        >
          시작하기
        </motion.a>
      </header>

      {/* Main Text */}
      <div className="flex flex-1 flex-col justify-center px-8 md:px-12 lg:px-20">
        <div className="text-5xl font-bold leading-tight tracking-tight text-black sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.03}
            staggerFrom="first"
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.3 }}
            containerClassName="block"
          >
            {'말이 막혀도'}
          </VerticalCutReveal>
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.03}
            staggerFrom="first"
            reverse
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.8 }}
            containerClassName="block"
          >
            {'괜찮아요. ✈️'}
          </VerticalCutReveal>
          <VerticalCutReveal
            splitBy="characters"
            staggerDuration={0.025}
            staggerFrom="center"
            transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 1.4 }}
            containerClassName="block"
            elementLevelClassName="text-[#FFEC47]"
          >
            {'omakasay'}
          </VerticalCutReveal>
        </div>

        {/* Tagline + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.2 }}
          className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8"
        >
          <p className="max-w-sm text-sm leading-relaxed text-black/60 font-[family-name:var(--font-dm-mono)]">
            여행 중 말이 막힐 때, omakasay가 대신 말해드려요.
            <br />
            언어 장벽 없이 세계 어디서든 자유롭게.
          </p>
          <a
            href={getStartedHref}
            className="shrink-0 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[#FFEC47] hover:text-black"
          >
            무료로 시작하기 →
          </a>
        </motion.div>
      </div>
    </div>
  );
};
