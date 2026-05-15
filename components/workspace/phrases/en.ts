import type { Category } from './types';

const en: Category[] = [
  {
    id: 'basic',
    name: '기본 표현',
    emoji: '💬',
    phrases: [
      { id: 'e1', korean: '안녕하세요',            native: 'Hello',                  pronunciation: '헬로우',                   category: 'basic' },
      { id: 'e2', korean: '감사합니다',             native: 'Thank you',              pronunciation: '땡큐',                     category: 'basic' },
      { id: 'e3', korean: '실례합니다',             native: 'Excuse me',              pronunciation: '익스큐즈 미',               category: 'basic' },
      { id: 'e4', korean: '어디에 있나요?',         native: 'Where is it?',           pronunciation: '웨어 이즈 잇',             category: 'basic' },
      { id: 'e5', korean: '얼마예요?',              native: 'How much?',              pronunciation: '하우 머치',                 category: 'basic' },
      { id: 'e6', korean: '도와주세요',             native: 'Please help me',         pronunciation: '플리즈 헬프 미',           category: 'basic' },
      { id: 'e7', korean: '화장실이 어디예요?',     native: 'Where is the restroom?', pronunciation: '웨어 이즈 더 레스트룸',   category: 'basic' },
      { id: 'e8', korean: '모르겠어요',             native: "I don't understand",     pronunciation: '아이 돈트 언더스탠드',     category: 'basic' },
    ],
  },
];

export default en;
