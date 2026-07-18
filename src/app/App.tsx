import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Star, Check, Plus, MapPin, BarChart2, Calendar, Search,
  Utensils, Clock, ChevronDown, Heart, Users, LogIn,
  TrendingUp, Wallet, Target, ArrowRight, Sparkles, Zap,
  ExternalLink, BadgePercent, ChevronUp, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppState = "landing" | "auth" | "app";
type AuthMode = "login" | "signup";
type Tab = "table" | "calendar" | "analytics";
type Category = "hotpot" | "cafe" | "noodles" | "sushi" | "western" | "bbq" | "local" | "other";
type Mood = "must" | "excited" | "curious" | "casual";

type Visit = {
  id: string;
  date: string;
  time: string;
  checkedIn: boolean;
  spending: string;
  review: string;
};

type Place = {
  id: string;
  name: string;
  image: string;
  stars: number;
  category: Category;
  mood: Mood;
  plannedMenu: string;
  visits: Visit[];
};

type DealStatus = "idle" | "loading" | "done";

type Deal = {
  platform: string;
  description: string;
  price: number;
  originalPrice: number;
  tag?: string;
  isBest?: boolean;
};

type DealsResult = {
  deals: Deal[];
  bestStack: string;
  saving: number;
  finalPrice: number;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CAT: Record<Category, { label: string; emoji: string; color: string; light: string }> = {
  hotpot:  { label: "火锅",  emoji: "🍲", color: "#DC2626", light: "#FEE2E2" },
  cafe:    { label: "茶咖",  emoji: "☕", color: "#2563EB", light: "#DBEAFE" },
  noodles: { label: "汤面",  emoji: "🍜", color: "#16A34A", light: "#DCFCE7" },
  sushi:   { label: "寿司",  emoji: "🍣", color: "#92400E", light: "#FEF3C7" },
  western: { label: "西餐",  emoji: "🍽️", color: "#CA8A04", light: "#FEF9C3" },
  bbq:     { label: "烧烤",  emoji: "🔥", color: "#EA580C", light: "#FFEDD5" },
  local:   { label: "本帮菜", emoji: "🥢", color: "#7C3AED", light: "#EDE9FE" },
  other:   { label: "其他",  emoji: "🍴", color: "#6B7280", light: "#F3F4F6" },
};

const MOOD: Record<Mood, { label: string; emoji: string; color: string }> = {
  must:    { label: "超想去", emoji: "🔥", color: "#DC2626" },
  excited: { label: "很期待", emoji: "⭐", color: "#D97706" },
  curious: { label: "想试试", emoji: "👀", color: "#2563EB" },
  casual:  { label: "随便啦", emoji: "😌", color: "#6B7280" },
};

const PLATFORMS: Record<string, { name: string; color: string; bg: string; textColor: string }> = {
  meituan:  { name: "美团",     color: "#FFCC00", bg: "#FFFBE6", textColor: "#664D00" },
  douyin:   { name: "抖音",     color: "#161823", bg: "#F0F0F2", textColor: "#161823" },
  dianping: { name: "大众点评", color: "#FC5531", bg: "#FFF0ED", textColor: "#C03010" },
  taobao:   { name: "淘宝闪购", color: "#FF4400", bg: "#FFF3EE", textColor: "#C03010" },
  xianyu:   { name: "闲鱼",     color: "#00B8C8", bg: "#E8FAFC", textColor: "#007080" },
};

function generateDeals(category: Category): DealsResult {
  const BASE: Record<Category, number> = {
    hotpot: 158, sushi: 218, noodles: 58, cafe: 72, western: 248, bbq: 128, local: 98, other: 88,
  };
  const base = BASE[category];
  const r = (lo: number, hi: number) => Math.round(base * lo + Math.random() * base * (hi - lo));

  const meituanP  = r(0.72, 0.80);
  const douyinP   = r(0.65, 0.75);
  const dianpingP = r(0.78, 0.85);
  const taobaoP   = r(0.70, 0.78);
  const xianyuP   = r(0.60, 0.70);

  const prices = [meituanP, douyinP, dianpingP, taobaoP, xianyuP];
  const minP = Math.min(...prices);

  const deals: Deal[] = [
    { platform: "meituan",  description: "双人套餐 含2饮料",      price: meituanP,  originalPrice: base,  tag: meituanP  === minP ? "最低价" : undefined },
    { platform: "douyin",   description: "达人探店团购券",         price: douyinP,   originalPrice: base,  tag: douyinP   === minP ? "最低价" : "可叠加" },
    { platform: "dianping", description: `满${base}减${Math.round(base*0.15)}代金券`, price: dianpingP, originalPrice: base },
    { platform: "taobao",   description: "到店闪购 限量名额",      price: taobaoP,   originalPrice: base,  tag: taobaoP   === minP ? "最低价" : undefined },
    { platform: "xianyu",   description: "转让未使用套餐券",       price: xianyuP,   originalPrice: base,  tag: xianyuP   === minP ? "最低价" : "限时" },
  ].map((d) => ({ ...d, isBest: d.price === minP }));

  const bestDeal = deals.find((d) => d.isBest)!;
  const stackSuggestion = `当前最低价为 ${PLATFORMS[bestDeal.platform].name}（¥${bestDeal.price}），可直接购买。`;

  return { deals, bestStack: stackSuggestion, saving: Math.round(base - minP), finalPrice: minP };
}

const DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2) + 10;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
}).slice(0, 24); // 10:00 – 21:30

