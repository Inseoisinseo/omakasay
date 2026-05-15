export interface Phrase {
  korean: string;
  native: string;
  pronunciation: string;
}

export const PHRASES: Record<string, Phrase[]> = {
  ja: [
    { korean: '안녕하세요',         native: 'こんにちは',           pronunciation: '고니치와'           },
    { korean: '감사합니다',         native: 'ありがとうございます', pronunciation: '아리가토 고자이마스' },
    { korean: '실례합니다',         native: 'すみません',           pronunciation: '스미마셍'            },
    { korean: '어디에 있나요?',     native: 'どこですか？',          pronunciation: '도코 데스카'         },
    { korean: '얼마예요?',          native: 'いくらですか？',        pronunciation: '이쿠라 데스카'       },
    { korean: '도와주세요',         native: '助けてください',        pronunciation: '타스케테 쿠다사이'   },
    { korean: '화장실이 어디예요?', native: 'トイレはどこですか？',  pronunciation: '토이레와 도코 데스카'},
    { korean: '모르겠어요',         native: 'わかりません',          pronunciation: '와카리마셍'          },
  ],
  en: [
    { korean: '안녕하세요',          native: 'Hello',                  pronunciation: '헬로우'          },
    { korean: '감사합니다',          native: 'Thank you',              pronunciation: '땡큐'            },
    { korean: '실례합니다',          native: 'Excuse me',              pronunciation: '익스큐즈 미'     },
    { korean: '어디에 있나요?',      native: 'Where is it?',           pronunciation: '웨어 이즈 잇'    },
    { korean: '얼마예요?',           native: 'How much?',              pronunciation: '하우 머치'       },
    { korean: '도와주세요',          native: 'Please help me',         pronunciation: '플리즈 헬프 미'  },
    { korean: '화장실이 어디예요?',  native: 'Where is the restroom?', pronunciation: '웨어 이즈 더 레스트룸' },
    { korean: '모르겠어요',          native: "I don't understand",     pronunciation: '아이 돈트 언더스탠드'  },
  ],
  zh: [
    { korean: '안녕하세요',         native: '你好',         pronunciation: '니하오'      },
    { korean: '감사합니다',         native: '谢谢',         pronunciation: '씨에씨에'    },
    { korean: '실례합니다',         native: '对不起',       pronunciation: '뚜이부치'    },
    { korean: '어디에 있나요?',     native: '在哪里？',     pronunciation: '짜이 나리'   },
    { korean: '얼마예요?',          native: '多少钱？',     pronunciation: '뚜어샤오 치엔' },
    { korean: '도와주세요',         native: '请帮帮我',     pronunciation: '칭 방방 워'  },
    { korean: '화장실이 어디예요?', native: '厕所在哪里？', pronunciation: '츠쑤어 짜이 나리' },
    { korean: '모르겠어요',         native: '我不明白',     pronunciation: '워 뿌 밍바이' },
  ],
};
