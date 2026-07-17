import { Router } from "express";
import users from "../data/users.js";

// In-memory slots storage (would use DB in production)
let slots = {};

const router = Router();

// GET /api/calendar/slots - get all slots
router.get("/slots", (_req, res) => {
  res.json(slots);
});

// POST /api/calendar/slots/toggle - toggle a user's slot
router.post("/slots/toggle", (req, res) => {
  const { day, time, userId } = req.body;
  if (!day || !time || !userId) {
    return res.status(400).json({ error: "Missing required fields: day, time, userId" });
  }
  const key = `${day}_${time}`;
  const cur = slots[key] || [];
  if (cur.includes(userId)) {
    slots[key] = cur.filter((u) => u !== userId);
  } else {
    slots[key] = [...cur, userId];
  }
  // Clean up empty keys
  if (slots[key].length === 0) delete slots[key];
  res.json({ key, users: slots[key] || [] });
});

// GET /api/calendar/users - get users for calendar
router.get("/users", (_req, res) => {
  res.json(users);
});

export default router;
