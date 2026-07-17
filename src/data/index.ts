import type { Place, Category, Deal, DealsResult, Mood } from '../types';
import { PLATFORMS } from '../constants';

export function generateDeals(category: Category): DealsResult {
  var BASE_PRICES: Record<Category, number> = {
    hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
  };
  var base = BASE_PRICES[category];
  var r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));
  var meituanP  = r(0.72, 0.80);
  var douyinP   = r(0.65, 0.75);
  var dianpingP = r(0.78, 0.85);
  var taobaoP   = r(0.70, 0.78);
  var xianyuP   = r(0.60, 0.70);
  var prices = [meituanP, douyinP, dianpingP, taobaoP, xianyuP];
  var minP = Math.min(...prices);
  var deals: Deal[] = [
    { platform: 'meituan',  description: '双人套餐 含饮料',      price: meituanP,  originalPrice: base,  tag: meituanP  === minP ? '最低价' : undefined },
    { platform: 'douyin',   description: '到店团购 免预约',      price: douyinP,   originalPrice: base,  tag: douyinP   === minP ? '最低价' : '热销' },
    { platform: 'dianping', description: 'VIP 套餐 赠甜品',      price: dianpingP, originalPrice: base,  tag: dianpingP === minP ? '最低价' : undefined },
    { platform: 'taobao',   description: '限时秒杀 前10份',      price: taobaoP,   originalPrice: base,  tag: taobaoP   === minP ? '最低价' : '秒杀' },
    { platform: 'xianyu',   description: '转让未使用优惠券',      price: xianyuP,   originalPrice: base,  tag: xianyuP   === minP ? '最低价' : '限时' },
  ].map((d) => ({ ...d, isBest: d.price === minP }));
  var bestPlatform = deals.find((d) => d.isBest)!.platform;
  var finalPrice = Math.round(minP * 0.92);
  var stackSuggestion = bestPlatform === 'douyin'
    ? '先在抖音购买团购券（¥' + douyinP + '），再叠加平台新用户优惠券（-¥' + Math.round(douyinP * 0.08) + '），最终到手约 ¥' + finalPrice
    : '先买' + PLATFORMS[bestPlatform].name + '套餐券（¥' + minP + '），再用平台会员折扣 8.5 折，最终到手约 ¥' + finalPrice;
  return { deals, bestStack: stackSuggestion, saving: Math.round(base - finalPrice), finalPrice };
}

export function getPlatformDealUrl(platform: string, placeName: string, category: Category): string {
  var keyword = encodeURIComponent(placeName);
  var catLabels: Record<string, string> = { hotpot: '火锅', cafe: '咖啡', noodles: '面', sushi: '寿司', western: '西餐', bbq: '烧烤', local: '本帮菜', other: '美食' };
  var catLabel = encodeURIComponent(catLabels[category] || '美食');
  var urls: Record<string, string> = {
    meituan:  'https://i.meituan.com/awp/h5/search/all/?keyword=' + keyword,
    douyin:   'https://www.douyin.com/search/' + keyword + '%20优惠?type=general',
    dianping: 'https://m.dianping.com/search/keyword/' + catLabel + '/' + keyword,
    taobao:   'https://s.taobao.com/search?q=' + keyword + '+团购',
    xianyu:   'https://m.goofish.com/search?q=' + keyword + '+优惠券',
  };
  return urls[platform] || 'https://www.google.com/search?q=' + keyword + '+优惠';
}

export const SEED: Place[] = [
  {
    id: '1', name: '海底捞火锅',
    image: 'https://images.unsplash.com/photo-1614104030967-5ca61a54247b?w=120&h=120&fit=crop&auto=format',
    stars: 5, category: 'hotpot' as Category, mood: 'must' as Mood,
    plannedMenu: '番茄锅底 · 毛肚 · 鸭肠 · 虾滑 · 牛肉卷',
    visits: [
      { id: '1-1', date: '周六', time: '18:00', checkedIn: true,  spending: '340', review: '锅底超鲜！服务也很好，还有变脸表演' },
      { id: '1-2', date: '周三', time: '',       checkedIn: false, spending: '',    review: '' },
    ],
  },
  {
    id: '2', name: '乐鲸寿司',
    image: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=120&h=120&fit=crop&auto=format',
    stars: 4, category: 'sushi' as Category, mood: 'excited' as Mood,
    plannedMenu: 'omakase套餐 · 海鲜饭团 · 炙烤三文鱼',
    visits: [
      { id: '2-1', date: '周日', time: '12:30', checkedIn: false, spending: '', review: '' },
    ],
  },
  {
    id: '3', name: '陈记拉面馆',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=120&h=120&fit=crop&auto=format',
    stars: 4, category: 'noodles' as Category, mood: 'must' as Mood,
    plannedMenu: '招牌牛腩拉面 · 叉烧包 · 溏心蛋',
    visits: [
      { id: '3-1', date: '周二', time: '12:00', checkedIn: true, spending: '148', review: '面条Q弹，汤底浓郁，下次还要来！' },
    ],
  },
  {
    id: '4', name: '慢调咖啡',
    image: 'https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?w=120&h=120&fit=crop&auto=format',
    stars: 3, category: 'cafe' as Category, mood: 'curious' as Mood,
    plannedMenu: '手冲耶加 · 草莓拿铁 · 可颂 · 提拉米苏',
    visits: [
      { id: '4-1', date: '周四', time: '15:00', checkedIn: true,  spending: '96', review: '环境很好，适合聊天谈事情，音乐品味不错' },
      { id: '4-2', date: '周日', time: '',       checkedIn: false, spending: '',   review: '' },
    ],
  },
  {
    id: '5', name: '老外婆本帮菜',
    image: 'https://images.unsplash.com/photo-1658853577090-b96a5bdd5c20?w=120&h=120&fit=crop&auto=format',
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