// User model schema
export const UserSchema = {
  id: "string (unique)",
  name: "string",
  color: "string (hex)",
  email: "string",
  avatar: "string (URL)",
};

export function createUser(data = {}) {
  return {
    id: data.id || "u" + Date.now(),
    name: data.name || "",
    color: data.color || "#7C3AED",
    email: data.email || "",
    avatar: data.avatar || "",
  };
}
