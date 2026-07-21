/// <reference types="vite/client" />

// 高德 POI 搜索前端封装。
// 1. 优先走后端 /api/poi/search（本地开发有后端时使用）。
// 2. 后端不可用时（如静态部署），若存在 VITE_AMAP_KEY，则浏览器直接调用高德 Web 服务 API。
// 3. 无 Key / 网络错误时返回空数组，调用方自动降级为品牌库/首字色块头像。

export type PoiSuggestion = {
  id: string;
  name: string;
  address: string;
  location: string;
  photo: string | null;
};

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY as string | undefined;

function normalizePhoto(photos: any): string | null {
  if (!photos || !photos.photo || !photos.photo.length) return null;
  const first = photos.photo[0];
  // 高德返回格式: { url: "..." }
  if (first && first.url) return first.url;
  return null;
}

async function searchFromBackend(keyword: string): Promise<PoiSuggestion[] | null> {
  try {
    const resp = await fetch(`/api/poi/search?keyword=${encodeURIComponent(keyword)}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.ok) return null;
    return (data.results || []) as PoiSuggestion[];
  } catch {
    return null;
  }
}

async function searchFromAmap(keyword: string): Promise<PoiSuggestion[]> {
  if (!AMAP_KEY) return [];
  try {
    const url = new URL("https://restapi.amap.com/v3/place/text");
    url.searchParams.set("key", AMAP_KEY);
    url.searchParams.set("keywords", keyword);
    url.searchParams.set("types", "050000");
    url.searchParams.set("offset", "6");
    url.searchParams.set("extensions", "all");
    const resp = await fetch(url.toString());
    if (!resp.ok) return [];
    const data = await resp.json();
    if (data.status !== "1" || !Array.isArray(data.pois)) return [];
    return data.pois.map((p: any) => ({
      id: p.id || String(Math.random()),
      name: p.name,
      address: p.address || "",
      location: p.location || "",
      photo: normalizePhoto(p.photos),
    }));
  } catch {
    return [];
  }
}

export async function searchPOI(keyword: string): Promise<PoiSuggestion[]> {
  const kw = keyword.trim();
  if (kw.length < 2) return [];

  const backend = await searchFromBackend(kw);
  if (backend && backend.length > 0) return backend;

  if (AMAP_KEY) {
    return searchFromAmap(kw);
  }

  return [];
}
