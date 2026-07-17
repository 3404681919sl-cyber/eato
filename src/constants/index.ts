import type { Category, Mood } from '../types';

export const CAT: Record<Category, { label: string; emoji: string; color: string; light: string }> = {
  hotpot:  { label: '火锅',  emoji: '🍲', color: '#DC2626', light: '#FEE2E2' },
  cafe:    { label: '茶咖',  emoji: '☕', color: '#2563EB', light: '#DBEAFE' },
  noodles: { label: '汤面',  emoji: '🍪', color: '#16A34A', light: '#DCFCE7' },
  sushi:   { label: '寿司',  emoji: '🍳', color: '#92400E', light: '#FEF3C7' },
  western: { label: '西餐',  emoji: '🍴', color: '#CA8A04', light: '#FEF9C3' },
  bbq:     { label: '烧烤',  emoji: '🍟', color: '#EA580C', light: '#FFEDD5' },
  local:   { label: '本帮菜', emoji: '🍡', color: '#7C3AED', light: '#EDE9FE' },
  other:   { label: '其他',  emoji: '🍈', color: '#6B7280', light: '#F3F4F6' },
};

export const MOOD: Record<Mood, { label: string; emoji: string; color: string }> = {
  must:    { label: '超想去', emoji: '🔥', color: '#DC2626' },
  excited: { label: '很期待', emoji: '⭐', color: '#D97706' },
  curious: { label: '想试试', emoji: '🎖', color: '#2563EB' },
  casual:  { label: '随便吃', emoji: '🍽', color: '#6B7280' },
};

export const PLATFORMS: Record<string, { name: string; color: string; bg: string; textColor: string }> = {
  meituan:  { name: '美团',     color: '#FFCC00', bg: '#FFFBE6', textColor: '#664D00' },
  douyin:   { name: '抖音',     color: '#161823', bg: '#F0F0F2', textColor: '#161823' },
  dianping: { name: '大众点评', color: '#FC5531', bg: '#FFF0ED', textColor: '#C03010' },
  taobao:   { name: '淘宝闪购', color: '#FF4400', bg: '#FFF3EE', textColor: '#C03010' },
  xianyu:   { name: '闲鱼',     color: '#00B8C8', bg: '#E8FAFC', textColor: '#007080' },
};

export const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2) + 10;
  const m = i % 2 === 0 ? '00' : '30';
  return h + ':' + m;
}).slice(0, 24);

export const USERS = [
  { id: 'a', name: '小美', color: '#BF4E2A' },
  { id: 'b', name: '阿帅', color: '#2563EB' },
  { id: 'c', name: '阿豪', color: '#16A34A' },
];

export const PIE_COLORS = ['#BF4E2A', '#E8963C', '#7DC88A', '#6B8FD9', '#A78BFA', '#FB7185'];
