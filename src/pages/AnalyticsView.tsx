import { useState, useMemo } from "react";
import {
  MapPin, Target, Wallet, TrendingUp,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Place } from "@/types";
import { USERS, PIE_COLORS } from "@/constants";

interface AnalyticsViewProps {
  places: Place[];
}

export default function AnalyticsView({ places }: AnalyticsViewProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  const d = useMemo(() => {
    const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn).map((v) => ({ place: p, visit: v })));
    const pending = places.flatMap((p) => p.visits.filter((v) => !v.checkedIn));
    const totalSpend = checked.reduce((s, { visit }) => s + (parseFloat(visit.spending) || 0), 0);
    const rate = checked.length + pending.length > 0 ? Math.round((checked.length / (checked.length + pending.length)) * 100) : 0;
    const byPlace = places
      .map((p) => ({
        name: p.name,
        value: p.visits.filter((v) => v.checkedIn).reduce((s, v) => s + (parseFloat(v.spending) || 0), 0),
        visits: p.visits.filter((v) => v.checkedIn).length,
      }))
      .filter((x) => x.value > 0).sort((a, b) => b.value - a.value);

    // pseudo-random but stable generator (by year + month + total as seed)
    const seeded = (y: number, m: number, total: number) => {
      const seed = y * 10000 + m * 100 + total * 13;
      const x = Math.sin(seed) * 10000;
      const r = x - Math.floor(x);
      return Math.max(0, Math.round(r * Math.max(1, total / 3)));
    };

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      if (year === currentYear) {
        const historical = [
          { month: "1月", visits: 2, spending: 280 },
          { month: "2月", visits: 3, spending: 460 },
          { month: "3月", visits: 1, spending: 148 },
          { month: "4月", visits: 4, spending: 620 },
          { month: "5月", visits: checked.length, spending: totalSpend },
        ];
        if (m <= 5) return historical[m - 1];
        const monthVisits = checked.filter((_, idx) => idx % 7 === (m - 6)).length;
        return { month: `${m}月`, visits: monthVisits, spending: monthVisits * 80 };
      }
      const v = seeded(year, m, checked.length);
      return {
        month: `${m}月`,
        visits: v,
        spending: v * (60 + Math.round((Math.sin(year * m) * 10000 - Math.floor(Math.sin(year * m) * 10000)) * 120)),
      };
    });

    return { checked, pending, totalSpend, rate, byPlace, monthly };
  }, [places, year, currentYear]);

  const kpis = [
    { icon: <MapPin className="w-6 h-6" />,    value: d.pending.length,   unit: "个", label: "待打卡",  color: "#E8963C", bg: "#E8963C" },
    { icon: <Target className="w-6 h-6" />,    value: d.checked.length,   unit: "次", label: "已打卡",  color: "#16A34A", bg: "#16A34A" },
    { icon: <Wallet className="w-6 h-6" />,    value: `¥${d.totalSpend}`, unit: "",   label: "总开支",  color: "#BF4E2A", bg: "#BF4E2A" },
    { icon: <TrendingUp className="w-6 h-6" />, value: `${d.rate}%`,      unit: "",   label: "完成率",  color: "#A78BFA", bg: "#A78BFA" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
          打卡数据分析
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">你们的美食足迹一览</p>
      </div>

      {/* KPI cards — large centered */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ icon, value, unit, label, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
            {/* Color strip */}
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
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Donut */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground text-sm mb-0.5">各店消费占比</h3>
          <p className="text-xs text-muted-foreground mb-5">哪家最烧钱？</p>
          {d.byPlace.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie key="pie-main" data={d.byPlace} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={3} dataKey="value">
                  {d.byPlace.map((entry, i) => <Cell key={`cell-${entry.name}-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip key="pie-tooltip" formatter={(v: number) => [`¥${v}`, "消费"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid rgba(150,100,50,0.16)", fontSize: "12px", backgroundColor: "#FFFCF6" }} />
                <Legend key="pie-legend" iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: "11px", color: "#8A6E52" }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-muted-foreground italic">打卡后才有消费数据哦</p>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-foreground text-sm">月度打卡趋势</h3>
            <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
              <button type="button" onClick={() => setYear((y) => y - 1)}
                className="px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="px-2 py-1 text-foreground font-medium border-x border-border min-w-[3.5rem] text-center">{year}</span>
              <button type="button" onClick={() => setYear((y) => y + 1)}
                className="px-2 py-1 text-muted-foreground hover:bg-secondary transition-colors">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-5">你们这几个月的节奏</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.monthly} barSize={18}>
              <XAxis key="xaxis" dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8A6E52", fontFamily: "DM Mono, monospace" }} />
              <YAxis key="yaxis" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8A6E52" }} allowDecimals={false} />
              <Tooltip key="tooltip" contentStyle={{ borderRadius: "12px", border: "1px solid rgba(150,100,50,0.16)", fontSize: "12px", backgroundColor: "#FFFCF6" }}
                formatter={(v: number) => [`${v} 次`, "打卡"]} />
              <Bar key="bar-visits" dataKey="visits" name="打卡" fill="#BF4E2A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visit frequency */}
      {d.byPlace.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-foreground text-sm mb-0.5">常去榜</h3>
          <p className="text-xs text-muted-foreground mb-5">按打卡次数排行</p>
          <div className="space-y-4">
            {d.byPlace.map((item, i) => (
              <div key={item.name} className="flex items-center gap-4">
                <span className="text-sm font-bold w-5 text-right" style={{ color: i === 0 ? "#BF4E2A" : "#8A6E52", fontFamily: "DM Mono, monospace" }}>{i + 1}</span>
                <p className="text-sm font-medium text-foreground w-32 truncate">{item.name}</p>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(item.value / (d.byPlace[0]?.value || 1)) * 100}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right" style={{ fontFamily: "DM Mono, monospace" }}>¥{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buddy stats */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground text-sm mb-0.5">约饭搭档排行</h3>
        <p className="text-xs text-muted-foreground mb-5">谁和谁最爱一起吃</p>
        <div className="flex gap-4 flex-wrap">
          {[{ pair: ["小美", "阿帅"], count: 8, color: "#BF4E2A" }, { pair: ["小美", "阿豪"], count: 5, color: "#16A34A" }, { pair: ["阿帅", "阿豪"], count: 3, color: "#2563EB" }]
            .map(({ pair, count, color }) => (
              <div key={pair.join("-")} className="flex items-center gap-3 rounded-2xl px-5 py-4 border border-border" style={{ backgroundColor: color + "08" }}>
                <div className="flex -space-x-2">
                  {pair.map((name, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-card flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: USERS.find((u) => u.name === name)?.color ?? color }}>{name[0]}</div>
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
    </div>
  );
}
