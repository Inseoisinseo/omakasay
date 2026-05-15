export interface Phrase {
  id: string;
  korean: string;
  native: string;
  pronunciation: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  phrases: Phrase[];
}
