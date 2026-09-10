import { ArrowRight, CalendarClock, Sparkles, Users, Vote } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const CAPABILITIES = [
  {
    icon: Users,
    color: "#BF4E2A",
    title: "大家各填自己的",
    desc: "朋友只需要在自己的手机上勾选有空的时间和口味偏好，不用在群里反复接龙。",
  },
  {
    icon: CalendarClock,
    color: "#E8963C",
    title: "自动找到共同时间",
    desc: "Eato 根据每个人的空闲，算出最多人都能到场的时间段，不用你手动对齐。",
  },
  {
    icon: Vote,
    color: "#16A34A",
    title: "一起选出最终方案",
    desc: "候选店摆出来，大家投票，确认后把时间、地点、人均一次说清。",
  },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground" style={{ fontFamily: "Playfair Display, serif" }}>E</div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "Playfair Display, serif" }}>Eato</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center sm:px-8 sm:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            多人约饭决策助手
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl" style={{ fontFamily: "Playfair Display, serif" }}>
            别再问
            <br />
            <span className="italic text-primary">“你们什么时候都有空？”</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            时间和口味大家各自填写，Eato 帮你们汇总成共同方案。
          </p>
          <div className="mt-9 flex justify-center">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
            >
              发起一次约饭
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}1a`, color }}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border bg-card/50 px-5 py-16 text-center sm:px-8">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl" style={{ fontFamily: "Playfair Display, serif" }}>这一顿饭，从一次邀请开始</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">不用建群接龙，不用反复确认。发起饭局，把链接发给朋友就好。</p>
        <button
          onClick={onStart}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          发起一次约饭
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-10 text-xs text-muted-foreground">© 2026 Eato · 和朋友一起约饭</p>
      </section>
    </div>
  );
}
