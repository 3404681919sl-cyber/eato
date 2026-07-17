import React, { useMemo } from "react";
import { TrendingUp, Wallet, Target, Clock } from "lucide-react";
import type { Place } from "../../types";
import { useLocale } from "../../i18n";
import { CAT } from "../../constants";
import StatCard from "./StatCard";
import CategoryPieChart from "./CategoryPieChart";
import MonthlyBarChart from "./MonthlyBarChart";
import TopRestaurants from "./TopRestaurants";
import BestDiningPairs from "./BestDiningPairs";
import MoodDistribution from "./MoodDistribution";
import SpendingByCategory from "./SpendingByCategory";
import StarDistribution from "./StarDistribution";

export default function AnalyticsView({ places }: { places: Place[] }) {
  const { t } = useLocale();

  const statCardDefs = [
    { icon: <TrendingUp className="w-5 h-5" />, label: t("analytics.total"), key: "totalSpent", color: "#BF4E2A", bg: "#BF4E2A10" },
    { icon: <Wallet className="w-5 h-5" />, label: t("analytics.avg"), key: "avgPer", color: "#D97706", bg: "#D9770610" },
    { icon: <Target className="w-5 h-5" />, label: t("analytics.checked"), key: "checked", color: "#16A34A", bg: "#16A34A10" },
    { icon: <Clock className="w-5 h-5" />, label: t("analytics.pending"), key: "pending", color: "#2563EB", bg: "#2563EB10" },
  ];

  const stats = useMemo(() => {
    const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn).map((v) => ({ place: p, visit: v })));
    const pending = places.flatMap((p) => p.visits.filter((v) => !v.checkedIn));
    const totalSpent = checked.reduce((s, x) => s + Number(x.visit.spending || 0), 0);
    const avgPer = checked.length ? Math.round(totalSpent / checked.length) : 0;

    const byCat: Record<string, { label: string; count: number; spent: number; color: string; emoji: string }> = {};
    checked.forEach(({ place, visit }) => {
      const c = CAT[place.category];
      if (!byCat[place.category]) byCat[place.category] = { label: c.label, count: 0, spent: 0, color: c.color, emoji: c.emoji };
      byCat[place.category].count++;
      byCat[place.category].spent += Number(visit.spending || 0);
    });

    const monthly = [
      { name: "一月", spent: 0 }, { name: "二月", spent: 0 }, { name: "三月", spent: 0 },
      { name: "四月", spent: 1240 }, { name: "五月", spent: 1860 }, { name: "六月", spent: 2130 },
      { name: "七月", spent: totalSpent },
    ];

    const pairs = [
      { pair: ["小美", "阿帅"], count: 7, color: "#BF4E2A" },
      { pair: ["小美", "阿豪"], count: 5, color: "#16A34A" },
      { pair: ["阿帅", "阿豪"], count: 3, color: "#2563EB" },
    ];

    return {
      checked: checked.length,
      pending: pending.length,
      totalSpent,
      avgPer,
      byPlace: Object.entries(byCat).map(([k, v]) => ({ name: v.label, value: v.count, color: v.color, emoji: v.emoji })),
      monthly,
      pairs,
    };
  }, [places]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCardDefs.map((s) => (
          <StatCard
            key={s.key}
            icon={s.icon}
            label={s.label}
            value={s.key === "totalSpent" ? "¥" + stats.totalSpent.toLocaleString() : s.key === "avgPer" ? "¥" + stats.avgPer : s.key === "checked" ? stats.checked + " 次" : stats.pending + " 次"}
            color={s.color}
            bg={s.bg}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <CategoryPieChart data={stats.byPlace} />
        <MonthlyBarChart data={stats.monthly} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <MoodDistribution places={places} />
        <SpendingByCategory places={places} />
        <StarDistribution places={places} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TopRestaurants places={places} />
        <BestDiningPairs pairs={stats.pairs} />
      </div>
    </div>
  );
}
