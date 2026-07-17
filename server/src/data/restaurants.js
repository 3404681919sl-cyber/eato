// Mock restaurant data - mirrors src/data/seed.ts for the backend
const restaurants = [
  { id: "r1", name: "海底捞火锅", image: "/brands/haidilao.png", stars: 5, category: "hotpot", mood: "must", plannedMenu: "番茄锅+虾滑+毛肚" },
  { id: "r2", name: "鼎泰丰",     image: "/brands/dintaifung.png", stars: 4, category: "noodles", mood: "excited", plannedMenu: "小笼包+红油抄手" },
  { id: "r3", name: "新荣记",     image: "/brands/xinrongji.png", stars: 5, category: "local", mood: "must", plannedMenu: "家烧黄鱼+台州小吃" },
  { id: "r4", name: "Shake Shack", image: "/brands/shakeshack.png", stars: 3, category: "western", mood: "curious", plannedMenu: "招牌牛肉堡+奶昔" },
  { id: "r5", name: "太二酸菜鱼",  image: "/brands/tai'er.png", stars: 4, category: "local", mood: "excited", plannedMenu: "老坛子酸菜鱼" },
  { id: "r6", name: "星巴克",     image: "/brands/starbucks.png", stars: 3, category: "cafe", mood: "casual", plannedMenu: "拿铁+抹茶星冰乐" },
  { id: "r7", name: "炉端烧",     image: "/brands/luduanshao.png", stars: 4, category: "bbq", mood: "excited", plannedMenu: "和牛串+烤海鲜" },
  { id: "r8", name: "鮨一",       image: "/brands/sushiyi.png", stars: 5, category: "sushi", mood: "must", plannedMenu: "omakase套餐" },
];

export default restaurants;

export function getRestaurantById(id) {
  return restaurants.find((r) => r.id === id) || null;
}

export function searchRestaurants(query) {
  const q = (query || "").toLowerCase();
  if (!q) return restaurants;
  return restaurants.filter((r) => r.name.toLowerCase().includes(q));
}
