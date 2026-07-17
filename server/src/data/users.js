// Mock user data
const users = [
  { id: "u1", name: "小美", color: "#7C3AED", email: "xiaomei@eato.app", avatar: "" },
  { id: "u2", name: "阿帅", color: "#2563EB", email: "ashuai@eato.app", avatar: "" },
  { id: "u3", name: "阿豪", color: "#16A34A", email: "ahao@eato.app", avatar: "" },
];

export default users;

export function getUserById(id) {
  return users.find((u) => u.id === id) || null;
}
