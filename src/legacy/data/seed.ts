import type { Place, Category, Mood } from '../types';

export const SEED: Place[] = [
  {
    id: '1', name: '海底捞火锅',
    image: '/brands/haidi-lao.svg',
    stars: 5, category: 'hotpot' as Category, mood: 'must' as Mood,
    plannedMenu: '番茄锅底 · 毛肚 · 鸭肠 · 虾滑 · 牛肉卷',
    visits: [
      { id: '1-1', date: '周六', time: '18:00', checkedIn: true,  spending: '340', review: '锅底超鲜！服务也很好，还有变脸表演' },
      { id: '1-2', date: '周三', time: '',       checkedIn: false, spending: '',    review: '' },
    ],
  },
  {
    id: '2', name: '乐鲸寿司',
    image: '/brands/lejing-sushi.svg',
    stars: 4, category: 'sushi' as Category, mood: 'excited' as Mood,
    plannedMenu: 'omakase套餐 · 海鲜饭团 · 炙烤三文鱼',
    visits: [
      { id: '2-1', date: '周日', time: '12:30', checkedIn: false, spending: '', review: '' },
    ],
  },
  {
    id: '3', name: '陈记拉面馆',
    image: '/brands/chenji-ramen.svg',
    stars: 4, category: 'noodles' as Category, mood: 'must' as Mood,
    plannedMenu: '招牌牛腩拉面 · 叉烧包 · 溏心蛋',
    visits: [
      { id: '3-1', date: '周二', time: '12:00', checkedIn: true, spending: '148', review: '面条Q弹，汤底浓郁，下次还要来！' },
    ],
  },
  {
    id: '4', name: '慢调咖啡',
    image: '/brands/mandiao-cafe.svg',
    stars: 3, category: 'cafe' as Category, mood: 'curious' as Mood,
    plannedMenu: '手冲耶加 · 草莓拿铁 · 可颂 · 提拉米苏',
    visits: [
      { id: '4-1', date: '周四', time: '15:00', checkedIn: true,  spending: '96', review: '环境很好，适合聊天谈事情，音乐品味不错' },
      { id: '4-2', date: '周日', time: '',       checkedIn: false, spending: '',   review: '' },
    ],
  },
  {
    id: '5', name: '老外婆本帮菜',
    image: '/brands/laowaipo.svg',
    stars: 5, category: 'local' as Category, mood: 'excited' as Mood,
    plannedMenu: '红烧肉 · 腌笃鲜 · 响油鳝糊 · 草头圈子',
    visits: [
      { id: '5-1', date: '周五', time: '19:00', checkedIn: false, spending: '', review: '' },
    ],
  },
];

export function buildSeedCalendar(): Record<string, string[]> {
  var slots: Record<string, string[]> = {};
  var mark = (day: string, times: string[], user: string) => {
    times.forEach((t) => {
      var k = day + '_' + t;
      slots[k] = [...(slots[k] || []), user];
    });
  };
  mark('周三', ['12:00', '12:30', '13:00', '13:30'], 'a');
  mark('周六', ['18:00', '18:30', '19:00', '19:30'], 'a');
  mark('周三', ['13:00', '13:30', '14:00', '14:30'], 'b');
  mark('周五', ['19:00', '19:30', '20:00', '20:30'], 'b');
  mark('周六', ['18:00', '18:30', '19:00', '19:30', '20:00'], 'b');
  mark('周五', ['18:00', '18:30', '19:00', '19:30'], 'c');
  mark('周六', ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30'], 'c');
  return slots;
}