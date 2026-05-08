export interface Theme {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  cardBg: string;
}

export const themes: Theme[] = [
  {
    id: 'classic-garden',
    name: 'Classic Garden',
    description: '보라빛 정원의 우아함',
    primary: '#9D4EDD',
    secondary: '#F0E6FA',
    accent: '#E6A8A8',
    background: '#FDFCFE',
    text: '#4A3C59',
    cardBg: '#FFFFFF',
  },
  {
    id: 'vintage-sepia',
    name: 'Vintage Sepia',
    description: '오래된 사진첩의 따스함',
    primary: '#795548',
    secondary: '#F5F5DC',
    accent: '#D2B48C',
    background: '#FAF9F6',
    text: '#3E2723',
    cardBg: '#FFFFFF',
  },
  {
    id: 'midnight-gallery',
    name: 'Midnight Gallery',
    description: '전시회 같은 세련된 어둠',
    primary: '#64FFDA',
    secondary: '#1A1A2E',
    accent: '#FF4081',
    background: '#0F0F1A',
    text: '#E0E0E0',
    cardBg: '#16213E',
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: '시원한 파도와 모래사장',
    primary: '#0077B6',
    secondary: '#CAF0F8',
    accent: '#FFD166',
    background: '#F0F8FF',
    text: '#023E8A',
    cardBg: '#FFFFFF',
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: '봄날의 벚꽃 휘날림',
    primary: '#FF85A1',
    secondary: '#FFF0F5',
    accent: '#FFC1CF',
    background: '#FFF9FB',
    text: '#594146',
    cardBg: '#FFFFFF',
  },
  {
    id: 'forest-walk',
    name: 'Forest Walk',
    description: '울창한 숲속의 치유',
    primary: '#2D6A4F',
    secondary: '#D8F3DC',
    accent: '#B08968',
    background: '#F7FCF8',
    text: '#1B4332',
    cardBg: '#FFFFFF',
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    description: '순수하고 깨끗한 여백',
    primary: '#333333',
    secondary: '#F5F5F5',
    accent: '#888888',
    background: '#FFFFFF',
    text: '#222222',
    cardBg: '#FFFFFF',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: '노을 지는 수평선',
    primary: '#E85D04',
    secondary: '#FFBA08',
    accent: '#D00000',
    background: '#FFF8F0',
    text: '#370617',
    cardBg: '#FFFFFF',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    description: '몽환적인 보라색 안개',
    primary: '#7B2CBF',
    secondary: '#E0AAFF',
    accent: '#C77DFF',
    background: '#F9F5FF',
    text: '#240046',
    cardBg: '#FFFFFF',
  },
  {
    id: 'polaroid-archive',
    name: 'Polaroid Archive',
    description: '강렬한 흑백 폴라로이드',
    primary: '#000000',
    secondary: '#E0E0E0',
    accent: '#FF0000',
    background: '#F2F2F2',
    text: '#1A1A1A',
    cardBg: '#FFFFFF',
  },
];
