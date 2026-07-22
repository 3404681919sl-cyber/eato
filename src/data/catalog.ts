import type { Category, Mood, Place, Dish, Deal, DealsResult } from "../types";

export const CAT: Record<Category, { label: string; emoji: string; color: string; light: string }> = {
  hotpot:  { label: "火锅",  emoji: "🍲", color: "#DC2626", light: "#FEE2E2" },
  chinese: { label: "中餐",  emoji: "🥢", color: "#7C3AED", light: "#EDE9FE" },
  fastfood:{ label: "面点",  emoji: "🍜", color: "#16A34A", light: "#DCFCE7" },
  asian:   { label: "日韩",  emoji: "🍣", color: "#B45309", light: "#FEF3C7" },
  western: { label: "西餐",  emoji: "🍽️", color: "#CA8A04", light: "#FEF9C3" },
  bbq:     { label: "烧烤",  emoji: "🔥", color: "#EA580C", light: "#FFEDD5" },
  dessert: { label: "茶饮",  emoji: "🧋", color: "#DB2777", light: "#FCE7F3" },
  seafood: { label: "海鲜",  emoji: "🦐", color: "#0369A1", light: "#E0F2FE" },
  other:   { label: "其他",  emoji: "🍴", color: "#6B7280", light: "#F3F4F6" },
};

export const MOOD: Record<Mood, { label: string; emoji: string; color: string }> = {
  must:    { label: "超想去", emoji: "🔥", color: "#DC2626" },
  excited: { label: "很期待", emoji: "⭐", color: "#D97706" },
  curious: { label: "想试试", emoji: "👀", color: "#2563EB" },
  casual:  { label: "随便啦", emoji: "😌", color: "#6B7280" },
};

export const PLATFORMS: Record<string, { name: string; color: string; bg: string; textColor: string }> = {
  meituan:  { name: "美团",     color: "#FFCC00", bg: "#FFFBE6", textColor: "#664D00" },
  douyin:   { name: "抖音",     color: "#161823", bg: "#F0F0F2", textColor: "#161823" },
  dianping: { name: "大众点评", color: "#FC5531", bg: "#FFF0ED", textColor: "#C03010" },
  taobao:   { name: "淘宝闪购", color: "#FF4400", bg: "#FFF3EE", textColor: "#C03010" },
  xianyu:   { name: "闲鱼",     color: "#00B8C8", bg: "#E8FAFC", textColor: "#007080" },
};

export function generateDeals(category: Category): DealsResult {
  const BASE: Record<string, number> = {
    hotpot: 158, chinese: 98, fastfood: 58, asian: 128, western: 248, bbq: 128, dessert: 72, seafood: 188, other: 88,
  };
  const cat = BASE[category] !== undefined ? category : "other";
  const base = BASE[cat];
  const r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));

  const meituanP  = r(0.72, 0.80);
  const douyinP   = r(0.65, 0.75);
  const dianpingP = r(0.78, 0.85);
  const taobaoP   = r(0.70, 0.78);
  const xianyuP   = r(0.60, 0.70);

  const prices = [meituanP, douyinP, dianpingP, taobaoP, xianyuP];
  const minP = Math.min(...prices);

  const deals: Deal[] = [
    { platform: "meituan",  description: "双人套餐 含2饮料",      price: meituanP,  originalPrice: base,  tag: meituanP  === minP ? "最低价" : undefined },
    { platform: "douyin",   description: "达人探店团购券",         price: douyinP,   originalPrice: base,  tag: douyinP   === minP ? "最低价" : "可叠加" },
    { platform: "dianping", description: `满${base}减${Math.round(base*0.15)}代金券`, price: dianpingP, originalPrice: base },
    { platform: "taobao",   description: "到店闪购 限量名额",      price: taobaoP,   originalPrice: base,  tag: taobaoP   === minP ? "最低价" : undefined },
    { platform: "xianyu",   description: "转让未使用套餐券",       price: xianyuP,   originalPrice: base,  tag: xianyuP   === minP ? "最低价" : "限时" },
  ].map((d) => ({ ...d, isBest: d.price === minP }));

  const bestDeal = deals.find((d) => d.isBest) ?? deals[0];
  const bestName = PLATFORMS[bestDeal.platform]?.name ?? bestDeal.platform;
  const stackSuggestion = `当前最低价为 ${bestName}（¥${bestDeal.price}），可直接购买。`;

  return { deals, bestStack: stackSuggestion, saving: Math.round(base - minP), finalPrice: minP };
}

