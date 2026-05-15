export type { Phrase, Category } from './types';
import ja from './ja';
import en from './en';
import zh from './zh';
import type { Category } from './types';

export const PHRASES: Record<string, Category[]> = { ja, en, zh };

export const allPhrases = (langCode: string) =>
  (PHRASES[langCode] ?? []).flatMap((c) => c.phrases);
