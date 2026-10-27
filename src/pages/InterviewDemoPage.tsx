import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, Users, UtensilsCrossed } from "lucide-react";
import { rankMealOptions, type DecisionOption } from "@/domain/decisionEngine";
import { castVote, confirmDecision } from "@/domain/mealEventActions";
import type { Availability, Candidate, MealEvent, VoteValue } from "@/domain/meal";

const PARTICIPANTS = [
  { id: "demo-mei", displayName: "小美", role: "creator" as const },
  { id: "demo-shuai", displayName: "阿帅", role: "member" as const },
  { id: "demo-hao", displayName: "阿豪", role: "member" as const },
];
const CUISINES = ["火锅", "中餐", "日料"];
const MEAL_PERIOD_LABELS: Record<Availability["mealPeriod"], string> = {
  lunch: "午餐",
  afternoon: "下午茶",
  dinner: "晚餐",
};
const CANDIDATES: Candidate[] = [
  { id: "demo-hotpot", eventId: "interview-demo", name: "微光火锅（虚构）", kind: "restaurant", cuisineTags: ["火锅"], pricePerPerson: 132, offers: [] },
  { id: "demo-chinese", eventId: "interview-demo", name: "南城小馆（虚构）", kind: "restaurant", cuisineTags: ["中餐"], pricePerPerson: 98, offers: [] },
  { id: "demo-japanese", eventId: "interview-demo", name: "木町食堂（虚构）", kind: "restaurant", cuisineTags: ["日料"], pricePerPerson: 122, offers: [] },
];

function dateAfter(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() + days);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return [y, m, d].join("-");
}

function createDemoEvent(): MealEvent {
  const date1 = dateAfter(2);
  const date2 = dateAfter(3);
  const now = new Date().toISOString();
  return {
    id: "interview-demo",
    title: "周末一起吃什么？",
    city: "广州",
    area: "天河区",
    budget: { min: 80, max: 160 },
    candidateDateRange: { start: date1, end: date2 },
    participantIds: PARTICIPANTS.map((p) => p.id),
    creatorId: PARTICIPANTS[0].id,
    status: "deciding",
    participants: [...PARTICIPANTS],
    availabilities: [
      { participantId: PARTICIPANTS[0].id, date: date1, mealPeriod: "dinner" },
      { participantId: PARTICIPANTS[0].id, date: date2, mealPeriod: "lunch" },
      { participantId: PARTICIPANTS[1].id, date: date1, mealPeriod: "dinner" },
      { participantId: PARTICIPANTS[1].id, date: date2, mealPeriod: "dinner" },
      { participantId: PARTICIPANTS[2].id, date: date1, mealPeriod: "dinner" },
      { participantId: PARTICIPANTS[2].id, date: date2, mealPeriod: "dinner" },
    ],
    preferences: {
      [PARTICIPANTS[0].id]: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 160 }, isFlexible: true },
      [PARTICIPANTS[1].id]: { likedCuisines: ["火锅"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 160 }, isFlexible: true },
      [PARTICIPANTS[2].id]: { likedCuisines: ["中餐"], dislikedCuisines: [], taboos: [], budget: { min: 80, max: 160 }, isFlexible: true },
    },
    candidates: CANDIDATES.map((c) => ({ ...c, cuisineTags: [...c.cuisineTags], offers: [] })),
    votes: [],
    createdAt: now,
    updatedAt: now,
  };
}

function optionKey(option: DecisionOption): string {
  return [option.candidateId, option.date, option.mealPeriod].join("|");
}

