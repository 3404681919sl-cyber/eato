import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

import dealsRoutes from "./routes/deals.js";
import restaurantsRoutes from "./routes/restaurants.js";
import usersRoutes from "./routes/users.js";
import analyticsRoutes from "./routes/analytics.js";
import calendarRoutes from "./routes/calendar.js";
import poiRoutes from "./routes/poi.js";

// 加载 server/.env（含 AMAP_KEY），找不到也不报错
dotenv.config({ path: new URL("../.env", import.meta.url) });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Global middleware ──
app.use(cors());
app.use(express.json());
app.use(logger);

// ── API Routes ──
app.use("/api/deals", dealsRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/poi", poiRoutes);

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Error handler (must be last) ──
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🛵 Eato API server running on http://localhost:${PORT}`);
  console.log(`📡 APIs:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/deals?place=海底捞&category=hotpot`);
  console.log(`   GET  /api/deals/platforms`);
  console.log(`   GET  /api/restaurants`);
  console.log(`   GET  /api/restaurants/:id`);
  console.log(`   POST /api/restaurants`);
  console.log(`   PATCH /api/restaurants/:id`);
  console.log(`   DELETE /api/restaurants/:id`);
  console.log(`   GET  /api/users`);
  console.log(`   GET  /api/users/:id`);
  console.log(`   POST /api/users`);
  console.log(`   GET  /api/analytics/overview`);
  console.log(`   GET  /api/calendar/slots`);
  console.log(`   POST /api/calendar/slots/toggle`);
  console.log(`   GET  /api/calendar/users`);
  console.log(`   GET  /api/poi/search?keyword=店名   (高德POI, 需 AMAP_KEY)`);
});
