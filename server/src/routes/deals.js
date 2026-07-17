import { Router } from "express";
import { generateDeals } from "../services/deals.js";
import { PLATFORM_CONFIG } from "../config/platforms.js";

const router = Router();

// GET /api/deals?place=海底捞火锅&category=hotpot
router.get("/", (req, res) => {
  const { place, category } = req.query;
  if (!place || !category) {
    return res.status(400).json({ error: "Missing required params: place, category" });
  }
  const result = generateDeals(category, place);
  res.json(result);
});

// GET /api/deals/platforms - list all platforms
router.get("/platforms", (_req, res) => {
  res.json(
    Object.entries(PLATFORM_CONFIG).map(([key, val]) => ({
      id: key,
      name: val.name,
      color: val.color,
      searchUrl: val.searchUrl,
    }))
  );
});

export default router;
