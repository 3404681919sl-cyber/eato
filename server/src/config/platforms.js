// Platform configuration for deal comparison
export const PLATFORM_CONFIG = {
  meituan:  { name: "美团",     color: "#FFCC00", searchUrl: "https://i.meituan.com/awp/h5/search/all/" },
  douyin:   { name: "抖音",     color: "#161823", searchUrl: "https://www.douyin.com/search/" },
  dianping: { name: "大众点评", color: "#FC5531", searchUrl: "https://m.dianping.com/search/keyword/" },
  taobao:   { name: "淘宝闪购", color: "#FF4400", searchUrl: "https://s.taobao.com/search" },
  xianyu:   { name: "闲鱼",     color: "#00B8C8", searchUrl: "https://m.goofish.com/search" },
};

export const CATEGORY_KEYS = ["hotpot","cafe","noodles","sushi","western","bbq","local","other"];

export const CATEGORY_LABELS = {
  hotpot: "火锅", cafe: "咖啡", noodles: "面", sushi: "寿司",
  western: "西餐", bbq: "烧烤", local: "本帮菜", other: "美食",
};

export const CATEGORY_BASE_PRICE = {
  hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
};
