import { Router } from "express";
import users, { getUserById } from "../data/users.js";
import { createUser } from "../models/user.js";

const router = Router();

// GET /api/users
router.get("/", (_req, res) => {
  res.json({ total: users.length, data: users });
});

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// POST /api/users
router.post("/", (req, res) => {
  const u = createUser(req.body);
  users.push(u);
  res.status(201).json(u);
});

export default router;
