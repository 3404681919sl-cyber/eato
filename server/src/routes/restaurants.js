import { Router } from "express";
import restaurants, { getRestaurantById, searchRestaurants } from "../data/restaurants.js";
import { createRestaurant } from "../models/restaurant.js";

const router = Router();

// GET /api/restaurants - list all, optional ?q=search
router.get("/", (req, res) => {
  const { q } = req.query;
  const result = q ? searchRestaurants(q) : restaurants;
  res.json({ total: result.length, data: result });
});

// GET /api/restaurants/:id
router.get("/:id", (req, res) => {
  const restaurant = getRestaurantById(req.params.id);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
  res.json(restaurant);
});

// POST /api/restaurants - create a new restaurant
router.post("/", (req, res) => {
  const r = createRestaurant(req.body);
  restaurants.push(r);
  res.status(201).json(r);
});

// PATCH /api/restaurants/:id
router.patch("/:id", (req, res) => {
  const idx = restaurants.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Restaurant not found" });
  restaurants[idx] = { ...restaurants[idx], ...req.body, id: restaurants[idx].id };
  res.json(restaurants[idx]);
});

// DELETE /api/restaurants/:id
router.delete("/:id", (req, res) => {
  const idx = restaurants.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Restaurant not found" });
  restaurants.splice(idx, 1);
  res.json({ success: true });
});

export default router;