const USERS = [
  { id: "a", name: "小美", color: "#BF4E2A" },
  { id: "b", name: "阿帅", color: "#2563EB" },
  { id: "c", name: "阿豪", color: "#16A34A" },
];

const PIE_COLORS = ["#BF4E2A", "#E8963C", "#7DC88A", "#6B8FD9", "#A78BFA", "#FB7185"];

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Place[] = [
  {
    id: "1", name: "海底捞火锅",
    image: "https://images.unsplash.com/photo-1614104030967-5ca61a54247b?w=120&h=120&fit=crop&auto=format",
    stars: 5, category: "hotpot", mood: "must",
    plannedMenu: "番茄锅底 · 毛肚 · 鸭肠 · 虾滑 · 牛肉卷",
    visits: [
      { id: "1-1", date: "周六", time: "18:00", checkedIn: true,  spending: "340", review: "锅底超鲜！服务也很好，还有变脸表演" },
      { id: "1-2", date: "周三", time: "",       checkedIn: false, spending: "",    review: "" },
    ],
  },
  {
    id: "2", name: "乐禧寿司",
    image: "https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=120&h=120&fit=crop&auto=format",
    stars: 4, category: "sushi", mood: "excited",
    plannedMenu: "omakase套餐 · 海胆饭团 · 炙烤三文鱼",
    visits: [
      { id: "2-1", date: "周日", time: "12:30", checkedIn: false, spending: "", review: "" },
    ],
  },
  {
    id: "3", name: "陈记拉面馆",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=120&h=120&fit=crop&auto=format",
    stars: 4, category: "noodles", mood: "must",
    plannedMenu: "招牌牛骨拉面 · 叉烧包 · 溏心蛋",
    visits: [
      { id: "3-1", date: "周二", time: "12:00", checkedIn: true, spending: "148", review: "面条Q弹，汤底浓郁，下次还要来！" },
    ],
  },
  {
    id: "4", name: "慢调咖啡",
    image: "https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?w=120&h=120&fit=crop&auto=format",
    stars: 3, category: "cafe", mood: "curious",
    plannedMenu: "手冲耶加 · 草莓拿铁 · 可颂 · 提拉米苏",
    visits: [
      { id: "4-1", date: "周四", time: "15:00", checkedIn: true,  spending: "96", review: "环境很好，适合聊天谈事情，音乐品味不错" },
      { id: "4-2", date: "周日", time: "",       checkedIn: false, spending: "",   review: "" },
    ],
  },
  {
    id: "5", name: "老外婆本帮菜",
    image: "https://images.unsplash.com/photo-1658853577090-b96a5bdd5c20?w=120&h=120&fit=crop&auto=format",
    stars: 5, category: "local", mood: "excited",
    plannedMenu: "红烧肉 · 腌笃鲜 · 响油鳝糊 · 草头圈子",
    visits: [
      { id: "5-1", date: "周五", time: "19:00", checkedIn: false, spending: "", review: "" },
    ],
  },
];

