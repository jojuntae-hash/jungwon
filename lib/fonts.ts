export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const fontOptions: FontOption[] = [
  { id: 'noto-sans', name: 'Noto Sans KR (깔끔)', family: "'Noto Sans KR', sans-serif" },
  { id: 'gowun-batang', name: '고운 바탕 (서정적)', family: "'Gowun Batang', serif" },
  { id: 'gowun-dodum', name: '고운 돋움 (따뜻함)', family: "'Gowun Dodum', sans-serif" },
  { id: 'nanum-myeongjo', name: '나눔 명조 (우아함)', family: "'Nanum Myeongjo', serif" },
  { id: 'nanum-pen', name: '나눔 펜 (손글씨)', family: "'Nanum Pen Script', cursive" },
  { id: 'gamja-flower', name: '감자 꽃 (동화)', family: "'Gamja Flower', cursive" },
  { id: 'hi-melody', name: 'Hi Melody (발랄)', family: "'Hi Melody', cursive" },
  { id: 'song-myung', name: '송명 (클래식)', family: "'Song Myung', serif" },
  { id: 'single-day', name: 'Single Day (모던 손글씨)', family: "'Single Day', cursive" },
  { id: 'inter', name: 'Inter (영문 세련)', family: "'Inter', sans-serif" },
];
