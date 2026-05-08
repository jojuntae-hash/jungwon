export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const fontOptions: FontOption[] = [
  { id: 'noto-sans', name: 'Noto Sans KR (깔끔함)', family: "'Noto Sans KR', sans-serif" },
  { id: 'pretendard', name: '프리텐다드 (트렌디)', family: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif' },
];
