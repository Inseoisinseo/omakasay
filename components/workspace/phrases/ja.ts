import type { Category } from './types';

const ja: Category[] = [
  {
    id: 'greeting',
    name: '인사 / 기본 예절',
    emoji: '🙏',
    phrases: [
      { id: 'g1', korean: '안녕하세요 (아침)',       native: 'おはようございます',       pronunciation: '오하요 고자이마스',         category: 'greeting' },
      { id: 'g2', korean: '안녕하세요 (낮)',         native: 'こんにちは',               pronunciation: '콘니치와',                 category: 'greeting' },
      { id: 'g3', korean: '안녕하세요 (저녁)',       native: 'こんばんは',               pronunciation: '콘방와',                   category: 'greeting' },
      { id: 'g4', korean: '감사합니다',               native: 'ありがとうございます',     pronunciation: '아리가토 고자이마스',       category: 'greeting' },
      { id: 'g5', korean: '죄송합니다',               native: 'すみません',               pronunciation: '스미마셍',                 category: 'greeting' },
      { id: 'g6', korean: '괜찮아요',                 native: '大丈夫です',               pronunciation: '다이죠부데스',             category: 'greeting' },
      { id: 'g7', korean: '아니요',                   native: 'いいえ',                   pronunciation: '이이에',                   category: 'greeting' },
      { id: 'g8', korean: '잠깐만요',                 native: 'ちょっと待ってください',   pronunciation: '촛토 맛테 쿠다사이',       category: 'greeting' },
    ],
  },
  {
    id: 'hotel',
    name: '숙소',
    emoji: '🏨',
    phrases: [
      { id: 'h1', korean: '체크인 부탁드립니다',         native: 'チェックインをお願いします',    pronunciation: '체크인오 오네가이시마스',          category: 'hotel' },
      { id: 'h2', korean: '체크아웃 부탁드립니다',       native: 'チェックアウトをお願いします',  pronunciation: '체크아웃토 오네가이시마스',        category: 'hotel' },
      { id: 'h3', korean: '방 열쇠를 잃어버렸어요',      native: '部屋の鍵をなくしました',       pronunciation: '헤야노 카기오 나쿠시마시타',      category: 'hotel' },
      { id: 'h4', korean: '와이파이 비밀번호가 뭔가요?', native: 'WiFiのパスワードは何ですか？', pronunciation: '와이파이노 파스와도와 난데스카',  category: 'hotel' },
      { id: 'h5', korean: '수건을 더 주세요',            native: 'タオルをもっとください',       pronunciation: '타오루오 못토 쿠다사이',           category: 'hotel' },
    ],
  },
  {
    id: 'restaurant',
    name: '식당 / 음식',
    emoji: '🍣',
    phrases: [
      { id: 'r1',  korean: '2명입니다',            native: '二人です',                pronunciation: '후타리데스',                   category: 'restaurant' },
      { id: 'r11', korean: '4명입니다',             native: '四人です',                pronunciation: '요닌데스',                     category: 'restaurant' },
      { id: 'r2',  korean: '메뉴 주세요',           native: 'メニューをください',       pronunciation: '메뉴오 쿠다사이',               category: 'restaurant' },
      { id: 'r3',  korean: '이걸로 주세요',          native: 'これをください',          pronunciation: '코레오 쿠다사이',               category: 'restaurant' },
      { id: 'r4',  korean: '추천 메뉴가 뭔가요?',   native: 'おすすめは何ですか？',    pronunciation: '오스스메와 난데스카',           category: 'restaurant' },
      { id: 'r5',  korean: '맛있어요!',              native: 'おいしい！',              pronunciation: '오이시이',                     category: 'restaurant' },
      { id: 'r6',  korean: '계산서 주세요',           native: 'お会計をお願いします',    pronunciation: '오카이케이오 오네가이시마스',   category: 'restaurant' },
      { id: 'r7',  korean: '카드 되나요?',            native: 'カードは使えますか？',    pronunciation: '카도와 츠카에마스카',           category: 'restaurant' },
      { id: 'r8',  korean: '물 주세요',               native: 'お水をください',          pronunciation: '오미즈오 쿠다사이',             category: 'restaurant' },
      { id: 'r9',  korean: '포장해 주세요',            native: '持ち帰りでお願いします',  pronunciation: '모치카에리데 오네가이시마스',   category: 'restaurant' },
      { id: 'r10', korean: '알레르기가 있어요',         native: 'アレルギーがあります',    pronunciation: '아레루기가 아리마스',           category: 'restaurant' },
    ],
  },
  {
    id: 'transport',
    name: '교통 / 길 찾기',
    emoji: '🚃',
    phrases: [
      { id: 't1', korean: '~역은 어디인가요?',      native: '～駅はどこですか？',             pronunciation: '~에키와 도코데스카',               category: 'transport' },
      { id: 't2', korean: '~에 가고 싶어요',         native: '～に行きたいです',               pronunciation: '~니 이키타이데스',                 category: 'transport' },
      { id: 't3', korean: '이 전철 ~역에 서나요?',   native: 'この電車は～駅に止まりますか？', pronunciation: '코노 덴샤와 ~에키니 토마리마스카', category: 'transport' },
      { id: 't4', korean: '택시 불러주세요',          native: 'タクシーを呼んでください',       pronunciation: '타쿠시오 욘데 쿠다사이',           category: 'transport' },
      { id: 't5', korean: '여기로 가주세요',           native: 'ここに行ってください',           pronunciation: '코코니 잇테 쿠다사이',             category: 'transport' },
      { id: 't6', korean: '얼마나 걸리나요?',          native: 'どのくらいかかりますか？',       pronunciation: '도노쿠라이 카카리마스카',           category: 'transport' },
    ],
  },
  {
    id: 'shopping',
    name: '쇼핑',
    emoji: '🛍️',
    phrases: [
      { id: 's1', korean: '얼마예요?',             native: 'いくらですか？',          pronunciation: '이쿠라데스카',              category: 'shopping' },
      { id: 's2', korean: '너무 비싸요',             native: '高すぎます',              pronunciation: '타카스기마스',             category: 'shopping' },
      { id: 's3', korean: '이거 입어봐도 되나요?',   native: '試着してもいいですか？',  pronunciation: '시챠쿠시테모 이이데스카',   category: 'shopping' },
      { id: 's4', korean: '다른 색상 있나요?',        native: '他の色はありますか？',    pronunciation: '호카노 이로와 아리마스카', category: 'shopping' },
      { id: 's5', korean: '면세 되나요?',             native: '免税できますか？',        pronunciation: '멘제이 데키마스카',        category: 'shopping' },
      { id: 's6', korean: '봉투 주세요',              native: '袋をください',            pronunciation: '후쿠로오 쿠다사이',        category: 'shopping' },
    ],
  },
  {
    id: 'emergency',
    name: '긴급 / 위급 상황',
    emoji: '🚑',
    phrases: [
      { id: 'em1', korean: '도와주세요!',               native: '助けてください！',                  pronunciation: '타스케테 쿠다사이',                category: 'emergency' },
      { id: 'em2', korean: '경찰을 불러주세요',          native: '警察を呼んでください',              pronunciation: '케이사츠오 욘데 쿠다사이',         category: 'emergency' },
      { id: 'em3', korean: '병원에 가야 해요',           native: '病院に行かなければなりません',       pronunciation: '뵤인니 이카나케레바 나리마셍',     category: 'emergency' },
      { id: 'em4', korean: '여기가 아파요',              native: 'ここが痛いです',                    pronunciation: '코코가 이타이데스',                category: 'emergency' },
      { id: 'em5', korean: '지갑을 잃어버렸어요',        native: '財布をなくしました',                pronunciation: '사이후오 나쿠시마시타',            category: 'emergency' },
      { id: 'em6', korean: '한국 대사관이 어디예요?',    native: '韓国大使館はどこですか？',           pronunciation: '캉코쿠 타이시캉와 도코데스카',    category: 'emergency' },
    ],
  },
  {
    id: 'communication',
    name: '소통이 안 될 때',
    emoji: '💬',
    phrases: [
      { id: 'c1', korean: '일본어를 못해요',         native: '日本語が話せません',          pronunciation: '니홍고가 하나세마셍',           category: 'communication' },
      { id: 'c2', korean: '한국어 할 수 있나요?',    native: '韓国語はできますか？',         pronunciation: '캉코쿠고와 데키마스카',         category: 'communication' },
      { id: 'c3', korean: '영어 할 수 있나요?',      native: '英語はできますか？',           pronunciation: '에이고와 데키마스카',           category: 'communication' },
      { id: 'c4', korean: '천천히 말해주세요',        native: 'ゆっくり話してください',       pronunciation: '윳쿠리 하나시테 쿠다사이',     category: 'communication' },
      { id: 'c5', korean: '한 번 더 말해주세요',      native: 'もう一度言ってください',       pronunciation: '모우 이치도 잇테 쿠다사이',    category: 'communication' },
      { id: 'c6', korean: '써주실 수 있나요?',        native: '書いてもらえますか？',         pronunciation: '카이테 모라에마스카',           category: 'communication' },
    ],
  },
];

export default ja;
