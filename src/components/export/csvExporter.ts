import type { Place } from "../../types";

/** Convert places data to CSV string */
export function placesToCSV(places: Place[]): string {
  const headers = ["餐厅名称","评分","分类","心情","已点菜单","打卡日期","打卡时间","已打卡","花费","评价"];
  const rows = places.flatMap((p) =>
    p.visits.length > 0
      ? p.visits.map((v) => [
          p.name,
          p.stars,
          p.category,
          p.mood,
          p.plannedMenu,
          v.date,
          v.time,
          v.checkedIn ? "是" : "否",
          v.spending || "",
          v.review || "",
        ])
      : [[p.name, p.stars, p.category, p.mood, p.plannedMenu, "", "", "否", "", ""]]
  );

  const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  return csv;
}

/** Trigger a CSV file download */
export function downloadCSV(data: string, filename: string): void {
  const bom = "\uFEFF"; // BOM for Excel Chinese compatibility
  const blob = new Blob([bom + data], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
