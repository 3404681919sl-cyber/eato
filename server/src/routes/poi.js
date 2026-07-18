// POI 搜索代理 —— 接高德 Web 服务 POI 搜索 API，返回餐厅真实照片当头像。
// Key 通过 server/.env 的 AMAP_KEY 注入（个人免费申请：https://developer.amap.com/）。
// 未配置 Key 时返回 ok:false reason:"NO_KEY"，前端自动降级为品牌库/首字色块。
import express from "express";

const router = express.Router();

const AMAP_KEY = process.env.AMAP_KEY || "";

router.get("/search", async (req, res) => {
  const keyword = (req.query.keyword || "").toString().trim();
  if (!keyword) return res.json({ ok: true, results: [] });

  // Key-ready 降级：没有 Key 不影响主流程，只是没有真实店照片
  if (!AMAP_KEY) {
    return res.json({ ok: false, reason: "NO_KEY", results: [] });
  }

  try {
    const url = new URL("https://restapi.amap.com/v3/place/text");
    url.searchParams.set("key", AMAP_KEY);
    url.searchParams.set("keywords", keyword);
    url.searchParams.set("types", "餐饮服务"); // 限定餐饮，返回门头照/logo
    url.searchParams.set("offset", "6");
    url.searchParams.set("citylimit", "true");
    url.searchParams.set("extensions", "base");

    const resp = await fetch(url.toString());
    const data = await resp.json();

    if (data.status !== "1") {
      return res.json({ ok: false, reason: "AMAP_ERROR", message: data.info || "", results: [] });
    }

    const results = (data.pois || []).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address || "",
      location: p.location || "",
      // 高德照片域名为 http，改写为 https 避免生产环境 mixed content 拦截
      photo: p.photos && p.photos[0] ? p.photos[0].url.replace(/^http:/, "https:") : null,
    }));

    res.json({ ok: true, results });
  } catch (e) {
    res.json({ ok: false, reason: "NETWORK_ERROR", message: String(e), results: [] });
  }
});

export default router;
