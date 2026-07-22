import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PIE_COLORS } from "@/constants";

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  unit: string;
  label: string;
  color: string;
  bg: string;
}

export function StatCard({ icon, value, unit, label, color, bg }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: bg + "15", color: color }}>
          {icon}
        </div>
        <p className="text-5xl font-bold leading-none mb-1" style={{ color, fontFamily: "DM Mono, monospace" }}>
          {value}
        </p>
        {unit && <p className="text-sm text-muted-foreground -mt-0.5">{unit}</p>}
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-3 font-semibold">{label}</p>
      </div>
    </div>
  );
}

// ─── KpiCards ─────────────────────────────────────────────────────────────────

interface KpiItem {
  icon: React.ReactNode;
  value: string | number;
  unit: string;
  label: string;
  color: string;
  bg: string;
}

interface KpiCardsProps {
  items: KpiItem[];
}

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

// ─── SpendingChart (Pie/Donut) ───────────────────────────────────────────────

interface SpendingChartProps {
  data: { name: string; value: number }[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold text-foreground text-sm mb-0.5">各店消费占比</h3>
      <p className="text-xs text-muted-foreground mb-5">哪家最烧钱？</p>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={3} dataKey="value">
              {data.map((entry, i) => (
                <Cell key={`cell-${entry.name}-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [`¥${v}`, "消费"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(150,100,50,0.16)",
                fontSize: "12px",
                backgroundColor: "#FFFCF6",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(val) => <span style={{ fontSize: "11px", color: "#8A6E52" }}>{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-52 flex items-center justify-center">
          <p className="text-sm text-muted-foreground italic">打卡后才有消费数据哦</p>
        </div>
      )}
    </div>
  );
}

// ─── MonthlyChart (Bar) ──────────────────────────────────────────────────────

interface MonthlyChartProps {
  data: { month: string; visits: number; spending: number }[];
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export function MonthlyChart({ data, year, onPrevYear, onNextYear }: MonthlyChartProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="font-semibold text-foreground text-sm">月度打卡趋势</h3>
        <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
          <button type="button" onClick={onPrevYear}
            className="px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="px-2 py-1 text-foreground font-medium border-x border-border min-w-[3.5rem] text-center">{year}</span>
          <button type="button" onClick={onNextYear}
            className="px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-5">你们这几个月的节奏</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={18}>
          <XAxis dataKey="month" axisLine={false} tickLine={false}
            tick={{ fontSize: 11, fill: "#8A6E52", fontFamily: "DM Mono, monospace" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8A6E52" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(150,100,50,0.16)",
              fontSize: "12px",
              backgroundColor: "#FFFCF6",
            }}
            formatter={(v: number) => [`${v} 次`, "打卡"]}
          />
          <Bar dataKey="visits" name="打卡" fill="#BF4E2A" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── TopRestaurants ───────────────────────────────────────────────────────────

interface TopRestaurantsProps {
  data: { name: string; value: number; visits: number }[];
}

export function TopRestaurants({ data }: TopRestaurantsProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h3 className="font-semibold text-foreground text-sm mb-0.5">常去榜</h3>
      <p className="text-xs text-muted-foreground mb-5">按打卡次数排行</p>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-4">
            <span className="text-sm font-bold w-5 text-right"
              style={{ color: i === 0 ? "#BF4E2A" : "#8A6E52", fontFamily: "DM Mono, monospace" }}>
              {i + 1}
            </span>
            <p className="text-sm font-medium text-foreground w-32 truncate">{item.name}</p>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{
                  width: `${(item.value / (data[0]?.value || 1)) * 100}%`,
                  backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                }} />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right" style={{ fontFamily: "DM Mono, monospace" }}>
              ¥{item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CategoryPieChart ─────────────────────────────────────────────────────────

interface CategoryPieChartProps {
  data: { name: string; value: number; color: string }[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold text-foreground text-sm mb-0.5">分类消费分布</h3>
      <p className="text-xs text-muted-foreground mb-5">都吃了些什么？</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value">
            {data.map((entry, i) => (
              <Cell key={`cell-${entry.name}-${i}`} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [`¥${v}`, "消费"]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(150,100,50,0.16)",
              fontSize: "12px",
              backgroundColor: "#FFFCF6",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(val) => <span style={{ fontSize: "11px", color: "#8A6E52" }}>{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── MoodDistribution ─────────────────────────────────────────────────────────

interface MoodDistributionProps {
  data: { mood: string; count: number; color: string; emoji: string }[];
}

export function MoodDistribution({ data }: MoodDistributionProps) {
  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold text-foreground text-sm mb-0.5">心情分布</h3>
      <p className="text-xs text-muted-foreground mb-5">带着什么心情去吃饭？</p>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.mood} className="flex items-center gap-3">
            <span className="text-base">{item.emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium">{item.mood}</span>
                <span className="text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                  {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%`, backgroundColor: item.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BuddyPairs ───────────────────────────────────────────────────────────────

interface BuddyPairsProps {
  data: { pair: string[]; count: number; color: string }[];
  userColors: { name: string; color: string }[];
}

export function BuddyPairs({ data, userColors }: BuddyPairsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-semibold text-foreground text-sm mb-0.5">约饭搭档排行</h3>
      <p className="text-xs text-muted-foreground mb-5">谁和谁最爱一起吃</p>
      <div className="flex gap-4 flex-wrap">
        {data.map(({ pair, count, color }) => (
          <div key={pair.join("-")} className="flex items-center gap-3 rounded-2xl px-5 py-4 border border-border" style={{ backgroundColor: color + "08" }}>
            <div className="flex -space-x-2">
              {pair.map((name, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: userColors.find((u) => u.name === name)?.color ?? color }}>
                  {name[0]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{pair.join(" & ")}</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{count} 次约饭</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
