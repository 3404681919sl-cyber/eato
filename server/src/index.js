import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Deal Search API ──
// This endpoint is designed to be connected to real e-commerce APIs.
// Currently uses smart mock data + deep links.
// To connect to real APIs, fill in the service functions below.

const PLATFORM_CONFIG = {
  meituan:  { name: '美团',     searchUrl: 'https://i.meituan.com/awp/h5/search/all/' },
  douyin:   { name: '抖音',     searchUrl: 'https://www.douyin.com/search/' },
  dianping: { name: '大众点评', searchUrl: 'https://m.dianping.com/search/keyword/' },
  taobao:   { name: '淘宝',     searchUrl: 'https://s.taobao.com/search' },
  xianyu:   { name: '闲鱼',     searchUrl: 'https://m.goofish.com/search' },
};

const CATEGORY_BASE: Record<string, number> = {
  hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
};

// ── Real API integration stubs ──
// To use real Taobao/JD prices:
// 1. Register for Taobao Ke (淘宝客): https://pub.alimama.com/
// 2. Register for JD Alliance (京东联盟): https://union.jd.com/
// 3. Fill in your API keys below and implement the functions

/*
async function searchTaobaoPrice(keyword: string): Promise<number | null> {
  // Taobao Ke API: https://open.taobao.com/
  const APP_KEY = 'your_app_key';
  const SECRET = 'your_secret';
  // ... implement API call
  return null;
}

async function searchJDPrice(keyword: string): Promise<number | null> {
  // JD Alliance API: https://union.jd.com/
  const APP_KEY = 'your_app_key';
  const SECRET = 'your_secret';
  // ... implement API call
  return null;
}
*/

// ── Generate deals (smart mock with deep links) ──
function generateDeals(category: string, placeName: string) {
  const base = CATEGORY_BASE[category] || 88;
  const r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));

  const prices = {
    meituan:  r(0.72, 0.80),
    douyin:   r(0.65, 0.75),
    dianping: r(0.78, 0.85),
    taobao:   r(0.70, 0.78),
    xianyu:   r(0.60, 0.70),
  };

  const minPrice = Math.min(...Object.values(prices));
  const finalPrice = Math.round(minPrice * 0.92);
  const bestPlatform = Object.entries(prices).find(([, p]) => p === minPrice)?.[0] || 'meituan';

  const deals = Object.entries(prices).map(([platform, price]) => ({
    platform,
    platformName: PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.name || platform,
    description: getDealDescription(platform, category),
    price,
    originalPrice: base,
    discount: Math.round(((base - price) / base) * 100),
    isBest: price === minPrice,
    deepLink: getDeepLink(platform, placeName, category),
    tag: price === minPrice ? '最低价' : getTag(platform, price, prices),
  }));

  const keyword = encodeURIComponent(placeName);
  const bestUrl = getDeepLink(bestPlatform, placeName, category);

  return {
    deals,
    bestStack: bestPlatform === 'douyin'
      ? 先在抖音购买团购券（¥），再叠加平台新用户优惠券，最终到手约 ¥
      : 先买套餐券（¥），再用会员折扣，最终到手约 ¥,
    saving: base - finalPrice,
    finalPrice,
    bestUrl,
    keyword,
  };
}

function getDealDescription(platform: string, category: string): string {
  const descs: Record<string, Record<string, string>> = {
    meituan:  { hotpot: '双人火锅套餐 含饮料', sushi: '日料omakase套餐', noodles: '招牌面+小吃套餐', cafe: '下午茶双人套餐', western: '西餐双人套餐', bbq: '烤肉双人套餐', local: '本帮菜套餐', other: '热门套餐' },
    douyin:   { hotpot: '到店团购 免预约', sushi: '日料放题团购', noodles: '面食套餐团购', cafe: '咖啡甜品团购', western: '西餐团购套餐', bbq: '烤肉团购', local: '本帮菜团购', other: '美食团购' },
    dianping: { hotpot: 'VIP套餐 赠甜品', sushi: '精选日料套餐', noodles: '面点套餐', cafe: '人气咖啡套餐', western: '甄选西餐', bbq: '必吃烤肉', local: '风味本帮菜', other: '精品套餐' },
    taobao:   { hotpot: '限时秒杀 前10份', sushi: '限时优惠', noodles: '秒杀价', cafe: '限时折扣', western: '限时特惠', bbq: '秒杀套餐', local: '限时优惠', other: '限时秒杀' },
    xianyu:   { hotpot: '转让未使用优惠券', sushi: '转让日料券', noodles: '转让面券', cafe: '转让咖啡券', western: '转让西餐券', bbq: '转让烤肉券', local: '转让本帮菜券', other: '转让优惠券' },
  };
  return descs[platform]?.[category] || '优惠套餐';
}

function getTag(platform: string, price: number, all: Record<string, number>): string | undefined {
  if (price === Math.min(...Object.values(all))) return '最低价';
  if (platform === 'douyin' && price < Object.values(all).reduce((a, b) => a + b, 0) / Object.values(all).length) return '热销';
  if (platform === 'taobao') return '秒杀';
  if (platform === 'xianyu') return '限时';
  return undefined;
}

function getDeepLink(platform: string, placeName: string, category: string): string {
  const keyword = encodeURIComponent(placeName);
  const catLabel = encodeURIComponent(
    ({ hotpot: '火锅', cafe: '咖啡', noodles: '面', sushi: '寿司', western: '西餐', bbq: '烧烤', local: '本帮菜', other: '美食' } as Record<string, string>)[category] || '美食'
  );
  const links: Record<string, string> = {
    meituan:  https://i.meituan.com/awp/h5/search/all/?keyword=,
    douyin:   https://www.douyin.com/search/%20优惠?type=general,
    dianping: https://m.dianping.com/search/keyword//,
    taobao:   https://s.taobao.com/search?q=+优惠,
    xianyu:   https://m.goofish.com/search?q=+优惠券,
  };
  return links[platform] || https://www.baidu.com/s?wd=+优惠;
}

// ── API Routes ──

// GET /api/deals?place=海底捞火锅&category=hotpot
app.get('/api/deals', (req, res) => {
  const { place, category } = req.query;
  if (!place || !category) {
    return res.status(400).json({ error: 'Missing required params: place, category' });
  }
  
  const result = generateDeals(category as string, place as string);
  res.json(result);
});

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/platforms
app.get('/api/platforms', (_req, res) => {
  res.json(Object.entries(PLATFORM_CONFIG).map(([key, val]) => ({
    id: key,
    name: val.name,
    searchUrl: val.searchUrl,
  })));
});

app.listen(PORT, () => {
  console.log(🛵 Eato API server running on http://localhost:);
  console.log(📡 Deal API: http://localhost:/api/deals?place=海底捞&category=hotpot);
});
