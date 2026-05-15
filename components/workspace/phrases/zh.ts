import type { Category } from './types';

const zh: Category[] = [
  {
    id: 'basic',
    name: '기본 표현',
    emoji: '💬',
    phrases: [
      { id: 'z1', korean: '안녕하세요',            native: '你好',         pronunciation: '니하오',            category: 'basic' },
      { id: 'z2', korean: '감사합니다',             native: '谢谢',         pronunciation: '씨에씨에',          category: 'basic' },
      { id: 'z3', korean: '실례합니다',             native: '对不起',       pronunciation: '뚜이부치',          category: 'basic' },
      { id: 'z4', korean: '어디에 있나요?',         native: '在哪里？',     pronunciation: '짜이 나리',         category: 'basic' },
      { id: 'z5', korean: '얼마예요?',              native: '多少钱？',     pronunciation: '뚜어샤오 치엔',     category: 'basic' },
      { id: 'z6', korean: '도와주세요',             native: '请帮帮我',     pronunciation: '칭 방방 워',        category: 'basic' },
      { id: 'z7', korean: '화장실이 어디예요?',     native: '厕所在哪里？', pronunciation: '츠쑤어 짜이 나리',  category: 'basic' },
      { id: 'z8', korean: '모르겠어요',             native: '我不明白',     pronunciation: '워 뿌 밍바이',      category: 'basic' },
    ],
  },
];

export default zh;
