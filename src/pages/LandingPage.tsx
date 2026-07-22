import { MapPin, LogIn, ArrowRight, Sparkles, Utensils, Calendar, BarChart2 } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const photos = [
    "https://loremflickr.com/400/500/restaurant?lock=2",
    "https://loremflickr.com/400/500/ramen?lock=5",
    "https://loremflickr.com/400/500/sushi?lock=3",
    "https://loremflickr.com/400/500/coffee?lock=4",
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
          onClick={onStart}
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
              <img
                src={src} alt="" className="w-full h-full object-cover opacity-30"
                style={{ filter: "saturate(0.6)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          ))}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0805] via-[#0C0805]/60 to-[#0C0805]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0805] via-transparent to-[#0C0805]/80" />
        </div>

        <div className="relative max-w-6xl mx-auto px-10 pt-24 pb-16">
          <div className="max-w-xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: "#BF4E2A25", border: "1px solid #BF4E2A50", color: "#E8963C" }}
            >
              <Sparkles className="w-3 h-3" />
              为热爱美食的你们而生
            </div>

            <h1
              className="text-[88px] font-bold leading-none mb-4 tracking-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Eato
            </h1>
            <p
              className="text-xl text-white/60 leading-relaxed mb-3"
              style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic" }}
            >
              和朋友一起发现、打卡、记录
            </p>
            <p className="text-base text-white/40 leading-relaxed mb-10">
              共享打卡清单 · 智能时间协调 · 美食数据洞察
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={onStart}
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
            { n: "98%", label: "约饭成功率" },
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
          <div
            key={title}
            className="rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors"
            style={{ backgroundColor: "#ffffff08" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: color + "25", color }}>
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
          onClick={onStart}
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
