import { Router } from "express";
import restaurants from "../data/restaurants.js";

const router = Router();

// GET /api/analytics/overview - aggregate stats
router.get("/overview", (_req, res) => {
  // Mock analytics data based on restaurant data
  const total = restaurants.length;
  const avgStars = (restaurants.reduce((s, r) => s + r.stars, 0) / total).toFixed(1);
  const byCategory = {};
  restaurants.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });

  res.json({
    totalRestaurants: total,
    avgStars: Number(avgStars),
    byCategory,
    topRated: [...restaurants].sort((a, b) => b.stars - a.stars).slice(0, 5),
    monthlySpending: [
      { month: "四月", spent: 1240 },
      { month: "五月", spent: 1860 },
      { month: "六月", spent: 2130 },
      { month: "七月", spent: Math.round(Math.random() * 1000 + 1500) },
    ],
  });
});

export default router;
