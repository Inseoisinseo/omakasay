'use client';

import { MinimalistHero } from '@/components/ui/minimalist-hero';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: ' FEATURES', href: '#' }
];

export default function Home() {
  const { user, loading } = useAuth();
  const getStartedHref = !loading && user ? '/workspace' : '/auth';

  return (
    <main>
      <MinimalistHero
        logoText="omakasay."
        navLinks={navLinks}
        mainText="When words fail on your journey, omakasay speaks for you. Travel freely without language barriers, anywhere in the world."
        getStartedHref={getStartedHref}
        imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
        imageAlt="Traveler speaking confidently with AI assistance."
        overlayText={{
          part1: 'omaka',
          part2: 'say',
        }}
      />
    </main>
  );
}
