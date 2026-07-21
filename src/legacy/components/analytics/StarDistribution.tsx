import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Place } from "../../types";

const STAR_COLORS = ["#9CA3AF", "#D1D5DB", "#FCD34D", "#F59E0B", "#D97706"];

export default function StarDistribution({ places }: { places: Place[] }) {
  const data = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    places.forEach((p) => {
      if (p.stars >= 1 && p.stars <= 5) counts[p.stars - 1]++;
    });
    return counts.map((c, i) => ({
      name: `${i + 1} 星`,
      value: c,
      color: STAR_COLORS[i],
    }));
  }, [places]);

  if (data.every((d) => d.value === 0)) return null;

  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">⭐ 评分分布</h3>
      <p className="text-xs text-muted-foreground mb-4">餐厅星级统计</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={32} margin={{ left: 0, right: 20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{
            borderRadius: "12px", border: "1px solid rgba(150,100,50,0.16)", fontSize: "12px", backgroundColor: "#FFFCF6",
          }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
