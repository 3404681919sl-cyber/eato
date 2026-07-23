import { PLATFORM_CONFIG, CATEGORY_LABELS, CATEGORY_BASE_PRICE } from "../config/platforms.js";

// ── Real API integration stubs ──
// To use real Taobao/JD prices:
// 1. Register for Taobao Ke (淘宝客): https://pub.alimama.com/
// 2. Register for JD Alliance (京东联盟): https://union.jd.com/
// 3. Fill in your API keys below and implement the functions
/*
async function searchTaobaoPrice(keyword) {
  // Taobao Ke API: https://open.taobao.com/
  const APP_KEY = "your_app_key";
  const SECRET = "your_secret";
  // ... implement API call
  return null;
}
async function searchJDPrice(keyword) {
  // JD Alliance API: https://union.jd.com/
  const APP_KEY = "your_app_key";
  const SECRET = "your_secret";
  // ... implement API call
  return null;
}
*/

// ── Deterministic PRNG (xmur3 + mulberry32) ──
// Replace Math.random() so the SAME place+category always produces the SAME
// prices. This makes the mock API reproducible and stable across requests.
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDealDescription(platform, category) {
  const descs = {
    meituan:  { hotpot: "双人火锅套餐 含饮料", sushi: "日料omakase套餐", noodles: "招牌面+小吃套餐", cafe: "下午茶双人套餐", western: "西餐双人套餐", bbq: "烤肉双人套餐", local: "本帮菜套餐", other: "热门套餐" },
    douyin:   { hotpot: "到店团购 免预约", sushi: "日料放题团购", noodles: "面食套餐团购", cafe: "咖啡甜品团购", western: "西餐团购套餐", bbq: "烤肉团购", local: "本帮菜团购", other: "美食团购" },
    dianping: { hotpot: "VIP套餐 赠甜品", sushi: "精选日料套餐", noodles: "面点套餐", cafe: "人气咖啡套餐", western: "甄选西餐", bbq: "必吃烤肉", local: "风味本帮菜", other: "精品套餐" },
    taobao:   { hotpot: "限时秒杀 前10份", sushi: "限时优惠", noodles: "秒杀价", cafe: "限时折扣", western: "限时特惠", bbq: "秒杀套餐", local: "限时优惠", other: "限时秒杀" },
    xianyu:   { hotpot: "转让未使用优惠券", sushi: "转让日料券", noodles: "转让面券", cafe: "转让咖啡券", western: "转让西餐券", bbq: "转让烤肉券", local: "转让本帮菜券", other: "转让优惠券" },
  };
  return descs[platform]?.[category] || "优惠套餐";
}

function getDeepLink(platform, placeName, category) {
  const keyword = encodeURIComponent(placeName);
  const catLabel = encodeURIComponent(CATEGORY_LABELS[category] || "美食");
  const links = {
    meituan:  `https://i.meituan.com/awp/h5/search/all/?keyword=${keyword}`,
    douyin:   `https://www.douyin.com/search/${keyword}%20优惠?type=general`,
    dianping: `https://m.dianping.com/search/keyword/${encodeURIComponent(placeName)}/${catLabel}`,
    taobao:   `https://s.taobao.com/search?q=${keyword}+优惠`,
    xianyu:   `https://m.goofish.com/search?q=${keyword}+优惠券`,
  };
  return links[platform] || `https://www.baidu.com/s?wd=${keyword}+优惠`;
}

function getTag(platform, price, all) {
  if (price === Math.min(...Object.values(all))) return "最低价";
  const avg = Object.values(all).reduce((a, b) => a + b, 0) / Object.values(all).length;
  if (platform === "douyin" && price < avg) return "热销";
  if (platform === "taobao") return "秒杀";
  if (platform === "xianyu") return "限时";
  return undefined;
}

export function generateDeals(category, placeName) {
  const base = CATEGORY_BASE_PRICE[category] || 88;
  // Deterministic seed: same store + category ⇒ same prices every time.
  const rand = mulberry32(xmur3(`${placeName || "x"}|${category}`)());
  const r = (lo, hi) => Math.round(base * lo + rand() * base * (hi - lo));

  const prices = {
    meituan:  r(0.72, 0.80),
    douyin:   r(0.65, 0.75),
    dianping: r(0.78, 0.85),
    taobao:   r(0.70, 0.78),
    xianyu:   r(0.60, 0.70),
  };

  const minPrice = Math.min(...Object.values(prices));
  const finalPrice = Math.round(minPrice * 0.92);
  const bestPlatform = Object.entries(prices).find(([, p]) => p === minPrice)?.[0] || "meituan";

  const deals = Object.entries(prices).map(([platform, price]) => {
    const platformName = PLATFORM_CONFIG[platform]?.name || platform;
    const platformColor = PLATFORM_CONFIG[platform]?.color || "#888";
    return {
      platform,
      platformName,
      platformColor,
      description: getDealDescription(platform, category),
      price: Math.round(price),
      originalPrice: base,
      discount: Math.round(((base - price) / base) * 100),
      isBest: price === minPrice,
      deepLink: getDeepLink(platform, placeName, category),
      tag: getTag(platform, price, prices),
    };
  });

  return {
    deals,
    bestStack: bestPlatform === "douyin"
      ? `先在抖音购买团购券（¥${Math.round(prices[bestPlatform])}），再叠加平台新用户优惠券，最终到手约 ¥${finalPrice}`
      : `先买套餐券（¥${Math.round(prices[bestPlatform])}），再用会员折扣，最终到手约 ¥${finalPrice}`,
    saving: base - finalPrice,
    finalPrice,
    bestUrl: getDeepLink(bestPlatform, placeName, category),
    keyword: encodeURIComponent(placeName),
  };
}