export const DISH_DB: Record<Category, Dish[]> = {
hotpot: [
    { id: "h01", name: "番茄锅底", emoji: "🍅", image: "https://images.pexels.com/photos/10672908/pexels-photo-10672908.jpeg", rating: 4.8, reviewCount: 1243, sentiments: [{ percent: 72, text: "酸甜浓郁" }, { percent: 18, text: "开胃解腻" }, { percent: 10, text: "汤底偏淡" }] },
    { id: "h02", name: "菌汤火锅", emoji: "🍄", image: "https://images.pexels.com/photos/36054292/pexels-photo-36054292.jpeg", rating: 4.7, reviewCount: 892, sentiments: [{ percent: 68, text: "菌香浓郁" }, { percent: 20, text: "鲜甜不腻" }, { percent: 12, text: "略淡" }] },
    { id: "h03", name: "清油麻辣锅", emoji: "🌶️", image: "https://images.pexels.com/photos/19775602/pexels-photo-19775602.jpeg", rating: 4.7, reviewCount: 1056, sentiments: [{ percent: 70, text: "麻辣鲜香" }, { percent: 18, text: "越煮越香" }, { percent: 12, text: "偏油" }] },
    { id: "h04", name: "牛油锅底", emoji: "🔥", image: "https://images.pexels.com/photos/5949002/pexels-photo-5949002.jpeg", rating: 4.8, reviewCount: 1380, sentiments: [{ percent: 75, text: "牛油醇香" }, { percent: 15, text: "够辣过瘾" }, { percent: 10, text: "热量高" }] },
    { id: "h05", name: "寿喜锅底", emoji: "🍲", image: "https://images.pexels.com/photos/7287700/pexels-photo-7287700.jpeg", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 62, text: "汤汁甘甜" }, { percent: 22, text: "涮和牛一绝" }, { percent: 16, text: "偏甜" }] },
    { id: "h06", name: "三鲜火锅", emoji: "🥘", image: "https://images.pexels.com/photos/30882911/pexels-photo-30882911.jpeg", rating: 4.4, reviewCount: 380, sentiments: [{ percent: 58, text: "清淡鲜美" }, { percent: 28, text: "老少皆宜" }, { percent: 14, text: "不够味" }] },
    { id: "h07", name: "叻沙锅底🆕", emoji: "🌿", image: "https://images.pexels.com/photos/12153574/pexels-photo-12153574.jpeg", rating: 4.3, reviewCount: 210, sentiments: [{ percent: 56, text: "东南亚风味" }, { percent: 26, text: "椰香浓郁" }, { percent: 18, text: "口味两极" }] },
    { id: "h08", name: "捞派毛肚", emoji: "🥩", image: "https://images.pexels.com/photos/31617225/pexels-photo-31617225.jpeg", rating: 4.9, reviewCount: 1680, sentiments: [{ percent: 81, text: "脆嫩弹牙" }, { percent: 12, text: "新鲜" }, { percent: 7, text: "分量少" }] },
    { id: "h09", name: "捞派黄喉", emoji: "🥓", image: "https://images.pexels.com/photos/13548819/pexels-photo-13548819.jpeg", rating: 4.7, reviewCount: 720, sentiments: [{ percent: 68, text: "脆爽有嚼劲" }, { percent: 20, text: "处理干净" }, { percent: 12, text: "涮久老" }] },
    { id: "h10", name: "脆脆毛肚🆕", emoji: "🥩", image: "https://images.pexels.com/photos/3298642/pexels-photo-3298642.jpeg", rating: 4.8, reviewCount: 920, sentiments: [{ percent: 74, text: "七上八下刚好" }, { percent: 16, text: "大片过瘾" }, { percent: 10, text: "薄厚不一" }] },
    { id: "h11", name: "捞派千层肚🆕", emoji: "🥓", image: "https://images.pexels.com/photos/9670683/pexels-photo-9670683.jpeg", rating: 4.7, reviewCount: 650, sentiments: [{ percent: 70, text: "层层脆嫩" }, { percent: 18, text: "吸满汤汁" }, { percent: 12, text: "难夹" }] },
    { id: "h12", name: "捞派肥牛", emoji: "🥩", image: "https://images.pexels.com/photos/15997566/pexels-photo-15997566.jpeg", rating: 4.8, reviewCount: 1580, sentiments: [{ percent: 76, text: "肥瘦相间" }, { percent: 16, text: "嫩滑" }, { percent: 8, text: "偏肥" }] },
    { id: "h13", name: "极品雪花肥牛", emoji: "🥓", image: "https://images.pexels.com/photos/31617236/pexels-photo-31617236.jpeg", rating: 4.9, reviewCount: 1890, sentiments: [{ percent: 82, text: "大理石纹漂亮" }, { percent: 12, text: "入口即化" }, { percent: 6, text: "贵但值" }] },
    { id: "h14", name: "羔羊肋卷🆕", emoji: "🐑", image: "https://images.pexels.com/photos/29390883/pexels-photo-29390883.jpeg", rating: 4.7, reviewCount: 860, sentiments: [{ percent: 70, text: "膻味适中" }, { percent: 18, text: "嫩不膻" }, { percent: 12, text: "薄厚差" }] },
    { id: "h15", name: "西冷牛肉🆕", emoji: "🥩", image: "https://images.pexels.com/photos/31612179/pexels-photo-31612179.jpeg", rating: 4.8, reviewCount: 740, sentiments: [{ percent: 74, text: "肉质紧实" }, { percent: 16, text: "有嚼劲" }, { percent: 10, text: "略柴" }] },
    { id: "h16", name: "牛舌🆕", emoji: "👅", image: "https://images.pexels.com/photos/13729827/pexels-photo-13729827.jpeg", rating: 4.6, reviewCount: 480, sentiments: [{ percent: 64, text: "脆嫩无异味" }, { percent: 22, text: "切片均匀" }, { percent: 14, text: "处理要求高" }] },
    { id: "h17", name: "猪梅花肉🆕", emoji: "🐷", image: "https://images.pexels.com/photos/35834167/pexels-photo-35834167.jpeg", rating: 4.5, reviewCount: 390, sentiments: [{ percent: 60, text: "瘦中有肥" }, { percent: 26, text: "口感嫩" }, { percent: 14, text: "易老" }] },
    { id: "h18", name: "捞派虾滑", emoji: "🦐", image: "https://images.pexels.com/photos/24186313/pexels-photo-24186313.jpeg", rating: 4.9, reviewCount: 1420, sentiments: [{ percent: 78, text: "Q弹真虾肉" }, { percent: 14, text: "手打感" }, { percent: 8, text: "偏淀粉" }] },
    { id: "h19", name: "香菇贡丸🆕", emoji: "🍡", image: "https://images.pexels.com/photos/38632005/pexels-photo-38632005.jpeg", rating: 4.5, reviewCount: 420, sentiments: [{ percent: 60, text: "香菇味浓" }, { percent: 26, text: "Q弹" }, { percent: 14, text: "普通" }] },
    { id: "h20", name: "猪肉丸子🆕", emoji: "🍡", image: "https://images.pexels.com/photos/18764184/pexels-photo-18764184.jpeg", rating: 4.4, reviewCount: 350, sentiments: [{ percent: 58, text: "肉香扎实" }, { percent: 28, text: "多汁" }, { percent: 14, text: "偏咸" }] },
    { id: "h21", name: "鱼籽鱼丸🆕", emoji: "🍡", image: "https://images.pexels.com/photos/30882910/pexels-photo-30882910.jpeg", rating: 4.6, reviewCount: 380, sentiments: [{ percent: 64, text: "爆籽口感" }, { percent: 22, text: "鲜甜" }, { percent: 14, text: "小" }] },
    { id: "h22", name: "芝士福袋🆕", emoji: "🧀", image: "https://images.pexels.com/photos/30882914/pexels-photo-30882914.jpeg", rating: 4.7, reviewCount: 490, sentiments: [{ percent: 68, text: "芝士拉丝" }, { percent: 20, text: "创意吃法" }, { percent: 12, text: "腻" }] },
    { id: "h23", name: "游水虾🆕", emoji: "🦐", image: "https://images.pexels.com/photos/15633161/pexels-photo-15633161.jpeg", rating: 4.7, reviewCount: 620, sentiments: [{ percent: 70, text: "鲜甜弹牙" }, { percent: 20, text: "个头大" }, { percent: 10, text: "活虾少" }] },
    { id: "h24", name: "蟹味棒🆕", emoji: "🦀", image: "https://images.pexels.com/photos/33621138/pexels-photo-33621138.jpeg", rating: 4.3, reviewCount: 280, sentiments: [{ percent: 56, text: "模拟蟹味" }, { percent: 30, text: "便宜大碗" }, { percent: 14, text: "淀粉感" }] },
    { id: "h25", name: "鱿鱼须🆕", emoji: "🦑", image: "https://images.pexels.com/photos/20943971/pexels-photo-20943971.jpeg", rating: 4.6, reviewCount: 450, sentiments: [{ percent: 64, text: "脆嫩" }, { percent: 22, text: "Q弹有嚼劲" }, { percent: 14, text: "易老" }] },
    { id: "h26", name: "红薯宽粉", emoji: "🍜", image: "https://images.pexels.com/photos/4518664/pexels-photo-4518664.jpeg", rating: 4.5, reviewCount: 580, sentiments: [{ percent: 64, text: "软糯吸汁" }, { percent: 22, text: "饱腹强" }, { percent: 14, text: "易断" }] },
    { id: "h27", name: "嫩豆腐🆕", emoji: "🧈", image: "https://images.pexels.com/photos/29966389/pexels-photo-29966389.jpeg", rating: 4.4, reviewCount: 360, sentiments: [{ percent: 60, text: "豆香嫩滑" }, { percent: 26, text: "吸汤汁" }, { percent: 14, text: "易碎" }] },
    { id: "h28", name: "腐竹皮", emoji: "🫘", image: "https://images.pexels.com/photos/6339176/pexels-photo-6339176.jpeg", rating: 4.4, reviewCount: 310, sentiments: [{ percent: 58, text: "豆香浓" }, { percent: 28, text: "吸满汁" }, { percent: 14, text: "易烂" }] },
    { id: "h29", name: "魔芋丝🆕", emoji: "🥗", image: "https://images.pexels.com/photos/36680510/pexels-photo-36680510.jpeg", rating: 4.3, reviewCount: 250, sentiments: [{ percent: 56, text: "低卡解馋" }, { percent: 28, text: "Q弹" }, { percent: 16, text: "无味" }] },
    { id: "h30", name: "冻豆腐🆕", emoji: "🧊", image: "https://images.pexels.com/photos/34870559/pexels-photo-34870559.jpeg", rating: 4.4, reviewCount: 290, sentiments: [{ percent: 60, text: "孔吸满汁" }, { percent: 26, text: "暖胃" }, { percent: 14, text: "易碎" }] },
    { id: "h31", name: "白萝卜🆕", emoji: "🥬", image: "https://images.pexels.com/photos/4747451/pexels-photo-4747451.jpeg", rating: 4.3, reviewCount: 200, sentiments: [{ percent: 56, text: "解腻清甜" }, { percent: 28, text: "煮透好吃" }, { percent: 16, text: "普通" }] },
    { id: "h32", name: "甜玉米🆕", emoji: "🌽", image: "https://images.pexels.com/photos/12552691/pexels-photo-12552691.jpeg", rating: 4.4, reviewCount: 230, sentiments: [{ percent: 58, text: "甜脆多汁" }, { percent: 26, text: "啃着玩" }, { percent: 16, text: "老" }] },
    { id: "h33", name: "金针菇🆕", emoji: "🍄", image: "https://images.pexels.com/photos/7703365/pexels-photo-7703365.jpeg", rating: 4.3, reviewCount: 190, sentiments: [{ percent: 56, text: "脆嫩" }, { percent: 28, text: "吸汁神器" }, { percent: 16, text: "塞牙" }] },
    { id: "h34", name: "海鲜菇🆕", emoji: "🍄", image: "https://images.pexels.com/photos/14837864/pexels-photo-14837864.jpeg", rating: 4.4, reviewCount: 180, sentiments: [{ percent: 58, text: "鲜味足" }, { percent: 26, text: "滑嫩" }, { percent: 16, text: "小" }] },
    { id: "h35", name: "大白菜🆕", emoji: "🥬", image: "https://images.pexels.com/photos/30882976/pexels-photo-30882976.jpeg", rating: 4.2, reviewCount: 150, sentiments: [{ percent: 54, text: "清爽解腻" }, { percent: 30, text: "必点素菜" }, { percent: 16, text: "普通" }] },
    { id: "h36", name: "现炸酥肉(升级版)", emoji: "🥯", image: "https://images.pexels.com/photos/8491090/pexels-photo-8491090.jpeg", rating: 4.8, reviewCount: 880, sentiments: [{ percent: 72, text: "外酥里嫩" }, { percent: 18, text: "直接吃更好" }, { percent: 12, text: "略咸" }] },
    { id: "h37", name: "午餐肉(大颗粒)", emoji: "🥖", image: "https://images.pexels.com/photos/37032054/pexels-photo-37032054.jpeg", rating: 4.6, reviewCount: 540, sentiments: [{ percent: 62, text: "厚切满足" }, { percent: 26, text: "经典味道" }, { percent: 12, text: "偏咸" }] },
    { id: "h38", name: "鸭肠", emoji: "🦆", image: "https://images.pexels.com/photos/10672908/pexels-photo-10672908.jpeg", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 68, text: "爽脆无腥" }, { percent: 20, text: "处理干净" }, { percent: 12, text: "涮久老" }] },
    { id: "h39", name: "乌鸡卷🆕", emoji: "🐓", image: "https://images.pexels.com/photos/26699308/pexels-photo-26699308.jpeg", rating: 4.6, reviewCount: 400, sentiments: [{ percent: 64, text: "肉质紧实" }, { percent: 22, text: "有嚼劲" }, { percent: 14, text: "略柴" }] },
    { id: "h40", name: "鱼豆腐🆕", emoji: "🐟", image: "https://images.pexels.com/photos/36054292/pexels-photo-36054292.jpeg", rating: 4.4, reviewCount: 320, sentiments: [{ percent: 60, text: "Q弹入味" }, { percent: 26, text: "鱼味浓" }, { percent: 14, text: "淀粉多" }] }
  ],
  chinese: [
    { id: "cn1", name: "红烧肉", emoji: "🐷", image: "https://images.pexels.com/photos/7287700/pexels-photo-7287700.jpeg", rating: 4.8, reviewCount: 980, sentiments: [{ percent: 75, text: "肥而不腻" }, { percent: 15, text: "入口即化" }, { percent: 10, text: "偏甜口" }] },
    { id: "cn2", name: "糖醋排骨", emoji: "🥯", image: "https://images.pexels.com/photos/30882911/pexels-photo-30882911.jpeg", rating: 4.7, reviewCount: 720, sentiments: [{ percent: 68, text: "酸甜适口" }, { percent: 22, text: "外焦里嫩" }, { percent: 10, text: "骨头多" }] },
    { id: "cn3", name: "清蒸鲈鱼", emoji: "🐟", image: "https://images.pexels.com/photos/12153574/pexels-photo-12153574.jpeg", rating: 4.8, reviewCount: 540, sentiments: [{ percent: 78, text: "鱼肉鲜嫩" }, { percent: 14, text: "蒸得刚好" }, { percent: 8, text: "刺稍多" }] },
    { id: "cn4", name: "麻婆豆腐", emoji: "🫕", image: "https://images.pexels.com/photos/24186313/pexels-photo-24186313.jpeg", rating: 4.6, reviewCount: 650, sentiments: [{ percent: 65, text: "麻辣下饭" }, { percent: 23, text: "豆腐嫩" }, { percent: 12, text: "油大" }] },
    { id: "cn5", name: "宫保鸡丁", emoji: "🍗", image: "https://images.pexels.com/photos/38632005/pexels-photo-38632005.jpeg", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 58, text: "花生香脆" }, { percent: 28, text: "鸡肉嫩" }, { percent: 14, text: "偏甜" }] },
    { id: "cn6", name: "蒜蓉西兰花", emoji: "🥦", image: "https://images.pexels.com/photos/4747451/pexels-photo-4747451.jpeg", rating: 4.3, reviewCount: 310, sentiments: [{ percent: 60, text: "清爽解腻" }, { percent: 25, text: "火候好" }, { percent: 15, text: "蒜蓉不够" }] },
    { id: "cn7", name: "回锅肉", emoji: "🥩", image: "https://images.pexels.com/photos/16013899/pexels-photo-16013899.jpeg", rating: 4.7, reviewCount: 620, sentiments: [{ percent: 68, text: "肉片薄亮" }, { percent: 20, text: "豆瓣酱香" }, { percent: 12, text: "偏油" }] },
    { id: "cn8", name: "水煮鱼", emoji: "🐟", image: "https://images.pexels.com/photos/18764184/pexels-photo-18764184.jpeg", rating: 4.6, reviewCount: 480, sentiments: [{ percent: 64, text: "鱼肉滑嫩" }, { percent: 24, text: "麻辣过瘾" }, { percent: 12, text: "刺太多" }] },
    { id: "cn9", name: "东坡肘子", emoji: "🥩", image: "https://images.pexels.com/photos/30882910/pexels-photo-30882910.jpeg", rating: 4.8, reviewCount: 340, sentiments: [{ percent: 72, text: "软糯脱骨" }, { percent: 18, text: "肥瘦均" }, { percent: 10, text: "等太久" }] },
    { id: "cn10", name: "小炒黄牛肉", emoji: "🥪", image: "https://images.pexels.com/photos/17481113/pexels-photo-17481113.jpeg", rating: 4.5, reviewCount: 420, sentiments: [{ percent: 60, text: "牛肉嫩滑" }, { percent: 28, text: "下饭神" }, { percent: 12, text: "辣椒多" }] },
    { id: "cn11", name: "酸菜鱼", emoji: "🐟", image: "https://images.pexels.com/photos/30882914/pexels-photo-30882914.jpeg", rating: 4.7, reviewCount: 560, sentiments: [{ percent: 68, text: "酸爽开胃" }, { percent: 22, text: "鱼片无刺" }, { percent: 10, text: "汤不够酸" }] },
    { id: "cn12", name: "腌笃鲜", emoji: "🌽", image: "https://images.pexels.com/photos/15633161/pexels-photo-15633161.jpeg", rating: 4.6, reviewCount: 280, sentiments: [{ percent: 66, text: "汤白味鲜" }, { percent: 22, text: "春笋嫩" }, { percent: 12, text: "季节限定" }] }
  ],
  fastfood: [
    { id: "f1", name: "招牌牛骨拉面", emoji: "🍜", image: "https://images.pexels.com/photos/4518664/pexels-photo-4518664.jpeg", rating: 4.7, reviewCount: 920, sentiments: [{ percent: 70, text: "汤头浓郁" }, { percent: 18, text: "面条劲道" }, { percent: 12, text: "牛肉块少" }] },
    { id: "f2", name: "广式叉烧包", emoji: "🥩", image: "https://images.pexels.com/photos/33989565/pexels-photo-33989565.jpeg", rating: 4.5, reviewCount: 440, sentiments: [{ percent: 62, text: "馅料足" }, { percent: 26, text: "皮松软" }, { percent: 12, text: "微甜" }] },
    { id: "f3", name: "日式溏心蛋", emoji: "🥚", image: "https://images.pexels.com/photos/6940985/pexels-photo-6940985.jpeg", rating: 4.8, reviewCount: 670, sentiments: [{ percent: 82, text: "流心完美" }, { percent: 13, text: "拌面一绝" }, { percent: 5, text: "个别没流心" }] },
    { id: "f4", name: "红油抄手", emoji: "🥩", image: "https://images.pexels.com/photos/10950869/pexels-photo-10950869.jpeg", rating: 4.6, reviewCount: 380, sentiments: [{ percent: 66, text: "皮薄馅大" }, { percent: 22, text: "红油香" }, { percent: 12, text: "辣度偏高" }] },
    { id: "f5", name: "四川担担面", emoji: "🍝", image: "https://images.pexels.com/photos/8108045/pexels-photo-8108045.jpeg", rating: 4.5, reviewCount: 510, sentiments: [{ percent: 58, text: "麻酱香浓" }, { percent: 28, text: "辣度适" }, { percent: 14, text: "量不大" }] },
    { id: "f6", name: "老北京炸酱面", emoji: "🍜", image: "https://images.pexels.com/photos/16446206/pexels-photo-16446206.jpeg", rating: 4.4, reviewCount: 290, sentiments: [{ percent: 55, text: "酱给得足" }, { percent: 30, text: "菜码丰富" }, { percent: 15, text: "偏咸" }] },
    { id: "f7", name: "小笼包", emoji: "🥟", image: "https://images.pexels.com/photos/33312313/pexels-photo-33312313.jpeg", rating: 4.7, reviewCount: 530, sentiments: [{ percent: 70, text: "皮薄汤多" }, { percent: 18, text: "肉馅鲜" }, { percent: 12, text: "烫嘴" }] },
    { id: "f8", name: "兰州牛肉面", emoji: "🍜", image: "https://images.pexels.com/photos/4518672/pexels-photo-4518672.jpeg", rating: 4.6, reviewCount: 750, sentiments: [{ percent: 65, text: "一清二白" }, { percent: 22, text: "拉面筋道" }, { percent: 13, text: "萝卜片少" }] },
    { id: "f9", name: "生煎包", emoji: "🥩", image: "https://images.pexels.com/photos/18848769/pexels-photo-18848769.jpeg", rating: 4.7, reviewCount: 480, sentiments: [{ percent: 68, text: "底脆" }, { percent: 20, text: "肉汁丰" }, { percent: 12, text: "芝麻不匀" }] },
    { id: "f10", name: "馄饨/云吞", emoji: "🥟", image: "https://images.pexels.com/photos/16266742/pexels-photo-16266742.jpeg", rating: 4.5, reviewCount: 360, sentiments: [{ percent: 62, text: "皮滑馅嫩" }, { percent: 26, text: "汤底鲜" }, { percent: 12, text: "紫菜虾皮少" }] },
    { id: "f11", name: "烧麦", emoji: "🥘", image: "https://images.pexels.com/photos/4518665/pexels-photo-4518665.jpeg", rating: 4.4, reviewCount: 270, sentiments: [{ percent: 58, text: "糯米软糯" }, { percent: 28, text: "猪肉香" }, { percent: 14, text: "个头小" }] },
    { id: "f12", name: "肠粉", emoji: "🥙", image: "https://images.pexels.com/photos/8108050/pexels-photo-8108050.jpeg", rating: 4.6, reviewCount: 420, sentiments: [{ percent: 64, text: "晶莹剔透" }, { percent: 24, text: "酱汁香" }, { percent: 12, text: "容易破" }] }
  ],
  asian: [
    { id: "a1", name: "三文鱼厚切刺身", emoji: "🍣", image: "https://images.pexels.com/photos/11064614/pexels-photo-11064614.jpeg", rating: 4.9, reviewCount: 890, sentiments: [{ percent: 80, text: "新鲜肥美" }, { percent: 14, text: "厚切满足" }, { percent: 6, text: "价格贵" }] },
    { id: "a2", name: "炙烤三文鱼寿司", emoji: "🍣", image: "https://images.pexels.com/photos/11064619/pexels-photo-11064619.jpeg", rating: 4.8, reviewCount: 720, sentiments: [{ percent: 72, text: "焦糖香" }, { percent: 20, text: "米粒饱满" }, { percent: 8, text: "个头小" }] },
    { id: "a3", name: "天妇罗拼盘", emoji: "🍤", image: "https://images.pexels.com/photos/11463259/pexels-photo-11463259.jpeg", rating: 4.6, reviewCount: 410, sentiments: [{ percent: 64, text: "酥脆不油" }, { percent: 24, text: "面衣轻薄" }, { percent: 12, text: "凉了软" }] },
    { id: "a4", name: "日式炸鸡", emoji: "🍗", image: "https://images.pexels.com/photos/11463147/pexels-photo-11463147.jpeg", rating: 4.7, reviewCount: 560, sentiments: [{ percent: 68, text: "外脆里嫩多汁" }, { percent: 22, text: "腌料入味" }, { percent: 10, text: "份量一般" }] },
    { id: "a5", name: "韩式石锅拌饭", emoji: "🍚", image: "https://images.pexels.com/photos/34313409/pexels-photo-34313409.jpeg", rating: 4.5, reviewCount: 430, sentiments: [{ percent: 58, text: "锅巴香脆" }, { percent: 28, text: "配菜丰富" }, { percent: 14, text: "酱偏咸" }] },
    { id: "a6", name: "豚骨拉面", emoji: "🍜", image: "https://images.pexels.com/photos/17584435/pexels-photo-17584435.jpeg", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 71, text: "汤底浓郁" }, { percent: 18, text: "叉烧厚实" }, { percent: 11, text: "面偏硬" }] },
    { id: "a7", name: "鳗鱼饭", emoji: "🐟", image: "https://images.pexels.com/photos/4353087/pexels-photo-4353087.jpeg", rating: 4.8, reviewCount: 450, sentiments: [{ percent: 74, text: "鳗鱼软嫩" }, { percent: 18, text: "酱汁甜咸" }, { percent: 8, text: "分量少" }] },
    { id: "a8", name: "寿喜烧", emoji: "🍽", image: "https://images.pexels.com/photos/17584430/pexels-photo-17584430.jpeg", rating: 4.7, reviewCount: 380, sentiments: [{ percent: 68, text: "汤汁甘甜" }, { percent: 22, text: "和牛即化" }, { percent: 10, text: "蘸蛋液淡" }] },
    { id: "a9", name: "泡菜饼", emoji: "🥩", image: "https://images.pexels.com/photos/1028429/pexels-photo-1028429.jpeg", rating: 4.4, reviewCount: 260, sentiments: [{ percent: 60, text: "酸辣开胃" }, { percent: 26, text: "外酥里嫩" }, { percent: 14, text: "油大" }] },
    { id: "a10", name: "海胆饭团", emoji: "🐚", image: "https://images.pexels.com/photos/858501/pexels-photo-858501.jpeg", rating: 4.7, reviewCount: 340, sentiments: [{ percent: 70, text: "海胆鲜甜" }, { percent: 18, text: "饭温热刚好" }, { percent: 12, text: "量小贵" }] },
    { id: "a11", name: "味噌汤", emoji: "🍳", image: "https://images.pexels.com/photos/19957865/pexels-photo-19957865.jpeg", rating: 4.3, reviewCount: 210, sentiments: [{ percent: 56, text: "暖呼呼" }, { percent: 28, text: "收尾刚好" }, { percent: 16, text: "普通" }] },
    { id: "a12", name: "韩式炸鸡(甜辣)", emoji: "🍗", image: "https://images.pexels.com/photos/539430/pexels-photo-539430.jpeg", rating: 4.6, reviewCount: 520, sentiments: [{ percent: 66, text: "甜辣绝配" }, { percent: 22, text: "外皮酥脆" }, { percent: 12, text: "吃多腻" }] }
  ],
  western: [
    { id: "w1", name: "经典牛肉汉堡", emoji: "🍔", image: "https://images.pexels.com/photos/37030067/pexels-photo-37030067.jpeg", rating: 4.7, reviewCount: 880, sentiments: [{ percent: 68, text: "肉饼多汁" }, { percent: 20, text: "面包松软" }, { percent: 12, text: "酱料普通" }] },
    { id: "w2", name: "薯条", emoji: "🍟", image: "https://images.pexels.com/photos/5374014/pexels-photo-5374014.jpeg", rating: 4.5, reviewCount: 1200, sentiments: [{ percent: 72, text: "现炸酥脆" }, { percent: 18, text: "盐度刚好" }, { percent: 10, text: "易软塌" }] },
    { id: "w3", name: "意式肉酱面", emoji: "🍝", image: "https://images.pexels.com/photos/33621138/pexels-photo-33621138.jpeg", rating: 4.6, reviewCount: 670, sentiments: [{ percent: 62, text: "肉酱挂面" }, { percent: 26, text: "面条劲道" }, { percent: 12, text: "偏酸" }] },
    { id: "w4", name: "烤鸡翅(BBQ)", emoji: "🍗", image: "https://images.pexels.com/photos/37238862/pexels-photo-37238862.jpeg", rating: 4.7, reviewCount: 920, sentiments: [{ percent: 66, text: "外皮焦脆" }, { percent: 24, text: "腌料入味" }, { percent: 10, text: "肉质偏干" }] },
    { id: "w5", name: "凯撒沙拉", emoji: "🥗", image: "https://images.pexels.com/photos/7703365/pexels-photo-7703365.jpeg", rating: 4.4, reviewCount: 340, sentiments: [{ percent: 56, text: "生菜脆" }, { percent: 28, text: "酱汁浓郁" }, { percent: 16, text: "面包丁软" }] },
    { id: "w6", name: "玛格丽特披萨", emoji: "🕕", image: "https://images.pexels.com/photos/35142293/pexels-photo-35142293.jpeg", rating: 4.6, reviewCount: 550, sentiments: [{ percent: 64, text: "芝士能拉丝" }, { percent: 22, text: "饼边香脆" }, { percent: 14, text: "馅料不均" }] },
    { id: "w7", name: "意式烩饭", emoji: "🚚", image: "https://images.pexels.com/photos/20943971/pexels-photo-20943971.jpeg", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 60, text: "奶香浓郁" }, { percent: 26, text: "蘑菇鲜" }, { percent: 14, text: "偏油腻" }] },
    { id: "w8", name: "奶油蘑菇汤", emoji: "🍲", image: "https://images.pexels.com/photos/29966389/pexels-photo-29966389.jpeg", rating: 4.5, reviewCount: 280, sentiments: [{ percent: 62, text: "浓郁顺滑" }, { percent: 24, text: "蘑菇量足" }, { percent: 14, text: "热量高" }] },
    { id: "w9", name: "牛排(西冷)", emoji: "🥩", image: "https://images.pexels.com/photos/6545671/pexels-photo-6545671.jpeg", rating: 4.8, reviewCount: 540, sentiments: [{ percent: 72, text: "五分熟刚好" }, { percent: 18, text: "肉香足" }, { percent: 10, text: "贵" }] },
    { id: "w10", name: "烤肋排", emoji: "🥩", image: "https://images.pexels.com/photos/36936385/pexels-photo-36936385.jpeg", rating: 4.7, reviewCount: 420, sentiments: [{ percent: 68, text: "酱汁香甜" }, { percent: 20, text: "脱骨轻松" }, { percent: 12, text: "偏甜" }] },
    { id: "w11", name: "意式千层面", emoji: "🍝", image: "https://images.pexels.com/photos/6339176/pexels-photo-6339176.jpeg", rating: 4.6, reviewCount: 350, sentiments: [{ percent: 62, text: "层次分明" }, { percent: 26, text: "肉酱芝士足" }, { percent: 12, text: "量大" }] },
    { id: "w12", name: "凯撒卷饼", emoji: "🥖", image: "https://images.pexels.com/photos/37179548/pexels-photo-37179548.jpeg", rating: 4.4, reviewCount: 230, sentiments: [{ percent: 58, text: "方便拿" }, { percent: 28, text: "鸡肉嫩" }, { percent: 14, text: "酱少" }] }
  ],
  bbq: [
    { id: "b1", name: "羊肉串(红柳)", emoji: "🫑", image: "https://images.pexels.com/photos/16401326/pexels-photo-16401326.jpeg", rating: 4.8, reviewCount: 1100, sentiments: [{ percent: 74, text: "肥瘦相间" }, { percent: 18, text: "孜然香足" }, { percent: 8, text: "个别偏膻" }] },
    { id: "b2", name: "蒜蓉烤茄子", emoji: "🥦", image: "https://images.pexels.com/photos/37238864/pexels-photo-37238864.jpeg", rating: 4.6, reviewCount: 520, sentiments: [{ percent: 68, text: "蒜蓉铺满" }, { percent: 22, text: "软糯入味" }, { percent: 10, text: "火候难均" }] },
    { id: "b3", name: "炭烤生蚝", emoji: "🦪", image: "https://images.pexels.com/photos/37030068/pexels-photo-37030068.jpeg", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 70, text: "个大肉肥" }, { percent: 20, text: "蒜香浓郁" }, { percent: 10, text: "个别空壳" }] },
    { id: "b4", name: "烤韭菜", emoji: "🥯", image: "https://images.pexels.com/photos/37017244/pexels-photo-37017244.jpeg", rating: 4.3, reviewCount: 310, sentiments: [{ percent: 60, text: "火候刚好" }, { percent: 28, text: "调味香" }, { percent: 12, text: "塞牙" }] },
    { id: "b5", name: "烤五花肉", emoji: "🥩", image: "https://images.pexels.com/photos/37238869/pexels-photo-37238869.jpeg", rating: 4.8, reviewCount: 890, sentiments: [{ percent: 76, text: "滋滋冒油" }, { percent: 16, text: "包生菜绝配" }, { percent: 8, text: "易腻" }] },
    { id: "b6", name: "烤鸡翅中", emoji: "🍗", image: "https://images.pexels.com/photos/37331569/pexels-photo-37331569.jpeg", rating: 4.7, reviewCount: 790, sentiments: [{ percent: 68, text: "外皮焦脆" }, { percent: 22, text: "腌料入味" }, { percent: 10, text: "肉稍干" }] },
    { id: "b7", name: "烤玉米粒", emoji: "🌽", image: "https://images.pexels.com/photos/18719656/pexels-photo-18719656.jpeg", rating: 4.5, reviewCount: 380, sentiments: [{ percent: 64, text: "甜香" }, { percent: 24, text: "孜然辣椒香" }, { percent: 12, text: "颗粒少" }] },
    { id: "b8", name: "锡纸花甲粉", emoji: "🐚", image: "https://images.pexels.com/photos/38602965/pexels-photo-38602965.jpeg", rating: 4.4, reviewCount: 250, sentiments: [{ percent: 58, text: "粉丝吸汁" }, { percent: 28, text: "花甲新鲜" }, { percent: 14, text: "沙子多" }] },
    { id: "b9", name: "烤馒头片", emoji: "🍞", image: "https://images.pexels.com/photos/34624105/pexels-photo-34624105.jpeg", rating: 4.3, reviewCount: 190, sentiments: [{ percent: 56, text: "酥脆" }, { percent: 28, text: "刷酱好吃" }, { percent: 16, text: "硬" }] },
    { id: "b10", name: "掌中宝", emoji: "🍗", image: "https://images.pexels.com/photos/8029532/pexels-photo-8029532.jpeg", rating: 4.6, reviewCount: 420, sentiments: [{ percent: 66, text: "脆脆的" }, { percent: 22, text: "软骨Q弹" }, { percent: 12, text: "小" }] }
  ],
  dessert: [
    { id: "d1", name: "招牌奶茶", emoji: "🧋", image: "https://images.pexels.com/photos/27219790/pexels-photo-27219790.jpeg", rating: 4.8, reviewCount: 2100, sentiments: [{ percent: 68, text: "奶香浓郁" }, { percent: 20, text: "茶底清香" }, { percent: 12, text: "偏甜" }] },
    { id: "d2", name: "满杯水果茶", emoji: "🍏", image: "https://images.pexels.com/photos/12329098/pexels-photo-12329098.jpeg", rating: 4.6, reviewCount: 1500, sentiments: [{ percent: 62, text: "果肉丰富" }, { percent: 26, text: "清爽解渴" }, { percent: 12, text: "冰太多" }] },
    { id: "d3", name: "芝士奶盖系列", emoji: "🧀", image: "https://images.pexels.com/photos/8108042/pexels-photo-8108042.jpeg", rating: 4.7, reviewCount: 1200, sentiments: [{ percent: 65, text: "奶盖绵密" }, { percent: 23, text: "咸甜平衡" }, { percent: 12, text: "热量高" }] },
    { id: "d4", name: "手冲单品咖啡", emoji: "☕", image: "https://images.pexels.com/photos/29514833/pexels-photo-29514833.jpeg", rating: 4.8, reviewCount: 560, sentiments: [{ percent: 72, text: "花香明显" }, { percent: 18, text: "酸度干净" }, { percent: 10, text: "苦涩重" }] },
    { id: "d5", name: "冰沙/星冰乐类", emoji: "🍶", image: "https://images.pexels.com/photos/7490494/pexels-photo-7490494.jpeg", rating: 4.6, reviewCount: 890, sentiments: [{ percent: 64, text: "冰沙细腻" }, { percent: 24, text: "夏天救星" }, { percent: 12, text: "化太快" }] },
    { id: "d6", name: "法式可颂", emoji: "🥐", image: "https://images.pexels.com/photos/27219789/pexels-photo-27219789.jpeg", rating: 4.7, reviewCount: 420, sentiments: [{ percent: 68, text: "酥到掉渣" }, { percent: 22, text: "黄油香足" }, { percent: 10, text: "偏油" }] },
    { id: "d7", name: "提拉米苏", emoji: "🍰", image: "https://images.pexels.com/photos/29269189/pexels-photo-29269189.jpeg", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 62, text: "咖啡酒香平衡" }, { percent: 26, text: "层次丰富" }, { percent: 12, text: "偏苦" }] },
    { id: "d8", name: "杨枝甘露", emoji: "🥭", image: "https://images.pexels.com/photos/10950869/pexels-photo-10950869.jpeg", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 68, text: "芒果甜西米Q" }, { percent: 22, text: "椰奶香" }, { percent: 10, text: "西柚苦" }] },
    { id: "d9", name: "葡式蛋挞", emoji: "🥘", image: "https://images.pexels.com/photos/8108045/pexels-photo-8108045.jpeg", rating: 4.8, reviewCount: 860, sentiments: [{ percent: 72, text: "挞液嫩滑" }, { percent: 18, text: "挞皮酥脆" }, { percent: 10, text: "两个起点" }] },
    { id: "d10", name: "抹茶系列", emoji: "🏵", image: "https://images.pexels.com/photos/16446206/pexels-photo-16446206.jpeg", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 58, text: "抹茶苦香" }, { percent: 28, text: "不太甜" }, { percent: 14, text: "苦涩重" }] },
    { id: "d11", name: "气泡水/苏打", emoji: "🍻", image: "https://images.pexels.com/photos/33312313/pexels-photo-33312313.jpeg", rating: 4.3, reviewCount: 340, sentiments: [{ percent: 56, text: "清爽解暑" }, { percent: 28, text: "颜值高" }, { percent: 16, text: "气跑快" }] },
    { id: "d12", name: "柠檬茶/鸭屎香", emoji: "🍋", image: "https://images.pexels.com/photos/4518672/pexels-photo-4518672.jpeg", rating: 4.5, reviewCount: 480, sentiments: [{ percent: 62, text: "柠檬清香" }, { percent: 26, text: "解腻" }, { percent: 12, text: "冰太少" }] }
  ],
  seafood: [
    { id: "s1", name: "清蒸海鲜大咖", emoji: "🦑", image: "https://images.pexels.com/photos/36680510/pexels-photo-36680510.jpeg", rating: 4.8, reviewCount: 450, sentiments: [{ percent: 74, text: "食材鲜活" }, { percent: 18, text: "保留原味" }, { percent: 8, text: "蘸料一般" }] },
    { id: "s2", name: "蒜蓉粉丝蒸扇贝", emoji: "🐚", image: "https://images.pexels.com/photos/34870559/pexels-photo-34870559.jpeg", rating: 4.7, reviewCount: 380, sentiments: [{ percent: 66, text: "蒜香味浓" }, { percent: 24, text: "扇贝肉大" }, { percent: 10, text: "粉丝偏少" }] },
    { id: "s3", name: "椒盐皮皮虾", emoji: "🦞", image: "https://images.pexels.com/photos/4747451/pexels-photo-4747451.jpeg", rating: 4.8, reviewCount: 320, sentiments: [{ percent: 70, text: "外壳酥脆" }, { percent: 22, text: "虾黄满满" }, { percent: 8, text: "剥着费劲" }] },
    { id: "s4", name: "避风塘炒蟹", emoji: "🦀", image: "https://images.pexels.com/photos/12552691/pexels-photo-12552691.jpeg", rating: 4.7, reviewCount: 260, sentiments: [{ percent: 64, text: "蒜香酥脆" }, { percent: 26, text: "蟹肉饱满" }, { percent: 10, text: "偏咸" }] },
    { id: "s5", name: "白灼基围虾", emoji: "🦞", image: "https://images.pexels.com/photos/7703365/pexels-photo-7703365.jpeg", rating: 4.6, reviewCount: 290, sentiments: [{ percent: 68, text: "鲜甜弹牙" }, { percent: 22, text: "蘸酱油绝配" }, { percent: 10, text: "个头不一" }] },
    { id: "s6", name: "椒盐鱿鱼", emoji: "🦑", image: "https://images.pexels.com/photos/14837864/pexels-photo-14837864.jpeg", rating: 4.5, reviewCount: 220, sentiments: [{ percent: 60, text: "外脆里嫩" }, { percent: 28, text: "椒盐香" }, { percent: 12, text: "咬不动" }] },
    { id: "s7", name: "海鲜粥", emoji: "🍳", image: "https://images.pexels.com/photos/18848769/pexels-photo-18848769.jpeg", rating: 4.6, reviewCount: 180, sentiments: [{ percent: 64, text: "暖胃鲜甜" }, { percent: 24, text: "料足" }, { percent: 12, text: "熬制久" }] },
    { id: "s8", name: "香辣蟹", emoji: "🦀", image: "https://images.pexels.com/photos/34027185/pexels-photo-34027185.jpeg", rating: 4.7, reviewCount: 310, sentiments: [{ percent: 66, text: "香辣入味" }, { percent: 22, text: "蟹黄多" }, { percent: 12, text: "壳太硬" }] }
  ],
  other: [
    { id: "o1", name: "招牌炒饭", emoji: "🍙", image: "https://images.pexels.com/photos/30882976/pexels-photo-30882976.jpeg", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 58, text: "锅气十足" }, { percent: 28, text: "粒粒分明" }, { percent: 14, text: "配料少" }] },
    { id: "o2", name: "家常豆腐", emoji: "🫕", image: "https://images.pexels.com/photos/10672908/pexels-photo-10672908.jpeg", rating: 4.3, reviewCount: 180, sentiments: [{ percent: 56, text: "下饭神器" }, { percent: 28, text: "外焦里嫩" }, { percent: 16, text: "口味家常" }] },
    { id: "o3", name: "时令时蔬", emoji: "🥬", image: "https://images.pexels.com/photos/36054292/pexels-photo-36054292.jpeg", rating: 4.2, reviewCount: 150, sentiments: [{ percent: 54, text: "清爽解腻" }, { percent: 30, text: "新鲜" }, { percent: 16, text: "火候过" }] },
    { id: "o4", name: "例汤", emoji: "🍳", image: "https://images.pexels.com/photos/16266742/pexels-photo-16266742.jpeg", rating: 4.4, reviewCount: 210, sentiments: [{ percent: 58, text: "暖胃舒服" }, { percent: 26, text: "清淡" }, { percent: 16, text: "没什么料" }] },
    { id: "o5", name: "手工包子", emoji: "🥟", image: "https://images.pexels.com/photos/4518665/pexels-photo-4518665.jpeg", rating: 4.6, reviewCount: 260, sentiments: [{ percent: 62, text: "皮薄馅大" }, { percent: 26, text: "现包热乎" }, { percent: 12, text: "排队久" }] },
    { id: "o6", name: "煎饺/锅贴", emoji: "🥟", image: "https://images.pexels.com/photos/8108050/pexels-photo-8108050.jpeg", rating: 4.5, reviewCount: 230, sentiments: [{ percent: 60, text: "底脆馅香" }, { percent: 28, text: "蘸醋一绝" }, { percent: 12, text: "油大" }] }
  ],
};



