'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { PassType } from '@/lib/passUtils';

export interface Pass {
  id: string;
  user_id: string;
  pass_type: PassType;
  purchased_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface UsePassResult {
  hasActivePass: boolean;
  activePass: Pass | null;
  loading: boolean;
  refetch: () => void;
}

export function usePass(): UsePassResult {
  const { user } = useAuth();
  const [hasActivePass, setHasActivePass] = useState(false);
  const [activePass, setActivePass] = useState<Pass | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) {
      setHasActivePass(false);
      setActivePass(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    supabase
      .from('passes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHasActivePass(true);
          setActivePass(data as Pass);
        } else {
          setHasActivePass(false);
          setActivePass(null);
        }
        setLoading(false);
      });
  }, [user, tick]);

  return {
    hasActivePass,
    activePass,
    loading,
    refetch: () => setTick((n) => n + 1),
  };
}
