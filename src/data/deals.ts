import type { Category, Deal, DealsResult } from '../types';
import { PLATFORMS } from '../constants';

const BASE: Record<Category, number> = {
  hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
};

export function generateDeals(category: Category): DealsResult {
  var base = BASE[category] || 88;
  var r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));
  var meituanP  = r(0.72, 0.80);
  var douyinP   = r(0.65, 0.75);
  var dianpingP = r(0.78, 0.85);
  var taobaoP   = r(0.70, 0.78);
  var xianyuP   = r(0.60, 0.70);
  var prices = [meituanP, douyinP, dianpingP, taobaoP, xianyuP];
  var minP = Math.min(...prices);
  var baseDeals: Deal[] = [
    { platform: 'meituan',  description: '双人套餐 含饮料',      price: meituanP,  originalPrice: base,  tag: meituanP  === minP ? '最低价' : undefined },
    { platform: 'douyin',   description: '到店团购 免预约',      price: douyinP,   originalPrice: base,  tag: douyinP   === minP ? '最低价' : '热销' },
    { platform: 'dianping', description: 'VIP 套餐 赠甜品',      price: dianpingP, originalPrice: base,  tag: dianpingP === minP ? '最低价' : undefined },
    { platform: 'taobao',   description: '限时秒杀 前10份',      price: taobaoP,   originalPrice: base,  tag: taobaoP   === minP ? '最低价' : '秒杀' },
    { platform: 'xianyu',   description: '转让未使用优惠券',      price: xianyuP,   originalPrice: base,  tag: xianyuP   === minP ? '最低价' : '限时' },
  ];
  var deals = baseDeals.map((d) => ({ ...d, isBest: d.price === minP }));
  var bestPlatform = deals.find((d) => d.isBest)!.platform;
  var bestName = PLATFORMS[bestPlatform].name;
  // 最严谨：最优到手价就是当前列表里的最低价，不虚构叠加优惠
  var finalPrice = minP;
  var saving = base - minP;
  var stackSuggestion = '当前最低价在' + bestName + '（¥' + minP + '），可直接购买';
  return { deals, bestStack: stackSuggestion, saving, finalPrice };
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

/*
 * REAL API INTEGRATION STUBS
 * 接入真实平台比价时，在此下方实现：
 * - searchTaobaoPrice(keyword): 淘宝联盟 API → https://pub.alimama.com/
 * - searchJDPrice(keyword): 京东联盟 API → https://union.jd.com/
 * - searchMeituanPrice(keyword): 美团（无公开API，可爬虫/合作）
 */