'use client';

import { MinimalistHero } from '@/components/ui/minimalist-hero';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const getStartedHref = !loading && user ? '/workspace' : '/auth';

  return (
    <main>
      <MinimalistHero getStartedHref={getStartedHref} />
    </main>
  );
}