export default function InterviewDemoPage() {
  const [event, setEvent] = useState<MealEvent>(createDemoEvent);
  const [selectedMember, setSelectedMember] = useState(PARTICIPANTS[0].id);
  const [message, setMessage] = useState("");
  const options = useMemo(() => rankMealOptions(event), [event]);
  const dates = [event.candidateDateRange.start, event.candidateDateRange.end];
  const selectedProfile = event.preferences[selectedMember];
  const confirmedCandidate = CANDIDATES.find((c) => c.id === event.decision?.candidateId);
  const hasConfirmed = event.status === "confirmed";

  const resetDemo = () => {
    setEvent(createDemoEvent());
    setSelectedMember(PARTICIPANTS[0].id);
    setMessage("");
  };

  const toggleAvailability = (date: string, period: Availability["mealPeriod"]) => {
    if (hasConfirmed) return;
    setMessage("");
    setEvent((current) => {
      const exists = current.availabilities.some((a) =>
        a.participantId === selectedMember && a.date === date && a.mealPeriod === period
      );
      const availabilities = current.availabilities.filter((a) =>
        !(a.participantId === selectedMember && a.date === date && a.mealPeriod === period)
      );
      if (!exists) availabilities.push({ participantId: selectedMember, date, mealPeriod: period });
      return { ...current, availabilities, updatedAt: new Date().toISOString() };
    });
  };

  const changeCuisine = (cuisine: string) => {
    if (hasConfirmed) return;
    setMessage("");
    setEvent((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [selectedMember]: { ...current.preferences[selectedMember], likedCuisines: [cuisine] },
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const vote = (candidateId: string, value: VoteValue) => {
    const result = castVote(event, { participantId: selectedMember, candidateId, value });
    setMessage(result.issues[0]?.message ?? "");
    if (result.issues.length === 0) setEvent(result.event);
  };

  const confirm = (option: DecisionOption) => {
    const result = confirmDecision(event, option);
    setMessage(result.issues[0]?.message ?? "");
    if (result.issues.length === 0) setEvent(result.event);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">E</div>
            <span className="text-xl font-bold">Eato</span>
            <span className="ml-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">产品面试 · 交互演示</span>
          </div>
          <button type="button" onClick={resetDemo} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">
            <RefreshCw className="h-4 w-4" />重新体验
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-7 px-5 py-8 sm:py-10">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Product case · Interactive MVP</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: "Playfair Display, serif" }}>三个人的饭局，不用再在群里反复接龙</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            从共同空闲时间、口味与预算出发，生成可解释的约饭推荐，再通过成员投票确定方案。无需登录，约 1–2 分钟即可完整体验核心决策闭环。
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-secondary px-3 py-1.5"><Users className="mr-1 inline h-3.5 w-3.5" />3 位模拟成员</span>
            <span className="rounded-full bg-secondary px-3 py-1.5"><Clock3 className="mr-1 inline h-3.5 w-3.5" />共同时间计算</span>
            <span className="rounded-full bg-secondary px-3 py-1.5"><UtensilsCrossed className="mr-1 inline h-3.5 w-3.5" />可解释规则排序</span>
          </div>
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
            体验说明：本页面使用虚构成员、商家和参考价格，在浏览器内模拟交互；不会同步给真实好友。推荐基于规则模型，并非大模型输出；不提供真实餐厅实时报价。无需提供任何个人信息。
          </p>
        </section>

        {hasConfirmed ? (
          <section className="rounded-3xl border border-emerald-200 bg-card p-7 shadow-sm sm:p-9" aria-label="约饭确认结果">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
              <h2 className="text-2xl font-bold">方案已确认</h2>
            </div>
            <p className="mt-4 text-xl font-semibold">{confirmedCandidate?.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.decision?.selectedDate} · {event.decision ? MEAL_PERIOD_LABELS[event.decision.mealPeriod] : ""}
              {" · "}人均参考 ¥{confirmedCandidate?.pricePerPerson}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {event.decision?.reasoning}。至此完成「收集条件 → 推荐方案 → 参与投票 → 确认结果」的演示闭环。
            </p>
            <button type="button" onClick={resetDemo} className="mt-6 min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
              再体验一次
            </button>
          </section>
        ) : (
          <>
            <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold">01 · 谁什么时候有空？</h2>
                  <span className="text-xs text-muted-foreground">点击切换参与者与时段</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="选择成员">
                  {PARTICIPANTS.map((participant) => (
                    <button type="button" key={participant.id} aria-pressed={selectedMember === participant.id} onClick={() => setSelectedMember(participant.id)}
                      className={selectedMember === participant.id ? "min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" : "min-h-11 rounded-xl bg-secondary px-4 text-sm font-semibold text-foreground hover:opacity-75"}>
                      {participant.displayName}
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {dates.map((date) => (
                    <div key={date} className="flex flex-wrap items-center gap-2">
                      <span className="w-24 text-sm font-semibold">{date.slice(5)}</span>
                      {(["lunch", "afternoon", "dinner"] as const).map((period) => {
                        const active = event.availabilities.some((a) => a.participantId === selectedMember && a.date === date && a.mealPeriod === period);
                        return (
                          <button type="button" key={period} aria-label={date + " " + MEAL_PERIOD_LABELS[period]} aria-pressed={active} onClick={() => toggleAvailability(date, period)}
                            className={active ? "min-h-10 rounded-lg border border-primary bg-primary/10 px-3 text-xs font-semibold text-primary" : "min-h-10 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:border-primary"}>
                            {active ? "✓ " : ""}{MEAL_PERIOD_LABELS[period]}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold">02 · 每个人想吃什么？</h2>
                <p className="mt-2 text-sm text-muted-foreground">正在编辑：{PARTICIPANTS.find((p) => p.id === selectedMember)?.displayName}。修改后推荐会重新排序。</p>
                <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="选择喜欢的菜系">
                  {CUISINES.map((cuisine) => (
                    <button type="button" key={cuisine} aria-pressed={selectedProfile?.likedCuisines.includes(cuisine) ?? false} onClick={() => changeCuisine(cuisine)}
                      className={selectedProfile?.likedCuisines.includes(cuisine) ? "min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground" : "min-h-11 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-secondary"}>
                      {cuisine}
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded-xl bg-secondary/60 p-4">
                  <p className="text-sm font-semibold">候选餐厅（均为虚构演示数据）</p>
                  {CANDIDATES.map((candidate) => (
                    <p key={candidate.id} className="mt-2 flex justify-between gap-3 text-sm">
                      <span>{candidate.name}</span><span className="shrink-0 text-muted-foreground">参考 ¥{candidate.pricePerPerson}/人</span>
                    </p>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold">03 · 共同决策与确认</h2>
                  <p className="mt-2 text-sm text-muted-foreground">基于当前时间、口味和预算进行规则计算。选择上面的不同成员后，可分别支持或否决候选。</p>
                </div>
                <span className="text-xs text-muted-foreground">权重：时间 35% · 口味 25% · 预算 15% · 距离 15% · 历史 10%</span>
              </div>
              {message && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
              {options.length === 0 && <p className="mt-5 rounded-xl bg-secondary p-4 text-sm">没有可计算的时间方案，请返回上方为成员选择时段。</p>}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {options.map((option, index) => {
                  const candidate = CANDIDATES.find((c) => c.id === option.candidateId);
                  const voteValue = event.votes.find((v) => v.participantId === selectedMember && v.candidateId === option.candidateId)?.value;
                  const vetoed = event.votes.some((v) => v.candidateId === option.candidateId && v.value === "veto");
                  return (
                    <article key={optionKey(option)} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex justify-between gap-2">
                        <span className="text-xs font-bold text-primary">推荐 {index + 1}</span>
                        <span className="text-xs font-bold">{option.totalScore} / 100</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{candidate?.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{option.date} · {MEAL_PERIOD_LABELS[option.mealPeriod]}</p>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">时间匹配 {option.scoreBreakdown.time}% · 口味 {option.scoreBreakdown.cuisine}% · 预算 {option.scoreBreakdown.budget}%</p>
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">{option.reasons.join("；")}</p>
                      {option.conflicts.length > 0 && <p className="mt-2 text-xs leading-5 text-amber-800">{option.conflicts.join("；")}</p>}
                      <div className="mt-4 flex gap-2">
                        <button type="button" aria-label={"支持 " + candidate?.name} aria-pressed={voteValue === "support"} onClick={() => vote(option.candidateId, "support")}
                          className={voteValue === "support" ? "min-h-10 flex-1 rounded-lg bg-emerald-700 px-2 text-xs font-semibold text-white" : "min-h-10 flex-1 rounded-lg border border-border px-2 text-xs font-semibold hover:bg-secondary"}>
                          支持
                        </button>
                        <button type="button" aria-label={"否决 " + candidate?.name} aria-pressed={voteValue === "veto"} onClick={() => vote(option.candidateId, "veto")}
                          className={voteValue === "veto" ? "min-h-10 flex-1 rounded-lg bg-red-700 px-2 text-xs font-semibold text-white" : "min-h-10 flex-1 rounded-lg border border-border px-2 text-xs font-semibold hover:bg-secondary"}>
                          否决
                        </button>
                      </div>
                      <button type="button" aria-label={"确认 " + candidate?.name} disabled={!option.readyToConfirm || vetoed} onClick={() => confirm(option)}
                        className="mt-2 min-h-11 w-full rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-35">
                        {vetoed ? "有成员否决" : option.readyToConfirm ? "确认这家" : "共同时间未齐"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <footer className="border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
          Eato 面试演示使用真实的项目规则引擎和投票确认逻辑；此页面不调用第三方实时优惠接口，也不代表已经完成真实跨设备协作。
          <a className="ml-2 font-semibold text-primary underline" href="https://github.com/3404681919sl-cyber/eato" target="_blank" rel="noreferrer">查看源代码</a>
        </footer>
      </main>
    </div>
  );
}