export const BRAND_DB: Array<{ keywords: string[]; emoji: string; color: string; category: Category }> = [
  { keywords: ["海底捞"], emoji: "🍲", color: "#DC2626", category: "hotpot" },
  { keywords: ["凑凑", "巴奴", "捞王", "捞锅", "麻辣", "火锅", "打边炉", "川味观", "小龙坎"], emoji: "🍲", color: "#E63946", category: "hotpot" },
  { keywords: ["星巴克", "starbucks"], emoji: "☕", color: "#00704A", category: "dessert" },
  { keywords: ["瑞幸", "luckin"], emoji: "☕", color: "#0022AB", category: "dessert" },
  { keywords: ["喜茶", "heytea"], emoji: "🧋", color: "#111111", category: "dessert" },
  { keywords: ["奈雪", "nayuki"], emoji: "🍵", color: "#86C232", category: "dessert" },
  { keywords: ["茶瀑布", "霸王茶姬", "茶百道", "古茗", "沪上阿姨", "蜜雪冰城", "一点点", "coco", "书亦烧仙草", "益禾堂"], emoji: "🧋", color: "#92400E", category: "dessert" },
  { keywords: ["野茶花", "茶颜悦色"], emoji: "🍵", color: "#16A34A", category: "dessert" },
  { keywords: ["满记", "DQ", "哈根达斯", "好利来"], emoji: "🍰", color: "#DB2777", category: "dessert" },
  { keywords: ["麦当劳", "mcdonald"], emoji: "🍔", color: "#FFC72C", category: "western" },
  { keywords: ["肯德基", "kfc"], emoji: "🍗", color: "#A3080C", category: "western" },
  { keywords: ["必胜客", "pizza hut"], emoji: "🍕", color: "#CE0E2D", category: "western" },
  { keywords: ["汉堡王", "burger king"], emoji: "🍔", color: "#EC1C24", category: "western" },
  { keywords: ["乐凯撒", "pizza"], emoji: "🍕", color: "#F68B1F", category: "western" },
  { keywords: ["达美乐", "domino"], emoji: "🍕", color: "#006491", category: "western" },
  { keywords: ["萨莉亚"], emoji: "🍝", color: "#2A9D8F", category: "western" },
  { keywords: ["寿司", "sushi", "日料", "omakase", "鳗鱼"], emoji: "🍣", color: "#B45309", category: "asian" },
  { keywords: ["韩式", "韩国", "korean", "炸鸡", "烤肉店"], emoji: "🍗", color: "#15803D", category: "asian" },
  { keywords: ["拉面", "兰州", "和府", "遇见小面", "陈记", "面馆", "面道"], emoji: "🍜", color: "#16A34A", category: "fastfood" },
  { keywords: ["米粉", "螺蛳粉", "过桥米线", "沙县"], emoji: "🍜", color: "#059669", category: "fastfood" },
  { keywords: ["黄焖鸡", "快餐", "盖浇饭"], emoji: "🍛", color: "#CA8A04", category: "fastfood" },
  { keywords: ["烧烤", "烤串", "bbq", "木屋烧烤"], emoji: "🔥", color: "#EA580C", category: "bbq" },
  { keywords: ["烤肉", "韩式烤肉", "日式烧肉"], emoji: "🥩", color: "#9A3412", category: "bbq" },
  { keywords: ["本帮菜", "外婆家", "绿茶", "新白鹿", "桂满陇", "杭帮菜", "苏小柳"], emoji: "🥢", color: "#7C3AED", category: "chinese" },
  { keywords: ["川菜", "湘菜", "川味", "湘味", "辣子"], emoji: "🌶️", color: "#DC2626", category: "chinese" },
  { keywords: ["粤菜", "粤式", "早茶", "点心", "陶陶居"], emoji: "🥟", color: "#EA580C", category: "chinese" },
  { keywords: ["东北菜", "饺子馆"], emoji: "🥟", color: "#65A30D", category: "chinese" },
  { keywords: ["海鲜", "大排档", "生蚝", "龙虾", "螃蟹", "蒸汽海鲜"], emoji: "🦐", color: "#0369A1", category: "seafood" },
];

