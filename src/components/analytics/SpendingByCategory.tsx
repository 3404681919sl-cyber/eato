import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Place } from "../../types";
import { CAT } from "../../constants";

export default function SpendingByCategory({ places }: { places: Place[] }) {
  const data = useMemo(() => {
    const byCat: Record<string, { label: string; spent: number; color: string }> = {};
    places.forEach((p) => {
      const c = CAT[p.category];
      if (!byCat[p.category]) byCat[p.category] = { label: c.label, spent: 0, color: c.color };
      p.visits.filter((v) => v.checkedIn && v.spending).forEach((v) => {
        byCat[p.category].spent += Number(v.spending || 0);
      });
    });
    return Object.entries(byCat)
      .map(([_, v]) => ({ name: v.label, spent: v.spent, color: v.color }))
      .sort((a, b) => b.spent - a.spent);
  }, [places]);

  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">💰 品类消费排行</h3>
      <p className="text-xs text-muted-foreground mb-4">各品类已打卡总花费</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barSize={20} margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => "¥" + v} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip contentStyle={{
            borderRadius: "12px", border: "1px solid rgba(150,100,50,0.16)", fontSize: "12px", backgroundColor: "#FFFCF6",
          }} formatter={(v: number) => ["¥" + v, "花费"]} />
          <Bar dataKey="spent" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