// Seed calendar slots: { "${day}_${time}": [userIds] }
const buildSeedCalendar = (): Record<string, string[]> => {
  const slots: Record<string, string[]> = {};
  const mark = (day: string, times: string[], user: string) => {
    times.forEach((t) => {
      const k = `${day}_${t}`;
      slots[k] = [...(slots[k] || []), user];
    });
  };
  mark("周三", ["12:00", "12:30", "13:00", "13:30"], "a");
  mark("周六", ["18:00", "18:30", "19:00", "19:30"], "a");
  mark("周三", ["13:00", "13:30", "14:00", "14:30"], "b");
  mark("周五", ["19:00", "19:30", "20:00", "20:30"], "b");
  mark("周六", ["18:00", "18:30", "19:00", "19:30", "20:00"], "b");
  mark("周五", ["18:00", "18:30", "19:00", "19:30"], "c");
  mark("周六", ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"], "c");
  return slots;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => !disabled && onChange(s)} className={disabled ? "cursor-default" : "cursor-pointer"}>
          <Star className={`w-3 h-3 transition-colors ${s <= value ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

function MoodPicker({ value, onChange, disabled }: { value: Mood; onChange: (m: Mood) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const m = MOOD[value];
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${disabled ? "cursor-default opacity-60" : "cursor-pointer hover:opacity-80"}`}
        style={{ backgroundColor: m.color + "20", color: m.color }}
      >
        <span>{m.emoji}</span>
        <span>{m.label}</span>
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 w-28">
          {(Object.entries(MOOD) as [Mood, typeof MOOD[Mood]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ${value === key ? "font-semibold" : "text-muted-foreground hover:bg-secondary"}`}
              style={value === key ? { backgroundColor: cfg.color + "15", color: cfg.color } : {}}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPicker({ value, onChange, disabled }: { value: Category; onChange: (c: Category) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const cat = CAT[value];
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${disabled ? "cursor-default" : "cursor-pointer hover:opacity-80"}`}
        style={{ backgroundColor: cat.light, color: cat.color, borderColor: cat.color + "40" }}
      >
        <span>{cat.emoji}</span>
        <span>{cat.label}</span>
        {!disabled && <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
      </button>
      {open && (
        <div className="absolute top-7 left-0 z-30 bg-card border border-border rounded-xl p-1.5 shadow-xl grid grid-cols-2 gap-0.5 w-48">
          {(Object.entries(CAT) as [Category, typeof CAT[Category]][]).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false); }}
              className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg transition-colors ${value === key ? "font-semibold" : "text-muted-foreground hover:bg-secondary"}`}
              style={value === key ? { backgroundColor: cfg.light, color: cfg.color } : {}}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onAuth }: { onAuth: () => void }) {
  const photos = [
    "https://images.unsplash.com/photo-1614104030967-5ca61a54247b?w=400&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=400&h=500&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1564327367919-cb377ea6a88f?w=400&h=500&fit=crop&auto=format",
  ];

  return (
    <div className="min-h-screen bg-[#0C0805] text-white overflow-x-hidden" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#BF4E2A] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
        </div>
        <button
          onClick={onAuth}
          className="flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          登录 / 注册
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        {/* Background image collage */}
        <div className="absolute inset-0 flex">
          {photos.map((src, i) => (
            <div key={i} className="flex-1 relative overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover opacity-30" style={{ filter: "saturate(0.6)" }} />
            </div>
          ))}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0805] via-[#0C0805]/60 to-[#0C0805]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0805] via-transparent to-[#0C0805]/80" />
        </div>

        <div className="relative max-w-6xl mx-auto px-10 pt-24 pb-16">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: "#BF4E2A25", border: "1px solid #BF4E2A50", color: "#E8963C" }}>
              <Sparkles className="w-3 h-3" />
              为热爱美食的你们而生
            </div>

            <h1 className="text-[88px] font-bold leading-none mb-4 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}>
              Eato
            </h1>
            <p className="text-xl text-white/60 leading-relaxed mb-3" style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }}>
              和朋友一起发现、打卡、记录
            </p>
            <p className="text-base text-white/40 leading-relaxed mb-10">
              共享打卡清单 · 智能时间协调 · 美食数据洞察
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={onAuth}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#BF4E2A", color: "white" }}
              >
                开始约饭
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-7 py-3.5 rounded-full text-sm font-medium text-white/60 border border-white/15 hover:border-white/30 hover:text-white/80 transition-all">
                了解更多
              </button>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-12 right-10 hidden lg:flex flex-col gap-3">
          {[
            { n: "12,000+", label: "打卡记录" },
            { n: "3,400+", label: "活跃食友" },
            { n: "98%",    label: "约饭成功率" },
          ].map(({ n, label }) => (
            <div key={label} className="text-right">
              <p className="text-2xl font-bold" style={{ fontFamily: "DM Mono, monospace", color: "#E8963C" }}>{n}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature strip */}
      <section className="max-w-6xl mx-auto px-10 py-20 grid grid-cols-3 gap-6">
        {[
          {
            icon: <Utensils className="w-5 h-5" />, color: "#BF4E2A",
            title: "智能打卡表",
            desc: "按分类记录想去的餐厅，心情标签、星级评分、拟定菜单一应俱全。打卡后花费与评价自动归档。",
          },
          {
            icon: <Calendar className="w-5 h-5" />, color: "#2563EB",
            title: "约饭时间协调",
            desc: "可视化周历热力图，多人时间重叠一眼看出，再也不用反复问「你什么时候有空？」",
          },
          {
            icon: <BarChart2 className="w-5 h-5" />, color: "#16A34A",
            title: "美食数据洞察",
            desc: "总开支、打卡率、常去榜、约饭搭档排行——用数据记录你们在一起的每一顿饭。",
          },
        ].map(({ icon, color, title, desc }) => (
          <div key={title} className="rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors"
            style={{ backgroundColor: "#ffffff08" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              style={{ backgroundColor: color + "25", color }}>
              {icon}
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="text-center py-20 px-10 border-t border-white/5">
        <p className="text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
          准备好了吗？
        </p>
        <p className="text-white/40 text-sm mb-8">免费开始，和你最重要的人一起记录每一顿饭</p>
        <button
          onClick={onAuth}
          className="px-10 py-3.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#BF4E2A", color: "white" }}
        >
          免费注册
        </button>
        <p className="text-white/20 text-xs mt-8">© 2026 Eato · 美食共享平台</p>
      </section>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 900);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Left — visual panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden" style={{ backgroundColor: "#0C0805" }}>
        <img
          src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=1200&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0C0805] via-[#0C0805]/40 to-transparent" />
        <div className="relative flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[#BF4E2A] flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Playfair Display, serif" }}>
            每一顿饭，<br />
            <span style={{ fontStyle: "italic", color: "#E8963C" }}>都值得被记录</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            与你最重要的朋友一起创建共享打卡本，记录你们走过的每一家餐厅，留下属于你们的美食足迹。
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "Playfair Display, serif" }}>
            {mode === "login" ? "欢迎回来" : "加入 Eato"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "login" ? "继续你们的美食之旅" : "创建账号，开始约饭"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">昵称</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">邮箱</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">密码</label>
              <input
                type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#BF4E2A", color: "white" }}
            >
              {loading ? "验证中…" : mode === "login" ? "登录" : "创建账号"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">或者</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full py-3 rounded-xl border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2.5 hover:bg-secondary transition-colors">
            <span className="text-lg">G</span>
            使用 Google 账号继续
          </button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary ml-1 hover:underline"
            >
              {mode === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Deals Panel (expanded tr) ───────────────────────────────────────────────

function DealsPanel({ category, placeName, onClose }: { category: Category; placeName: string; onClose: () => void }) {
  const [status, setStatus] = useState<DealStatus>("idle");
  const [result, setResult] = useState<DealsResult | null>(null);

  const search = () => {
    setStatus("loading");
    setTimeout(() => {
      setResult(generateDeals(category));
      setStatus("done");
    }, 1600);
  };

  if (status === "idle") {
    return (
      <div className="flex items-center justify-between py-3 px-4">
        <p className="text-xs text-muted-foreground">点击自动检索各平台最新优惠，AI 为你比对最优组合</p>
        <button onClick={search}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ backgroundColor: "#BF4E2A", color: "white" }}>
          <Zap className="w-3 h-3" />
          开始查询
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">正在检索美团、抖音、大众点评、淘宝闪购、闲鱼…</span>
        </div>
        <div className="flex gap-2">
          {Object.values(PLATFORMS).map((p, i) => (
            <div key={p.name} className="text-xs px-2 py-1 rounded-full font-medium animate-pulse"
              style={{ backgroundColor: p.bg, color: p.textColor, animationDelay: `${i * 0.15}s` }}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="py-4 px-4">
      {/* Platform rows */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {result.deals.map((deal) => {
          const p = PLATFORMS[deal.platform];
          const disc = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
          // search URL per platform with current restaurant name
          const urls: Record<string, string> = {
            meituan: `https://s.meituan.com/${encodeURIComponent(placeName)}`,
            douyin: `https://www.douyin.com/search/${encodeURIComponent(placeName)}`,
            dianping: `https://www.dianping.com/search/keyword/${encodeURIComponent(placeName)}`,
            taobao: `https://s.taobao.com/search?q=${encodeURIComponent(placeName)}`,
            xianyu: `https://s.ershou.taobao.com/search.htm?q=${encodeURIComponent(placeName)}`,
          };
          return (
            <div key={deal.platform}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ${deal.isBest ? "ring-2" : ""}`}
              style={{
                backgroundColor: deal.isBest ? p.bg : "rgba(242,233,213,0.25)",
                borderColor: deal.isBest ? p.color : "rgba(150,100,50,0.12)",
                boxShadow: deal.isBest ? `0 0 0 2px ${p.color}30` : undefined,
              }}>
              {/* Platform badge */}
              <div className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold min-w-[68px] text-center"
                style={{ backgroundColor: p.color + "22", color: p.textColor, border: `1px solid ${p.color}40` }}>
                {p.name}
              </div>
              {/* Description */}
              <p className="text-xs text-muted-foreground flex-1 truncate">{deal.description}</p>
              {/* Tag */}
              {deal.tag && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: deal.isBest ? "#BF4E2A" : "#E8963C", color: "white" }}>
                  {deal.tag}
                </span>
              )}
              {/* Price */}
              <div className="flex items-baseline gap-1 flex-shrink-0">
                <span className="text-base font-bold" style={{ color: deal.isBest ? "#BF4E2A" : "#2C1810", fontFamily: "DM Mono, monospace" }}>
                  ¥{deal.price}
                </span>
                <span className="text-[11px] text-muted-foreground line-through" style={{ fontFamily: "DM Mono, monospace" }}>
                  ¥{deal.originalPrice}
                </span>
                <span className="text-[10px] font-medium" style={{ color: "#16A34A" }}>
                  -{disc}%
                </span>
              </div>
              {/* Link */}
              <a href={urls[deal.platform]} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* AI stack suggestion */}
      <div className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ backgroundColor: "#BF4E2A0D", border: "1px solid #BF4E2A25" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: "#BF4E2A20" }}>
          <Zap className="w-3 h-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary mb-0.5">AI 智能叠券建议</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.bestStack}</p>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronUp className="w-3 h-3" />
          收起
        </button>
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function TableView({ places, setPlaces }: { places: Place[]; setPlaces: React.Dispatch<React.SetStateAction<Place[]>> }) {
  const [newName, setNewName] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ name: string; address: string; photo?: string }>>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [editingMenu, setEditingMenu] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [expandedDeals, setExpandedDeals] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce POI search
  useEffect(() => {
    if (!newName.trim()) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    const key = import.meta.env.VITE_AMAP_KEY as string | undefined;
    if (!key) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      setSuggestLoading(true);
      const url = `https://restapi.amap.com/v3/place/text?key=${encodeURIComponent(key)}&keywords=${encodeURIComponent(newName.trim())}&types=050000&extensions=all&offset=10`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "1" && Array.isArray(data.pois)) {
            setSuggestions(
              data.pois.map((p: any) => ({
                name: p.name as string,
                address: (p.address || "") as string,
                photo: p.photos?.[0]?.url ? `${p.photos[0].url}?w=120&h=120` : undefined,
              }))
            );
            setSuggestOpen(true);
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [newName]);

  const rows = useMemo(() => {
    const out: Array<{ place: Place; visit: Visit; visitIndex: number; isLast: boolean }> = [];
    for (const place of places) {
      place.visits.forEach((v, i) => out.push({ place, visit: v, visitIndex: i, isLast: i === place.visits.length - 1 }));
    }
    return out;
  }, [places]);

  const totals = useMemo(() => {
    const all = places.flatMap((p) => p.visits);
    return { checked: all.filter((v) => v.checkedIn).length, total: all.length };
  }, [places]);

  const mutPlace = (id: string, patch: Partial<Place>) =>
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const mutVisit = (pid: string, vid: string, patch: Partial<Visit>) =>
    setPlaces((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p, visits: p.visits.map((v) => v.id !== vid ? v : { ...v, ...patch }),
    }));

  const addVisit = (pid: string) =>
    setPlaces((prev) => prev.map((p) => p.id !== pid ? p : {
      ...p, visits: [...p.visits, { id: `${pid}-${Date.now()}`, date: "", time: "", checkedIn: false, spending: "", review: "" }],
    }));

  const addPlace = () => {
    if (!newName.trim()) return;
    const id = Date.now().toString();
    setPlaces((prev) => [...prev, {
      id, name: newName.trim(), image: "", stars: 3, category: "other", mood: "curious",
      plannedMenu: "",
      visits: [{ id: `${id}-1`, date: "", time: "", checkedIn: false, spending: "", review: "" }],
    }]);
    setNewName("");
    setSuggestions([]);
    setSuggestOpen(false);
  };

  const addSuggestedPlace = (item: { name: string; address: string; photo?: string }) => {
    const id = Date.now().toString();
    setPlaces((prev) => [...prev, {
      id, name: item.name, image: item.photo || "", stars: 3, category: "other", mood: "curious",
      plannedMenu: "",
      visits: [{ id: `${id}-1`, date: "", time: "", checkedIn: false, spending: "", review: "" }],
    }]);
    setNewName("");
    setSuggestions([]);
    setSuggestOpen(false);
    inputRef.current?.blur();
  };

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            我们的打卡清单
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            共 {totals.total} 条 · <span className="text-primary font-medium">{totals.checked} 已打卡</span> · {totals.total - totals.checked} 待探索
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
            <input
              ref={inputRef}
              type="text" placeholder="输入店名新增打卡点…" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (suggestOpen && suggestions[0] ? addSuggestedPlace(suggestions[0]) : addPlace())}
              onFocus={() => newName.trim() && suggestions.length > 0 && setSuggestOpen(true)}
              className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 w-56 placeholder:text-muted-foreground/60 relative"
            />
            {/* Suggestions dropdown */}
            {suggestOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto py-1">
                {suggestLoading && suggestions.length === 0 && (
                  <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> 搜索中…
                  </div>
                )}
                {suggestions.map((s, i) => (
                  <button key={i} type="button" onClick={() => addSuggestedPlace(s)}
                    className="w-full text-left px-3 py-2 hover:bg-secondary flex items-center gap-3 transition-colors">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-muted" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-3.5 h-3.5 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.address || "地址未知"}</p>
                    </div>
                  </button>
                ))}
                {suggestions.length === 0 && !suggestLoading && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">暂无推荐，按回车直接添加</div>
                )}
              </div>
            )}
          </div>
          <button onClick={addPlace} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full" style={{ minWidth: "1220px" }}>
          <thead>
            <tr className="border-b border-border" style={{ backgroundColor: "rgba(242,233,213,0.5)" }}>
              {[
                { l: "日期 & 时间", w: "w-36" }, { l: "待打卡点", w: "w-60" }, { l: "心情", w: "w-24" },
                { l: "拟定菜单", w: "w-48" },
                { l: "优惠比对", w: "w-28" },
                { l: "✓ 打卡", w: "w-20 text-center" },
                { l: "花费 (元)", w: "w-24" }, { l: "评价留言", w: "" }, { l: "+", w: "w-10 text-center" },
              ].map(({ l, w }) => (
                <th key={l} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${w}`}
                  style={{ fontFamily: "DM Mono, monospace" }}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ place, visit, visitIndex, isLast }) => {
              const checked = visit.checkedIn;
              const cat = CAT[place.category];
              return (
                <React.Fragment key={visit.id}>
                <tr
                  className={`border-b border-border/40 transition-colors ${checked ? "bg-muted/15" : "hover:bg-secondary/25"}`}>
                  {/* Date + Time */}
                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <select value={visit.date} onChange={(e) => mutVisit(place.id, visit.id, { date: e.target.value })}
                          className="appearance-none text-sm text-foreground bg-transparent border-none focus:outline-none cursor-pointer pr-5 font-medium w-full"
                          style={{ fontFamily: "DM Mono, monospace" }}>
                          <option value="">选择日期</option>
                          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <input
                          type="time" value={visit.time}
                          onChange={(e) => mutVisit(place.id, visit.id, { time: e.target.value })}
                          className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none w-20"
                          style={{ fontFamily: "DM Mono, monospace" }}
                        />
                        <button
                          type="button" title="设为当前时间"
                          onClick={() => mutVisit(place.id, visit.id, { time: nowTime() })}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium leading-none">
                          NOW
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Place */}
                  <td className={`px-4 py-3 ${checked ? "opacity-35" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {place.image ? (
                          <img src={place.image} alt={place.name} className={`w-12 h-12 rounded-xl object-cover ${checked ? "grayscale" : ""}`} />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.light }}>
                            {cat.emoji}
                          </div>
                        )}
                        {visitIndex > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                            style={{ backgroundColor: cat.color }}>
                            #{visitIndex + 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{place.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <StarRow value={place.stars} onChange={(s) => mutPlace(place.id, { stars: s })} disabled={checked} />
                          <CategoryPicker value={place.category} onChange={(c) => mutPlace(place.id, { category: c })} disabled={checked} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mood */}
                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    <MoodPicker value={place.mood} onChange={(m) => mutPlace(place.id, { mood: m })} disabled={checked} />
                  </td>

                  {/* Menu */}
                  <td className={`px-4 py-3 ${checked ? "opacity-35 pointer-events-none" : ""}`}>
                    {editingMenu === visit.id ? (
                      <input autoFocus value={place.plannedMenu} onChange={(e) => mutPlace(place.id, { plannedMenu: e.target.value })}
                        onBlur={() => setEditingMenu(null)} onKeyDown={(e) => e.key === "Enter" && setEditingMenu(null)}
                        className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none" placeholder="输入菜单…" />
                    ) : (
                      <p onClick={() => !checked && setEditingMenu(visit.id)}
                        className={`text-xs text-muted-foreground line-clamp-2 leading-relaxed ${!checked ? "cursor-text hover:text-foreground transition-colors" : "cursor-default"}`}
                        title={place.plannedMenu}>
                        {place.plannedMenu || <span className="italic opacity-40">点击添加菜单…</span>}
                      </p>
                    )}
                  </td>

                  {/* Deals */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpandedDeals(expandedDeals === visit.id ? null : visit.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
                        expandedDeals === visit.id
                          ? "border-primary/40 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
                      }`}
                      style={expandedDeals === visit.id ? { backgroundColor: "#BF4E2A0D" } : {}}>
                      <BadgePercent className="w-3 h-3" />
                      {expandedDeals === visit.id ? "收起" : "查优惠"}
                      {expandedDeals !== visit.id && <ChevronDown className="w-3 h-3 opacity-50" />}
                    </button>
                  </td>

                  {/* Check-in */}
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => mutVisit(place.id, visit.id, { checkedIn: !checked })}
                      title={checked ? "点击取消打卡" : "点击打卡"}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 ${checked ? "border-primary bg-primary text-primary-foreground scale-110" : "border-border hover:border-primary/60 hover:bg-primary/5"}`}>
                      {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </button>
                  </td>

                  {/* Spending */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>¥</span>
                      <input type="number" value={visit.spending} onChange={(e) => mutVisit(place.id, visit.id, { spending: e.target.value })}
                        placeholder="—" min="0"
                        className="w-16 text-sm text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40"
                        style={{ fontFamily: "DM Mono, monospace" }} />
                    </div>
                  </td>

                  {/* Review */}
                  <td className="px-4 py-3">
                    {editingReview === visit.id ? (
                      <input autoFocus value={visit.review} onChange={(e) => mutVisit(place.id, visit.id, { review: e.target.value })}
                        onBlur={() => setEditingReview(null)} onKeyDown={(e) => e.key === "Enter" && setEditingReview(null)}
                        className="w-full text-xs bg-secondary border border-primary/30 rounded-lg px-2 py-1.5 focus:outline-none" placeholder="写下你的感受…" />
                    ) : (
                      <p onClick={() => setEditingReview(visit.id)}
                        className="text-xs text-muted-foreground cursor-text hover:text-foreground transition-colors truncate max-w-[180px]" title={visit.review}>
                        {visit.review || <span className="italic opacity-35">点击添加评价…</span>}
                      </p>
                    )}
                  </td>

                  {/* Add */}
                  <td className="px-4 py-3 text-center">
                    {isLast && (
                      <button type="button" onClick={() => addVisit(place.id)} title="再约一次"
                        className="w-6 h-6 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center mx-auto transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>

                {/* Expanded deals row */}
                {expandedDeals === visit.id && (
                  <tr className="border-b border-border/40">
                    <td colSpan={9} className="px-4" style={{ backgroundColor: "rgba(242,233,213,0.2)" }}>
                      <DealsPanel
                        category={place.category}
                        placeName={place.name}
                        onClose={() => setExpandedDeals(null)}
                      />
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={9} className="py-16 text-center">
                <Utensils className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">还没有打卡点，搜索添加你们的第一站吧！</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateLabel(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatDateShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function CalendarView({ slots, setSlots }: { slots: Record<string, string[]>; setSlots: React.Dispatch<React.SetStateAction<Record<string, string[]>>> }) {
  const [currentUser, setCurrentUser] = useState("a");
  const [interval, setInterval] = useState<30 | 60>(60);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      days.push({ label: DAYS[i], date: d });
    }
    return days;
  }, [weekStart]);

  const weekRangeText = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    const sameMonth = weekStart.getMonth() === end.getMonth();
    return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${sameMonth ? "" : end.getMonth() + 1 + "月"}${end.getDate()}日`;
  }, [weekStart]);

  const timeSlots = useMemo(() => {
    const result: string[] = [];
    for (let h = 0; h < 24; h++) {
      result.push(`${h}:00`);
      if (interval === 30) result.push(`${h}:30`);
    }
    return result;
  }, [interval]);

  const hourHasSelection = useMemo(() => {
    const set = new Set<number>();
    Object.entries(slots).forEach(([key, users]) => {
      if (!users || users.length === 0) return;
      const time = key.split("_")[1];
      if (!time) return;
      const h = parseInt(time.split(":")[0], 10);
      if (!Number.isNaN(h)) set.add(h);
    });
    return set;
  }, [slots]);

  const rowHeight = (time: string) => {
    const h = parseInt(time.split(":")[0], 10);
    const selected = hourHasSelection.has(h);
    const active = h >= 7;
    if (active || selected) return interval === 30 ? "h-6" : "h-10";
    return "h-4"; // compressed off-peak hours
  };

  const toggle = (day: string, time: string) => {
    const key = `${day}_${time}`;
    setSlots((prev) => {
      const cur = prev[key] || [];
      const updated = cur.includes(currentUser) ? cur.filter((u) => u !== currentUser) : [...cur, currentUser];
      return { ...prev, [key]: updated };
    });
  };

  // Find best overlap slots
  const hotSlots = useMemo(() => {
    return Object.entries(slots)
      .filter(([, users]) => users.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);
  }, [slots]);

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goThisWeek = () => setWeekStart(getMonday(new Date()));

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground leading-tight" style={{ fontFamily: "Playfair Display, serif" }}>
            约饭时间协调
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {weekRangeText} · 点击格子选择你有空的时间，颜色越深代表重叠人数越多 ✨
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Week navigator */}
          <div className="flex items-center rounded-xl border border-border overflow-hidden text-xs">
            <button type="button" onClick={goPrevWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="上一周">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={goThisWeek} className="px-3 py-1.5 font-medium text-muted-foreground hover:bg-secondary transition-colors border-x border-border">
              今天
            </button>
            <button type="button" onClick={goNextWeek} className="px-2.5 py-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="下一周">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Interval toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden text-xs">
            {([30, 60] as const).map((iv) => (
              <button key={iv} type="button" onClick={() => setInterval(iv)}
                className={`px-3 py-1.5 font-medium transition-colors ${interval === iv ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                {iv === 30 ? "30分钟" : "1小时"}
              </button>
            ))}
          </div>
          {/* Current user selector */}
          <div className="flex gap-1.5">
            {USERS.map((u) => (
              <button key={u.id} type="button" onClick={() => setCurrentUser(u.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${currentUser === u.id ? "text-white shadow-sm" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                style={currentUser === u.id ? { backgroundColor: u.color, borderColor: u.color } : {}}>
                {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hot slots banner */}
      {hotSlots.length > 0 && (
        <div className="mb-5 flex gap-3 flex-wrap">
          {hotSlots.map(([key, users]) => {
            const [day, time] = key.split("_");
            const dayIndex = DAYS.indexOf(day);
            const date = dayIndex >= 0 ? weekDays[dayIndex] : null;
            return (
              <div key={key} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                style={{ backgroundColor: "#BF4E2A12", border: "1px solid #BF4E2A30" }}>
                <span className="text-primary font-semibold">
                  {date ? formatDateLabel(date.date) : day} {day} {time}
                </span>
                <div className="flex gap-0.5">
                  {users.map((uid) => {
                    const u = USERS.find((x) => x.id === uid)!;
                    return <div key={uid} className="w-5 h-5 rounded-full border-2 border-card flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: u.color }}>{u.name[0]}</div>;
                  })}
                </div>
                <span className="text-xs text-muted-foreground">{users.length}人可</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-card border border-border rounded-2xl overflow-auto">
        <div className="min-w-[700px]">
          {/* Header row */}
          <div className="grid border-b border-border sticky top-0 bg-card z-10" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
            <div className="p-3" />
            {weekDays.map((day) => (
              <div key={day.label} className="p-3 text-center border-l border-border">
                <p className="text-xs font-bold text-foreground">{day.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace" }}>
                  {formatDateShort(day.date)}
                </p>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {timeSlots.map((time) => (
            <div key={time} className={`grid border-b border-border/40`} style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
              {/* Time label */}
              <div className={`flex items-center justify-end pr-3 ${rowHeight(time)}`}>
                <span className="text-[11px] text-muted-foreground leading-none"
                  style={{ fontFamily: "DM Mono, monospace" }}>
                  {time}
                </span>
              </div>
              {/* Day cells */}
              {DAYS.map((day) => {
                const key = `${day}_${time}`;
                const users = slots[key] || [];
                const isMine = users.includes(currentUser);
                const count = users.length;
                const cu = USERS.find((u) => u.id === currentUser)!;

                // Background: blend of user colors based on count
                let bg = "transparent";
                let border = "transparent";
                if (count === 1) {
                  const u = USERS.find((x) => x.id === users[0])!;
                  bg = u.color + "35";
                  border = u.color + "60";
                } else if (count === 2) {
                  bg = "#BF4E2A55";
                  border = "#BF4E2A80";
                } else if (count >= 3) {
                  bg = "#BF4E2A88";
                  border = "#BF4E2A";
                }

                return (
                  <button key={day} type="button" onClick={() => toggle(day, time)}
                    className={`${rowHeight(time)} border-l border-border/40 relative transition-all hover:opacity-80 group`}
                    style={{ backgroundColor: bg, borderTopColor: border }}>
                    {/* User dots */}
                    {count > 0 && (
                      <div className="absolute bottom-1 left-1 flex gap-0.5 flex-wrap">
                        {users.slice(0, 3).map((uid) => {
                          const u = USERS.find((x) => x.id === uid)!;
                          return <div key={uid} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.color }} />;
                        })}
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                      style={{ backgroundColor: isMine ? cu.color + "20" : cu.color + "15" }}>
                      {!isMine && <Plus className="w-3 h-3 text-foreground/30" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-2">
        <p className="text-xs text-muted-foreground">图例：</p>
        {USERS.map((u) => (
          <div key={u.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: u.color + "60" }} />
            <span className="text-xs text-muted-foreground">{u.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#BF4E2A88" }} />
          <span className="text-xs text-muted-foreground">3人重叠</span>
          <div className="w-3 h-3 rounded-sm ml-2" style={{ backgroundColor: "#BF4E2A55" }} />
          <span className="text-xs text-muted-foreground">2人重叠</span>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────

function AnalyticsView({ places }: { places: Place[] }) {
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

    // 伪随机但稳定的生成器（按年份 + 月份 + 总数作为 seed）
    const seeded = (y: number, m: number, total: number) => {
      const seed = y * 10000 + m * 100 + total * 13;
      const x = Math.sin(seed) * 10000;
      const r = x - Math.floor(x);
      return Math.max(0, Math.round(r * Math.max(1, total / 3)));
    };

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      if (year === currentYear) {
        // 当前年份：1-5月保留历史数据，6-12月基于当前 visits 分配
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
      // 其他年份：用 seed 生成模拟数据
      const v = seeded(year, m, checked.length);
      return { month: `${m}月`, visits: v, spending: v * (60 + Math.round((Math.sin(year * m) * 10000 - Math.floor(Math.sin(year * m) * 10000)) * 120)) };
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

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<AppState>("landing");
  const [tab, setTab] = useState<Tab>("table");
  const [places, setPlaces] = useState<Place[]>(SEED);
  const [slots, setSlots] = useState<Record<string, string[]>>(buildSeedCalendar);

  const checked = places.flatMap((p) => p.visits.filter((v) => v.checkedIn)).length;
  const total = places.flatMap((p) => p.visits).length;

  if (screen === "landing") return <LandingPage onAuth={() => setScreen("auth")} />;
  if (screen === "auth") return <AuthPage onSuccess={() => setScreen("app")} />;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "table",     label: "打卡表",    icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: "calendar",  label: "约饭时间",   icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "analytics", label: "数据分析",   icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
          </div>
          <nav className="flex gap-1">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {t.icon}{t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: total > 0 ? `${(checked / total) * 100}%` : "0%" }} />
              </div>
              <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{checked}/{total}</span>
            </div>
            <div className="flex -space-x-2">
              {USERS.map((u) => (
                <div key={u.id} className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                  style={{ backgroundColor: u.color }} title={u.name}>{u.name[0]}</div>
              ))}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === "table"     && <TableView places={places} setPlaces={setPlaces} />}
        {tab === "calendar"  && <CalendarView slots={slots} setSlots={setSlots} />}
        {tab === "analytics" && <AnalyticsView places={places} />}
      </main>
    </div>
  );
}