export const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2) + 10;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
}).slice(0, 24); // 10:00 – 21:30

export const USERS = [
  { id: "a", name: "小美", color: "#BF4E2A" },
  { id: "b", name: "阿帅", color: "#2563EB" },
  { id: "c", name: "阿豪", color: "#16A34A" },
];

export const PIE_COLORS = ["#BF4E2A", "#E8963C", "#7DC88A", "#6B8FD9", "#A78BFA", "#FB7185"];

export const SEED: Place[] = [
  {
    id: "1", name: "海底捞火锅",
    image: "",
    stars: 5, category: "hotpot", mood: "must",
    plannedMenu: "番茄锅底 · 毛肚 · 鸭肠 · 虾滑 · 牛肉卷",
    visits: [
      { id: "1-1", date: "周六", time: "18:00", checkedIn: true,  spending: "340", review: "锅底超鲜！服务也很好，还有变脸表演" },
      { id: "1-2", date: "周三", time: "",       checkedIn: false, spending: "",    review: "" },
    ],
  },
  {
    id: "2", name: "乐禧寿司",
    image: "",
    stars: 4, category: "asian", mood: "excited",
    plannedMenu: "omakase套餐 · 海胆饭团 · 炙烤三文鱼",
    visits: [
      { id: "2-1", date: "周日", time: "12:30", checkedIn: false, spending: "", review: "" },
    ],
  },
  {
    id: "3", name: "陈记拉面馆",
    image: "",
    stars: 4, category: "fastfood", mood: "must",
    plannedMenu: "招牌牛骨拉面 · 叉烧包 · 溏心蛋",
    visits: [
      { id: "3-1", date: "周二", time: "12:00", checkedIn: true, spending: "148", review: "面条Q弹，汤底浓郁，下次还要来！" },
    ],
  },
  {
    id: "4", name: "慢调咖啡",
    image: "",
    stars: 3, category: "dessert", mood: "curious",
    plannedMenu: "手冲耶加 · 草莓拿铁 · 可颂 · 提拉米苏",
    visits: [
      { id: "4-1", date: "周四", time: "15:00", checkedIn: true,  spending: "96", review: "环境很好，适合聊天谈事情，音乐品味不错" },
      { id: "4-2", date: "周日", time: "",       checkedIn: false, spending: "",   review: "" },
    ],
  },
  {
    id: "5", name: "老外婆本帮菜",
    image: "",
    stars: 5, category: "chinese", mood: "excited",
    plannedMenu: "红烧肉 · 腌笃鲜 · 响油鳝糊 · 草头圈子",
    visits: [
      { id: "5-1", date: "周五", time: "19:00", checkedIn: false, spending: "", review: "" },
    ],
  },
];

export const buildSeedCalendar = (): Record<string, string[]> => {
  const slots: Record<string, string[]> = {};
  const mark = (day: string, times: string[], user: string) => {
    times.forEach((t) => {
      const k = `${day}_${t}`;
      slots[k] = [...(slots[k] || []), user];
    });
  };
  mark("周三", ["12:00", "12:30", "13:00", "13:30"], "a");
  mark("周六", ["18:00", "18:30", "19:00", "19:30"], "a");
  mark("周三", ["13:00", "13:30", "14:00", "14:30"], "b");
  mark("周五", ["19:00", "19:30", "20:00", "20:30"], "b");
  mark("周六", ["18:00", "18:30", "19:00", "19:30", "20:00"], "b");
  mark("周五", ["18:00", "18:30", "19:00", "19:30"], "c");
  mark("周六", ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"], "c");
  return slots;
};
