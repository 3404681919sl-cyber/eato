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
  const BASE: Record<Category, number> = {
    hotpot: 158, chinese: 98, fastfood: 58, asian: 128, western: 248, bbq: 128, dessert: 72, seafood: 188, other: 88,
  };
  const base = BASE[category];
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

  const bestDeal = deals.find((d) => d.isBest)!;
  const stackSuggestion = `当前最低价为 ${PLATFORMS[bestDeal.platform].name}（¥${bestDeal.price}），可直接购买。`;

  return { deals, bestStack: stackSuggestion, saving: Math.round(base - minP), finalPrice: minP };
}

export const DISH_DB: Record<Category, Dish[]> = {
  hotpot: [
    { id: "h1", name: "番茄锅底", emoji: "🍅", image: "https://image.pollinations.ai/prompt/tomato%20hotpot%20soup%20base%20red%20broth%20chinese%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=156114&nologo=true&model=flux", rating: 4.8, reviewCount: 1243, sentiments: [{ percent: 72, text: "酸甜浓郁" }, { percent: 18, text: "开胃解腻" }, { percent: 10, text: "汤底偏淡" }] },
    { id: "h2", name: "麻辣牛油锅底", emoji: "🌶️", image: "https://image.pollinations.ai/prompt/spicy%20sichuan%20mala%20beef%20tallow%20hotpot%20broth%20red%20chili%20oil%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=540160&nologo=true&model=flux", rating: 4.7, reviewCount: 982, sentiments: [{ percent: 68, text: "够辣够香" }, { percent: 20, text: "越煮越有味" }, { percent: 12, text: "偏油" }] },
    { id: "h3", name: "鲜毛肚", emoji: "🥩", image: "https://image.pollinations.ai/prompt/fresh%20beef%20tripe%20hotpot%20slice%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=766460&nologo=true&model=flux", rating: 4.9, reviewCount: 1560, sentiments: [{ percent: 81, text: "脆嫩弹牙" }, { percent: 12, text: "新鲜" }, { percent: 7, text: "分量少" }] },
    { id: "h4", name: "鸭肠", emoji: "🦆", image: "https://image.pollinations.ai/prompt/duck%20intestine%20hotpot%20slice%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=328587&nologo=true&model=flux", rating: 4.6, reviewCount: 640, sentiments: [{ percent: 65, text: "爽脆无腥" }, { percent: 22, text: "处理干净" }, { percent: 13, text: "涮久了老" }] },
    { id: "h5", name: "手工虾滑", emoji: "🦞", image: "https://image.pollinations.ai/prompt/handmade%20shrimp%20paste%20ball%20hotpot%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=650967&nologo=true&model=flux", rating: 4.8, reviewCount: 1120, sentiments: [{ percent: 76, text: "Q弹有虾肉" }, { percent: 16, text: "真材实料" }, { percent: 8, text: "偏淀粉感" }] },
    { id: "h6", name: "肥牛卷", emoji: "🥪", image: "https://image.pollinations.ai/prompt/sliced%20beef%20roll%20hotpot%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=840607&nologo=true&model=flux", rating: 4.5, reviewCount: 880, sentiments: [{ percent: 58, text: "肥瘦适中" }, { percent: 25, text: "嫩不柴" }, { percent: 17, text: "薄厚不一" }] },
    { id: "h7", name: "现炸酥肉", emoji: "🥯", image: "https://image.pollinations.ai/prompt/crispy%20fried%20pork%20strips%20sichuan%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=465111&nologo=true&model=flux", rating: 4.7, reviewCount: 760, sentiments: [{ percent: 70, text: "外酥里嫩" }, { percent: 18, text: "直接吃更好吃" }, { percent: 12, text: "略咸" }] },
    { id: "h8", name: "宽粉/红薯粉", emoji: "🍜", image: "https://image.pollinations.ai/prompt/sweet%20potato%20glass%20noodles%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=460112&nologo=true&model=flux", rating: 4.4, reviewCount: 430, sentiments: [{ percent: 62, text: "软糯吸汁" }, { percent: 24, text: "饱腹感强" }, { percent: 14, text: "容易断" }] },
    { id: "h9", name: "午餐肉", emoji: "🥖", image: "https://image.pollinations.ai/prompt/luncheon%20meat%20slice%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=418262&nologo=true&model=flux", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 60, text: "经典味道" }, { percent: 25, text: "厚切满足" }, { percent: 15, text: "偏咸" }] },
    { id: "h10", name: "腐竹皮", emoji: "🫕", image: "https://image.pollinations.ai/prompt/dried%20tofu%20skin%20sticks%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=437291&nologo=true&model=flux", rating: 4.3, reviewCount: 290, sentiments: [{ percent: 58, text: "豆香浓郁" }, { percent: 28, text: "吸满汤汁" }, { percent: 14, text: "易烂" }] },
    { id: "h11", name: "乌鸡卷", emoji: "🐓", image: "https://image.pollinations.ai/prompt/sliced%20black%20chicken%20roll%20hotpot%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=615321&nologo=true&model=flux", rating: 4.6, reviewCount: 380, sentiments: [{ percent: 64, text: "肉质紧实" }, { percent: 22, text: "有嚼劲" }, { percent: 14, text: "略柴" }] },
    { id: "h12", name: "鱼豆腐", emoji: "🐟", image: "https://image.pollinations.ai/prompt/fish%20tofu%20cubes%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=962721&nologo=true&model=flux", rating: 4.4, reviewCount: 310, sentiments: [{ percent: 60, text: "Q弹入味" }, { percent: 26, text: "鱼味浓" }, { percent: 14, text: "淀粉多" }] },
  ],
  chinese: [
    { id: "cn1", name: "红烧肉", emoji: "🐷", image: "https://image.pollinations.ai/prompt/braised%20pork%20belly%20in%20soy%20sauce%20red%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=740076&nologo=true&model=flux", rating: 4.8, reviewCount: 980, sentiments: [{ percent: 75, text: "肥而不腻" }, { percent: 15, text: "入口即化" }, { percent: 10, text: "偏甜口" }] },
    { id: "cn2", name: "糖醋排骨", emoji: "🥯", image: "https://image.pollinations.ai/prompt/sweet%20and%20sour%20pork%20ribs%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=803930&nologo=true&model=flux", rating: 4.7, reviewCount: 720, sentiments: [{ percent: 68, text: "酸甜适口" }, { percent: 22, text: "外焦里嫩" }, { percent: 10, text: "骨头多" }] },
    { id: "cn3", name: "清蒸鲈鱼", emoji: "🐟", image: "https://image.pollinations.ai/prompt/steamed%20sea%20bass%20whole%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=820032&nologo=true&model=flux", rating: 4.8, reviewCount: 540, sentiments: [{ percent: 78, text: "鱼肉鲜嫩" }, { percent: 14, text: "蒸得刚好" }, { percent: 8, text: "刺稍多" }] },
    { id: "cn4", name: "麻婆豆腐", emoji: "🫕", image: "https://image.pollinations.ai/prompt/mapo%20tofu%20spicy%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=401668&nologo=true&model=flux", rating: 4.6, reviewCount: 650, sentiments: [{ percent: 65, text: "麻辣下饭" }, { percent: 23, text: "豆腐嫩" }, { percent: 12, text: "油大" }] },
    { id: "cn5", name: "宫保鸡丁", emoji: "🍗", image: "https://image.pollinations.ai/prompt/kung%20pao%20chicken%20with%20peanuts%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=963537&nologo=true&model=flux", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 58, text: "花生香脆" }, { percent: 28, text: "鸡肉嫩" }, { percent: 14, text: "偏甜" }] },
    { id: "cn6", name: "蒜蓉西兰花", emoji: "🥦", image: "https://image.pollinations.ai/prompt/garlic%20broccoli%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=64398&nologo=true&model=flux", rating: 4.3, reviewCount: 310, sentiments: [{ percent: 60, text: "清爽解腻" }, { percent: 25, text: "火候好" }, { percent: 15, text: "蒜蓉不够" }] },
    { id: "cn7", name: "回锅肉", emoji: "🥩", image: "https://image.pollinations.ai/prompt/twice%20cooked%20pork%20with%20leeks%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=596848&nologo=true&model=flux", rating: 4.7, reviewCount: 620, sentiments: [{ percent: 68, text: "肉片薄而透亮" }, { percent: 20, text: "豆瓣酱香" }, { percent: 12, text: "偏油" }] },
    { id: "cn8", name: "水煮鱼", emoji: "🐟", image: "https://image.pollinations.ai/prompt/boiled%20fish%20in%20spicy%20chili%20oil%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=368734&nologo=true&model=flux", rating: 4.6, reviewCount: 480, sentiments: [{ percent: 64, text: "鱼肉滑嫩" }, { percent: 24, text: "麻辣过瘾" }, { percent: 12, text: "刺太多" }] },
    { id: "cn9", name: "东坡肘子", emoji: "🥩", image: "https://image.pollinations.ai/prompt/dongpo%20pork%20knuckle%20braised%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=459906&nologo=true&model=flux", rating: 4.8, reviewCount: 340, sentiments: [{ percent: 72, text: "软糯脱骨" }, { percent: 18, text: "肥瘦均匀" }, { percent: 10, text: "等太久" }] },
    { id: "cn10", name: "小炒黄牛肉", emoji: "🥪", image: "https://image.pollinations.ai/prompt/stir%20fried%20yellow%20beef%20with%20chili%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=351666&nologo=true&model=flux", rating: 4.5, reviewCount: 420, sentiments: [{ percent: 60, text: "牛肉嫩滑" }, { percent: 28, text: "下饭神器" }, { percent: 12, text: "辣椒太多" }] },
    { id: "cn11", name: "酸菜鱼", emoji: "🐟", image: "https://image.pollinations.ai/prompt/boiled%20fish%20with%20pickled%20cabbage%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=968864&nologo=true&model=flux", rating: 4.7, reviewCount: 560, sentiments: [{ percent: 68, text: "酸爽开胃" }, { percent: 22, text: "鱼片无刺" }, { percent: 10, text: "汤不够酸" }] },
    { id: "cn12", name: "腌笃鲜", emoji: "🌽", image: "https://image.pollinations.ai/prompt/chinese%20cured%20pork%20and%20bamboo%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=145942&nologo=true&model=flux", rating: 4.6, reviewCount: 280, sentiments: [{ percent: 66, text: "汤白味鲜" }, { percent: 22, text: "春笋很嫩" }, { percent: 12, text: "季节限定" }] },
  ],
  fastfood: [
    { id: "f1", name: "招牌牛骨拉面", emoji: "🍜", image: "https://image.pollinations.ai/prompt/beef%20bone%20ramen%20noodle%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=720285&nologo=true&model=flux", rating: 4.7, reviewCount: 920, sentiments: [{ percent: 70, text: "汤头浓郁" }, { percent: 18, text: "面条劲道" }, { percent: 12, text: "牛肉块少" }] },
    { id: "f2", name: "广式叉烧包", emoji: "🥩", image: "https://image.pollinations.ai/prompt/cantonese%20bbq%20pork%20bun%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=424910&nologo=true&model=flux", rating: 4.5, reviewCount: 440, sentiments: [{ percent: 62, text: "馅料足" }, { percent: 26, text: "皮松软" }, { percent: 12, text: "微甜" }] },
    { id: "f3", name: "日式溏心蛋", emoji: "🥚", image: "https://image.pollinations.ai/prompt/jammy%20soft%20boiled%20egg%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=694548&nologo=true&model=flux", rating: 4.8, reviewCount: 670, sentiments: [{ percent: 82, text: "流心完美" }, { percent: 13, text: "拌面一绝" }, { percent: 5, text: "个别没流心" }] },
    { id: "f4", name: "红油抄手", emoji: "🥩", image: "https://image.pollinations.ai/prompt/spicy%20wontons%20in%20chili%20oil%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=708169&nologo=true&model=flux", rating: 4.6, reviewCount: 380, sentiments: [{ percent: 66, text: "皮薄馅大" }, { percent: 22, text: "红油香" }, { percent: 12, text: "辣度偏高" }] },
    { id: "f5", name: "四川担担面", emoji: "🍝", image: "https://image.pollinations.ai/prompt/sichuan%20dan%20dan%20noodles%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=820760&nologo=true&model=flux", rating: 4.5, reviewCount: 510, sentiments: [{ percent: 58, text: "麻酱香浓" }, { percent: 28, text: "辣度适中" }, { percent: 14, text: "量不大" }] },
    { id: "f6", name: "老北京炸酱面", emoji: "🍜", image: "https://image.pollinations.ai/prompt/beijing%20zhajiangmian%20noodles%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=205121&nologo=true&model=flux", rating: 4.4, reviewCount: 290, sentiments: [{ percent: 55, text: "酱给得足" }, { percent: 30, text: "菜码丰富" }, { percent: 15, text: "偏咸" }] },
    { id: "f7", name: "小笼包", emoji: "🥟", image: "https://image.pollinations.ai/prompt/soup%20dumplings%20xiaolongbao%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=365858&nologo=true&model=flux", rating: 4.7, reviewCount: 530, sentiments: [{ percent: 70, text: "皮薄汤汁多" }, { percent: 18, text: "肉馅鲜美" }, { percent: 12, text: "烫嘴" }] },
    { id: "f8", name: "兰州牛肉面", emoji: "🍜", image: "https://image.pollinations.ai/prompt/lanzhou%20beef%20noodle%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=254406&nologo=true&model=flux", rating: 4.6, reviewCount: 750, sentiments: [{ percent: 65, text: "一清二白三红四绿" }, { percent: 22, text: "拉面筋道" }, { percent: 13, text: "萝卜片少" }] },
    { id: "f9", name: "生煎包", emoji: "🥩", image: "https://image.pollinations.ai/prompt/pan%20fried%20pork%20buns%20shengjian%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=346956&nologo=true&model=flux", rating: 4.7, reviewCount: 480, sentiments: [{ percent: 68, text: "底脆" }, { percent: 20, text: "肉汁丰富" }, { percent: 12, text: "芝麻不匀" }] },
    { id: "f10", name: "馄饨/云吞", emoji: "🥟", image: "https://image.pollinations.ai/prompt/wonton%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=852235&nologo=true&model=flux", rating: 4.5, reviewCount: 360, sentiments: [{ percent: 62, text: "皮滑馅嫩" }, { percent: 26, text: "汤底鲜" }, { percent: 12, text: "紫菜虾皮少" }] },
    { id: "f11", name: "烧麦", emoji: "🥘", image: "https://image.pollinations.ai/prompt/shaomai%20rice%20dumpling%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=916109&nologo=true&model=flux", rating: 4.4, reviewCount: 270, sentiments: [{ percent: 58, text: "糯米软糯" }, { percent: 28, text: "猪肉香" }, { percent: 14, text: "个头小" }] },
    { id: "f12", name: "肠粉", emoji: "🥙", image: "https://image.pollinations.ai/prompt/rice%20noodle%20rolls%20cheung%20fun%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=437221&nologo=true&model=flux", rating: 4.6, reviewCount: 420, sentiments: [{ percent: 64, text: "晶莹剔透" }, { percent: 24, text: "酱汁香" }, { percent: 12, text: "容易破" }] },
  ],
  asian: [
    { id: "a1", name: "三文鱼厚切刺身", emoji: "🍣", image: "https://image.pollinations.ai/prompt/thick%20cut%20salmon%20sashimi%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=614601&nologo=true&model=flux", rating: 4.9, reviewCount: 890, sentiments: [{ percent: 80, text: "新鲜肥美" }, { percent: 14, text: "厚切满足" }, { percent: 6, text: "价格贵" }] },
    { id: "a2", name: "炙烤三文鱼寿司", emoji: "🍣", image: "https://image.pollinations.ai/prompt/torch%20seared%20salmon%20sushi%20nigiri%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=587801&nologo=true&model=flux", rating: 4.8, reviewCount: 720, sentiments: [{ percent: 72, text: "焦糖香" }, { percent: 20, text: "米粒饱满" }, { percent: 8, text: "个头小" }] },
    { id: "a3", name: "天妇罗拼盘", emoji: "🍤", image: "https://image.pollinations.ai/prompt/tempura%20platter%20shrimp%20vegetable%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=37771&nologo=true&model=flux", rating: 4.6, reviewCount: 410, sentiments: [{ percent: 64, text: "酥脆不油" }, { percent: 24, text: "面衣轻薄" }, { percent: 12, text: "凉了软" }] },
    { id: "a4", name: "日式炸鸡", emoji: "🍗", image: "https://image.pollinations.ai/prompt/japanese%20fried%20chicken%20karaage%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=20037&nologo=true&model=flux", rating: 4.7, reviewCount: 560, sentiments: [{ percent: 68, text: "外脆里嫩多汁" }, { percent: 22, text: "腌料入味" }, { percent: 10, text: "份量一般" }] },
    { id: "a5", name: "韩式石锅拌饭", emoji: "🍚", image: "https://image.pollinations.ai/prompt/korean%20stone%20pot%20bibimbap%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=176720&nologo=true&model=flux", rating: 4.5, reviewCount: 430, sentiments: [{ percent: 58, text: "锅巴香脆" }, { percent: 28, text: "配菜丰富" }, { percent: 14, text: "酱偏咸" }] },
    { id: "a6", name: "豚骨拉面", emoji: "🍜", image: "https://image.pollinations.ai/prompt/tonkotsu%20pork%20bone%20ramen%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=15535&nologo=true&model=flux", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 71, text: "汤底浓郁" }, { percent: 18, text: "叉烧厚实" }, { percent: 11, text: "面偏硬" }] },
    { id: "a7", name: "鳗鱼饭", emoji: "🐛", image: "https://image.pollinations.ai/prompt/unagi%20eel%20rice%20bowl%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=240971&nologo=true&model=flux", rating: 4.8, reviewCount: 450, sentiments: [{ percent: 74, text: "鳗鱼软嫩" }, { percent: 18, text: "酱汁甜咸适口" }, { percent: 8, text: "分量少" }] },
    { id: "a8", name: "寿喜烧", emoji: "🍽", image: "https://image.pollinations.ai/prompt/sukiyaki%20beef%20hotpot%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=452993&nologo=true&model=flux", rating: 4.7, reviewCount: 380, sentiments: [{ percent: 68, text: "汤汁甘甜" }, { percent: 22, text: "和牛入口即化" }, { percent: 10, text: "蘸蛋液太淡" }] },
    { id: "a9", name: "泡菜饼", emoji: "🥩", image: "https://image.pollinations.ai/prompt/korean%20kimchi%20pancake%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=541357&nologo=true&model=flux", rating: 4.4, reviewCount: 260, sentiments: [{ percent: 60, text: "酸辣开胃" }, { percent: 26, text: "外酥里嫩" }, { percent: 14, text: "油大" }] },
    { id: "a10", name: "海胆饭团", emoji: "🐚", image: "https://image.pollinations.ai/prompt/sea%20urchin%20onigiri%20rice%20ball%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=818919&nologo=true&model=flux", rating: 4.7, reviewCount: 340, sentiments: [{ percent: 70, text: "海胆鲜甜" }, { percent: 18, text: "饭温热刚好" }, { percent: 12, text: "量小贵" }] },
    { id: "a11", name: "味噌汤", emoji: "🍳", image: "https://image.pollinations.ai/prompt/miso%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=38794&nologo=true&model=flux", rating: 4.3, reviewCount: 210, sentiments: [{ percent: 56, text: "暖呼呼" }, { percent: 28, text: "收尾刚好" }, { percent: 16, text: "普通" }] },
    { id: "a12", name: "韩式炸鸡(甜辣)", emoji: "🍗", image: "https://image.pollinations.ai/prompt/korean%20fried%20chicken%20sweet%20spicy%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=538902&nologo=true&model=flux", rating: 4.6, reviewCount: 520, sentiments: [{ percent: 66, text: "甜辣绝配" }, { percent: 22, text: "外皮酥脆" }, { percent: 12, text: "吃多腻" }] },
  ],
  western: [
    { id: "w1", name: "经典牛肉汉堡", emoji: "🍔", image: "https://image.pollinations.ai/prompt/classic%20beef%20burger%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=48371&nologo=true&model=flux", rating: 4.7, reviewCount: 880, sentiments: [{ percent: 68, text: "肉饼多汁" }, { percent: 20, text: "面包松软" }, { percent: 12, text: "酱料普通" }] },
    { id: "w2", name: "薯条", emoji: "🍟", image: "https://image.pollinations.ai/prompt/french%20fries%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=546280&nologo=true&model=flux", rating: 4.5, reviewCount: 1200, sentiments: [{ percent: 72, text: "现炸酥脆" }, { percent: 18, text: "盐度刚好" }, { percent: 10, text: "易软塌" }] },
    { id: "w3", name: "意式肉酱面", emoji: "🍝", image: "https://image.pollinations.ai/prompt/spaghetti%20bolognese%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=790190&nologo=true&model=flux", rating: 4.6, reviewCount: 670, sentiments: [{ percent: 62, text: "肉酱挂面" }, { percent: 26, text: "面条劲道" }, { percent: 12, text: "偏酸" }] },
    { id: "w4", name: "烤鸡翅(BBQ)", emoji: "🍗", image: "https://image.pollinations.ai/prompt/bbq%20chicken%20wings%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=741536&nologo=true&model=flux", rating: 4.7, reviewCount: 920, sentiments: [{ percent: 66, text: "外皮焦脆" }, { percent: 24, text: "腌料入味" }, { percent: 10, text: "肉质偏干" }] },
    { id: "w5", name: "凯撒沙拉", emoji: "🥗", image: "https://image.pollinations.ai/prompt/caesar%20salad%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=573716&nologo=true&model=flux", rating: 4.4, reviewCount: 340, sentiments: [{ percent: 56, text: "生菜脆" }, { percent: 28, text: "酱汁浓郁" }, { percent: 16, text: "面包丁软" }] },
    { id: "w6", name: "玛格丽特披萨", emoji: "🕕", image: "https://image.pollinations.ai/prompt/margherita%20pizza%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=139397&nologo=true&model=flux", rating: 4.6, reviewCount: 550, sentiments: [{ percent: 64, text: "芝士能拉丝" }, { percent: 22, text: "饼边香脆" }, { percent: 14, text: "馅料分布不均" }] },
    { id: "w7", name: "意式烩饭", emoji: "🍚", image: "https://image.pollinations.ai/prompt/risotto%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=431571&nologo=true&model=flux", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 60, text: "奶香浓郁" }, { percent: 26, text: "蘑菇鲜" }, { percent: 14, text: "偏油腻" }] },
    { id: "w8", name: "奶油蘑菇汤", emoji: "🍲", image: "https://image.pollinations.ai/prompt/cream%20of%20mushroom%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=164618&nologo=true&model=flux", rating: 4.5, reviewCount: 280, sentiments: [{ percent: 62, text: "浓郁顺滑" }, { percent: 24, text: "蘑菇量足" }, { percent: 14, text: "热量高" }] },
    { id: "w9", name: "牛排(西冷)", emoji: "🥩", image: "https://image.pollinations.ai/prompt/grilled%20sirloin%20steak%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=501056&nologo=true&model=flux", rating: 4.8, reviewCount: 540, sentiments: [{ percent: 72, text: "五分熟刚好" }, { percent: 18, text: "肉香足" }, { percent: 10, text: "贵" }] },
    { id: "w10", name: "烤肋排", emoji: "🥩", image: "https://image.pollinations.ai/prompt/grilled%20pork%20ribs%20bbq%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=143501&nologo=true&model=flux", rating: 4.7, reviewCount: 420, sentiments: [{ percent: 68, text: "酱汁香甜" }, { percent: 20, text: "脱骨轻松" }, { percent: 12, text: "偏甜" }] },
    { id: "w11", name: "意式千层面", emoji: "🍝", image: "https://image.pollinations.ai/prompt/lasagna%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=717170&nologo=true&model=flux", rating: 4.6, reviewCount: 350, sentiments: [{ percent: 62, text: "层次分明" }, { percent: 26, text: "肉酱芝士足" }, { percent: 12, text: "量大吃不完" }] },
    { id: "w12", name: "凯撒卷饼", emoji: "🥖", image: "https://image.pollinations.ai/prompt/caesar%20wrap%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=791611&nologo=true&model=flux", rating: 4.4, reviewCount: 230, sentiments: [{ percent: 58, text: "方便拿" }, { percent: 28, text: "鸡肉嫩" }, { percent: 14, text: "酱少" }] },
  ],
  bbq: [
    { id: "b1", name: "羊肉串(红柳)", emoji: "🫑", image: "https://image.pollinations.ai/prompt/lamb%20skewers%20grilled%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=721564&nologo=true&model=flux", rating: 4.8, reviewCount: 1100, sentiments: [{ percent: 74, text: "肥瘦相间" }, { percent: 18, text: "孜然香足" }, { percent: 8, text: "个别偏膻" }] },
    { id: "b2", name: "蒜蓉烤茄子", emoji: "🥦", image: "https://image.pollinations.ai/prompt/grilled%20eggplant%20with%20garlic%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=661545&nologo=true&model=flux", rating: 4.6, reviewCount: 520, sentiments: [{ percent: 68, text: "蒜蓉铺满" }, { percent: 22, text: "软糯入味" }, { percent: 10, text: "火候难均" }] },
    { id: "b3", name: "炭烤生蚝", emoji: "🦪", image: "https://image.pollinations.ai/prompt/charcoal%20grilled%20oyster%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=436073&nologo=true&model=flux", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 70, text: "个大肉肥" }, { percent: 20, text: "蒜香浓郁" }, { percent: 10, text: "个别空壳" }] },
    { id: "b4", name: "烤韭菜", emoji: "🥯", image: "https://image.pollinations.ai/prompt/grilled%20chinese%20chives%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=14545&nologo=true&model=flux", rating: 4.3, reviewCount: 310, sentiments: [{ percent: 60, text: "火候刚好" }, { percent: 28, text: "调味香" }, { percent: 12, text: "塞牙" }] },
    { id: "b5", name: "烤五花肉", emoji: "🥩", image: "https://image.pollinations.ai/prompt/grilled%20pork%20belly%20korean%20bbq%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=842194&nologo=true&model=flux", rating: 4.8, reviewCount: 890, sentiments: [{ percent: 76, text: "滋滋冒油" }, { percent: 16, text: "包生菜绝配" }, { percent: 8, text: "易腻" }] },
    { id: "b6", name: "烤鸡翅中", emoji: "🍗", image: "https://image.pollinations.ai/prompt/grilled%20chicken%20wings%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=70797&nologo=true&model=flux", rating: 4.7, reviewCount: 790, sentiments: [{ percent: 68, text: "外皮焦脆" }, { percent: 22, text: "腌料入味" }, { percent: 10, text: "肉稍干" }] },
    { id: "b7", name: "烤玉米粒", emoji: "🌽", image: "https://image.pollinations.ai/prompt/grilled%20corn%20kernels%20skewer%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=330015&nologo=true&model=flux", rating: 4.5, reviewCount: 380, sentiments: [{ percent: 64, text: "甜香" }, { percent: 24, text: "孜然辣椒香" }, { percent: 12, text: "颗粒少" }] },
    { id: "b8", name: "锡纸花甲粉", emoji: "🐚", image: "https://image.pollinations.ai/prompt/clams%20with%20vermicelli%20in%20foil%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=251705&nologo=true&model=flux", rating: 4.4, reviewCount: 250, sentiments: [{ percent: 58, text: "粉丝吸汁" }, { percent: 28, text: "花甲新鲜" }, { percent: 14, text: "沙子多" }] },
    { id: "b9", name: "烤馒头片", emoji: "🍞", image: "https://image.pollinations.ai/prompt/grilled%20mantou%20bread%20slices%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=9793&nologo=true&model=flux", rating: 4.3, reviewCount: 190, sentiments: [{ percent: 56, text: "酥脆" }, { percent: 28, text: "刷酱好吃" }, { percent: 16, text: "硬" }] },
    { id: "b10", name: "掌中宝", emoji: "🍗", image: "https://image.pollinations.ai/prompt/chicken%20cartilage%20skewer%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=125017&nologo=true&model=flux", rating: 4.6, reviewCount: 420, sentiments: [{ percent: 66, text: "脆脆的" }, { percent: 22, text: "软骨Q弹" }, { percent: 12, text: "小" }] },
  ],
  dessert: [
    { id: "d1", name: "招牌奶茶", emoji: "🍻", image: "https://image.pollinations.ai/prompt/milk%20tea%20with%20pearls%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=685276&nologo=true&model=flux", rating: 4.8, reviewCount: 2100, sentiments: [{ percent: 68, text: "奶香浓郁" }, { percent: 20, text: "茶底清香" }, { percent: 12, text: "偏甜" }] },
    { id: "d2", name: "满杯水果茶", emoji: "🍏", image: "https://image.pollinations.ai/prompt/fruit%20tea%20full%20cup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=129537&nologo=true&model=flux", rating: 4.6, reviewCount: 1500, sentiments: [{ percent: 62, text: "果肉丰富" }, { percent: 26, text: "清爽解渴" }, { percent: 12, text: "冰太多" }] },
    { id: "d3", name: "芝士奶盖系列", emoji: "🧀", image: "https://image.pollinations.ai/prompt/cheese%20foam%20milk%20tea%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=240263&nologo=true&model=flux", rating: 4.7, reviewCount: 1200, sentiments: [{ percent: 65, text: "奶盖绵密" }, { percent: 23, text: "咸甜平衡" }, { percent: 12, text: "热量高" }] },
    { id: "d4", name: "手冲单品咖啡", emoji: "☕️", image: "https://image.pollinations.ai/prompt/pour%20over%20coffee%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=527917&nologo=true&model=flux", rating: 4.8, reviewCount: 560, sentiments: [{ percent: 72, text: "花香明显" }, { percent: 18, text: "酸度干净" }, { percent: 10, text: "苦涩重" }] },
    { id: "d5", name: "冰沙/星冰乐类", emoji: "🍶", image: "https://image.pollinations.ai/prompt/smoothie%20frappuccino%20drink%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=941825&nologo=true&model=flux", rating: 4.6, reviewCount: 890, sentiments: [{ percent: 64, text: "冰沙细腻" }, { percent: 24, text: "夏天救星" }, { percent: 12, text: "化太快" }] },
    { id: "d6", name: "法式可颂", emoji: "🥐", image: "https://image.pollinations.ai/prompt/french%20croissant%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=121468&nologo=true&model=flux", rating: 4.7, reviewCount: 420, sentiments: [{ percent: 68, text: "酥到掉渣" }, { percent: 22, text: "黄油香足" }, { percent: 10, text: "偏油" }] },
    { id: "d7", name: "提拉米苏", emoji: "🍰", image: "https://image.pollinations.ai/prompt/tiramisu%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=617785&nologo=true&model=flux", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 62, text: "咖啡酒香平衡" }, { percent: 26, text: "层次丰富" }, { percent: 12, text: "偏苦" }] },
    { id: "d8", name: "杨枝甘露", emoji: "🥩", image: "https://image.pollinations.ai/prompt/mango%20sago%20pomelo%20dessert%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=340914&nologo=true&model=flux", rating: 4.7, reviewCount: 680, sentiments: [{ percent: 68, text: "芒果甜西米Q" }, { percent: 22, text: "椰奶香" }, { percent: 10, text: "西柚苦" }] },
    { id: "d9", name: "葡式蛋挞", emoji: "🥘", image: "https://image.pollinations.ai/prompt/portuguese%20egg%20tart%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=957738&nologo=true&model=flux", rating: 4.8, reviewCount: 860, sentiments: [{ percent: 72, text: "挞液嫩滑" }, { percent: 18, text: "挞皮酥脆" }, { percent: 10, text: "两个起点" }] },
    { id: "d10", name: "抹茶系列", emoji: "🏵", image: "https://image.pollinations.ai/prompt/matcha%20drink%20dessert%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=991994&nologo=true&model=flux", rating: 4.5, reviewCount: 520, sentiments: [{ percent: 58, text: "抹茶苦香" }, { percent: 28, text: "不太甜" }, { percent: 14, text: "苦涩重" }] },
    { id: "d11", name: "气泡水/苏打", emoji: "🍻", image: "https://image.pollinations.ai/prompt/sparkling%20water%20soda%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=64828&nologo=true&model=flux", rating: 4.3, reviewCount: 340, sentiments: [{ percent: 56, text: "清爽解暑" }, { percent: 28, text: "颜值高" }, { percent: 16, text: "气跑得快" }] },
    { id: "d12", name: "柠檬茶/鸭屎香", emoji: "🍋", image: "https://image.pollinations.ai/prompt/lemon%20tea%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=647909&nologo=true&model=flux", rating: 4.5, reviewCount: 480, sentiments: [{ percent: 62, text: "柠檬清香" }, { percent: 26, text: "解腻" }, { percent: 12, text: "冰太少" }] },
  ],
  seafood: [
    { id: "sea1", name: "清蒸海鲜大咖", emoji: "🦑", image: "https://image.pollinations.ai/prompt/steamed%20seafood%20platter%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=514078&nologo=true&model=flux", rating: 4.8, reviewCount: 450, sentiments: [{ percent: 74, text: "食材鲜活" }, { percent: 18, text: "保留原味" }, { percent: 8, text: "蘸料一般" }] },
    { id: "sea2", name: "蒜蓉粉丝蒸扇贝", emoji: "🐚", image: "https://image.pollinations.ai/prompt/steamed%20scallops%20with%20garlic%20vermicelli%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=606950&nologo=true&model=flux", rating: 4.7, reviewCount: 380, sentiments: [{ percent: 66, text: "蒜香味浓" }, { percent: 24, text: "扇贝肉大" }, { percent: 10, text: "粉丝偏少" }] },
    { id: "sea3", name: "椒盐皮皮虾", emoji: "🦞", image: "https://image.pollinations.ai/prompt/salt%20and%20pepper%20mantis%20shrimp%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=487154&nologo=true&model=flux", rating: 4.8, reviewCount: 320, sentiments: [{ percent: 70, text: "外壳酥脆" }, { percent: 22, text: "虾黄满满" }, { percent: 8, text: "剥着费劲" }] },
    { id: "sea4", name: "避风塘炒蟹", emoji: "🦀", image: "https://image.pollinations.ai/prompt/typhoon%20shelter%20crab%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=390034&nologo=true&model=flux", rating: 4.7, reviewCount: 260, sentiments: [{ percent: 64, text: "蒜香酥脆" }, { percent: 26, text: "蟹肉饱满" }, { percent: 10, text: "偏咸" }] },
    { id: "sea5", name: "白灼基围虾", emoji: "🦞", image: "https://image.pollinations.ai/prompt/boiled%20shrimp%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=774195&nologo=true&model=flux", rating: 4.6, reviewCount: 290, sentiments: [{ percent: 68, text: "鲜甜弹牙" }, { percent: 22, text: "蘸酱油绝配" }, { percent: 10, text: "个头不一" }] },
    { id: "sea6", name: "椒盐鱿鱼", emoji: "🦑", image: "https://image.pollinations.ai/prompt/salt%20and%20pepper%20squid%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=300786&nologo=true&model=flux", rating: 4.5, reviewCount: 220, sentiments: [{ percent: 60, text: "外脆里嫩" }, { percent: 28, text: "椒盐香" }, { percent: 12, text: "咬不动" }] },
    { id: "sea7", name: "海鲜粥", emoji: "🍳", image: "https://image.pollinations.ai/prompt/seafood%20congee%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=358387&nologo=true&model=flux", rating: 4.6, reviewCount: 180, sentiments: [{ percent: 64, text: "暖胃鲜甜" }, { percent: 24, text: "料足" }, { percent: 12, text: "熬制久" }] },
    { id: "sea8", name: "香辣蟹", emoji: "🦀", image: "https://image.pollinations.ai/prompt/spicy%20crab%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=413996&nologo=true&model=flux", rating: 4.7, reviewCount: 310, sentiments: [{ percent: 66, text: "香辣入味" }, { percent: 22, text: "蟹黄多" }, { percent: 12, text: "壳太硬" }] },
  ],
  other: [
    { id: "o1", name: "招牌炒饭", emoji: "🍙", image: "https://image.pollinations.ai/prompt/fried%20rice%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=662936&nologo=true&model=flux", rating: 4.5, reviewCount: 320, sentiments: [{ percent: 58, text: "锅气十足" }, { percent: 28, text: "粒粒分明" }, { percent: 14, text: "配料少" }] },
    { id: "o2", name: "家常豆腐", emoji: "🫕", image: "https://image.pollinations.ai/prompt/home%20style%20tofu%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=791677&nologo=true&model=flux", rating: 4.3, reviewCount: 180, sentiments: [{ percent: 56, text: "下饭神器" }, { percent: 28, text: "外焦里嫩" }, { percent: 16, text: "口味家常" }] },
    { id: "o3", name: "时令时蔬", emoji: "🥯", image: "https://image.pollinations.ai/prompt/seasonal%20green%20vegetables%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=317113&nologo=true&model=flux", rating: 4.2, reviewCount: 150, sentiments: [{ percent: 54, text: "清爽解腻" }, { percent: 30, text: "新鲜" }, { percent: 16, text: "火候过" }] },
    { id: "o4", name: "例汤", emoji: "🍳", image: "https://image.pollinations.ai/prompt/daily%20clear%20soup%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=779330&nologo=true&model=flux", rating: 4.4, reviewCount: 210, sentiments: [{ percent: 58, text: "暖胃舒服" }, { percent: 26, text: "清淡" }, { percent: 16, text: "没什么料" }] },
    { id: "o5", name: "手工包子", emoji: "🥟", image: "https://image.pollinations.ai/prompt/handmade%20baozi%20bun%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=513227&nologo=true&model=flux", rating: 4.6, reviewCount: 260, sentiments: [{ percent: 62, text: "皮薄馅大" }, { percent: 26, text: "现包热乎" }, { percent: 12, text: "排队久" }] },
    { id: "o6", name: "煎饺/锅贴", emoji: "🥟", image: "https://image.pollinations.ai/prompt/pan%20fried%20dumplings%2C%20food%20photography%2C%20top%20view%2C%20appetizing%2C%20professional%20restaurant%20style%2C%20high%20quality?width=400&height=300&seed=875064&nologo=true&model=flux", rating: 4.5, reviewCount: 230, sentiments: [{ percent: 60, text: "底脆馅香" }, { percent: 28, text: "蘸醋一绝" }, { percent: 12, text: "油大" }] },
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
