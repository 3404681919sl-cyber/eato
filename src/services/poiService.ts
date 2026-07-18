// 高德 POI 搜索前端封装。Key 由后端 server/.env 持有，前端只调 /api/poi/search。
// 无 Key / 网络错误时返回空数组，调用方自动降级为品牌库/首字色块头像。

export type PoiSuggestion = {
  id: string;
  name: string;
  address: string;
  location: string;
  photo: string | null;
};

export async function searchPOI(keyword: string): Promise<PoiSuggestion[]> {
  const kw = keyword.trim();
  if (kw.length < 2) return [];
  try {
    const resp = await fetch(`/api/poi/search?keyword=${encodeURIComponent(kw)}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    // data.ok === false 表示 NO_KEY / AMAP_ERROR / NETWORK_ERROR，均优雅降级
    if (!data.ok) return [];
    return (data.results || []) as PoiSuggestion[];
  } catch {
    return [];
  }
}
