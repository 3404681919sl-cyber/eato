// Restaurant model schema (used for documentation and validation)
export const RestaurantSchema = {
  id: "string (unique)",
  name: "string",
  image: "string (URL or local path)",
  stars: "number (1-5)",
  category: "enum: hotpot|cafe|noodles|sushi|western|bbq|local|other",
  mood: "enum: must|excited|curious|casual",
  plannedMenu: "string",
  visits: "Visit[]",
};

export function createRestaurant(data = {}) {
  return {
    id: data.id || "r" + Date.now(),
    name: data.name || "",
    image: data.image || "",
    stars: data.stars ?? 0,
    category: data.category || "other",
    mood: data.mood || "casual",
    plannedMenu: data.plannedMenu || "",
    visits: data.visits || [],
  };
}
