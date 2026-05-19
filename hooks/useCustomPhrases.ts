'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CustomPhrase {
  id: string;
  korean: string;
  native: string;
  language_code: string;
  created_at: string;
}

export function useCustomPhrases(languageCode: string | null) {
  const supabase = createClient();
  const { user } = useAuth();
  const [phrases, setPhrases] = useState<CustomPhrase[]>([]);

  const refetch = useCallback(async () => {
    if (!languageCode || !user) { setPhrases([]); return; }
    const { data } = await supabase
      .from('custom_phrases')
      .select('id, korean, native, language_code, created_at')
      .eq('user_id', user.id)
      .eq('language_code', languageCode)
      .order('created_at', { ascending: false });
    setPhrases(data ?? []);
  }, [languageCode, user?.id]);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (korean: string, native: string) => {
    if (!languageCode || !user) return null;
    const { data, error } = await supabase
      .from('custom_phrases')
      .insert({ user_id: user.id, korean, native, language_code: languageCode })
      .select('id, korean, native, language_code, created_at')
      .single();
    if (error || !data) {
      console.error('[useCustomPhrases] save error', error);
      return null;
    }
    setPhrases((prev) => [data as CustomPhrase, ...prev]);
    return data as CustomPhrase;
  }, [languageCode, user?.id]);

  const remove = useCallback(async (id: string) => {
    await supabase.from('custom_phrases').delete().eq('id', id);
    setPhrases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { phrases, save, remove, refetch };
}
