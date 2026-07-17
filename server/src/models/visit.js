// Visit model schema
export const VisitSchema = {
  id: "string (unique)",
  date: "string",
  time: "string",
  checkedIn: "boolean",
  spending: "string",
  review: "string",
};

export function createVisit(data = {}) {
  return {
    id: data.id || "v" + Date.now(),
    date: data.date || "",
    time: data.time || "",
    checkedIn: data.checkedIn ?? false,
    spending: data.spending ?? "",
    review: data.review ?? "",
  };
}
