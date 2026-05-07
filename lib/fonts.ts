export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const fontOptions: FontOption[] = [
  { id: 'noto-sans', name: 'Noto Sans KR (깔끔함)', family: "'Noto Sans KR', sans-serif" },
  { id: 'pretendard', name: '프리텐다드 (트렌디)', family: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif' },
  { id: 'ibm-plex', name: 'IBM Plex Sans KR (전문적)', family: "'IBM Plex Sans KR', sans-serif" },
  { id: 'nanum-myeongjo', name: '나눔명조 (우아함)', family: "'Nanum Myeongjo', serif" },
  { id: 'noto-serif', name: '본명조 (클래식)', family: "'Noto Serif KR', serif" },
  { id: 'jua', name: '주아 (감각적/둥글)', family: "'Jua', sans-serif" },
  { id: 'do-hyeon', name: '도현 (현대적/강렬)', family: "'Do Hyeon', sans-serif" },
  { id: 'gowun-dodum', name: '고운 돋움 (따뜻함)', family: "'Gowun Dodum', sans-serif" },
  { id: 'gamja-flower', name: '감자 꽃 (동화)', family: "'Gamja Flower', cursive" },
  { id: 'single-day', name: 'Single Day (모던 손글씨)', family: "'Single Day', cursive" },
];
