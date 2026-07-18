import type { Category, Deal, DealsResult, PlatformId } from '../types';
import { PLATFORMS } from '../constants';

const BASE: Record<Category, number> = {
  hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
};

export function generateDeals(category: Category): DealsResult {
  const base = BASE[category] || 88;
  const r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));

  const meituanP  = r(0.72, 0.80);
  const douyinP   = r(0.65, 0.75);
  const dianpingP = r(0.78, 0.85);
  const taobaoP   = r(0.70, 0.78);
  const xianyuP   = r(0.60, 0.70);

  const prices = [meituanP, douyinP, dianpingP, taobaoP, xianyuP];
  const minP = Math.min(...prices);
  const saving = Math.round(base - minP);
  const finalPrice = Math.round(minP * 0.92); // stacking extra coupon

  const baseDeals: Deal[] = [
    { platform: 'meituan' as PlatformId,  description: '双人套餐 含2饮料',           price: meituanP,  originalPrice: base,  tag: meituanP  === minP ? '最低价' : undefined },
    { platform: 'douyin' as PlatformId,   description: '达人探店团购券',             price: douyinP,   originalPrice: base,  tag: douyinP   === minP ? '最低价' : '可叠加' },
    { platform: 'dianping' as PlatformId, description: `满${base}减${Math.round(base * 0.15)}代金券`, price: dianpingP, originalPrice: base },
    { platform: 'taobao' as PlatformId,   description: '到店闪购 限量名额',          price: taobaoP,   originalPrice: base,  tag: taobaoP   === minP ? '最低价' : undefined },
    { platform: 'xianyu' as PlatformId,   description: '转让未使用套餐券',           price: xianyuP,   originalPrice: base,  tag: xianyuP   === minP ? '最低价' : '限时' },
  ];

  const deals = baseDeals.map((d) => ({ ...d, isBest: d.price === minP }));
  const bestPlatform = deals.find((d) => d.isBest)!.platform;
  const bestName = PLATFORMS[bestPlatform].name;

  const stackSuggestion = bestPlatform === 'douyin'
    ? `先在抖音购入团购券（¥${douyinP}），再叠加平台新用户优惠券（-¥${Math.round(douyinP * 0.08)}），最终到手约 ¥${finalPrice}`
    : `先买${bestName}套餐券（¥${minP}），再用平台会员折扣 8.5 折，最终到手约 ¥${finalPrice}`;

  return { deals, bestStack: stackSuggestion, saving: Math.round(base - finalPrice), finalPrice };
}
