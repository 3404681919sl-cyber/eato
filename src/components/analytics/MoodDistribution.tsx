import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Place } from "../../types";
import { MOOD } from "../../constants";

const MOOD_ORDER = ["must", "excited", "curious", "casual"] as const;

export default function MoodDistribution({ places }: { places: Place[] }) {
  const data = useMemo(() => {
    const counts: Record<string, { label: string; count: number; emoji: string; color: string }> = {};
    places.forEach((p) => {
      const m = MOOD[p.mood];
      if (!counts[p.mood]) counts[p.mood] = { label: m.label, count: 0, emoji: m.emoji, color: m.color };
      counts[p.mood].count += p.visits.length;
    });
    return MOOD_ORDER.filter((k) => counts[k]).map((k) => ({
      name: counts[k].label,
      value: counts[k].count,
      color: counts[k].color,
      emoji: counts[k].emoji,
    }));
  }, [places]);

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">🍽️ 心情分布</h3>
      <p className="text-xs text-muted-foreground mb-4">按收藏时的心情统计餐厅</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{
              borderRadius: "12px", border: "1px solid rgba(150,100,50,0.16)", fontSize: "12px", backgroundColor: "#FFFCF6",
            }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.emoji} {item.name}</span>
              <span className="font-semibold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
