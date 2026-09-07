import { useState } from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";

import type { DomainIssue, MealEvent, VoteValue } from "@/domain/meal";
import { rankMealOptions } from "@/domain/decisionEngine";
import { castVote, confirmDecision } from "@/domain/mealEventActions";

type DecisionOptionsPanelProps = {
  event: MealEvent;
  onSave: (event: MealEvent) => void;
  currentUserId?: string;
};

const VOTES: Array<{ value: VoteValue; label: string; icon: typeof ThumbsUp }> = [
  { value: "support", label: "支持", icon: ThumbsUp },
  { value: "neutral", label: "中立", icon: Check },
  { value: "veto", label: "否决", icon: ThumbsDown },
];

export default function DecisionOptionsPanel({ event, onSave, currentUserId }: DecisionOptionsPanelProps) {
  const initialParticipantId = currentUserId && event.participantIds.includes(currentUserId) ? currentUserId : event.creatorId;
  const [participantId, setParticipantId] = useState(initialParticipantId);
  const [issues, setIssues] = useState<DomainIssue[]>([]);
  const options = rankMealOptions(event);
  const isCloudScoped = Boolean(currentUserId);
  const canConfirm = !isCloudScoped || currentUserId === event.creatorId;
  const apply = (result: { event: MealEvent; issues: DomainIssue[] }) => {
    setIssues(result.issues);
    if (result.issues.length === 0) onSave(result.event);
  };

  if (event.status !== "deciding") return null;

  return (
    <section className="mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">规则推荐方案</h2>
        <p className="mt-1 text-sm text-muted-foreground">以下是规则计算的前三方案；缺失数据统一按中性分处理。</p>
      </div>
      {issues.length > 0 && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{issues[0].message}</p>}
      {!isCloudScoped && <div className="flex flex-wrap gap-2" role="group" aria-label="选择投票成员">
        {event.participants.map((participant) => <button key={participant.id} type="button" aria-pressed={participant.id === participantId} onClick={() => setParticipantId(participant.id)} className={`min-h-11 rounded-xl px-3 text-sm font-medium ${participant.id === participantId ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{participant.displayName}</button>)}
      </div>}
      {options.length === 0 && <p className="rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">尚不足以生成方案；请回到收集资料补充时间与候选。</p>}
      <div className="grid gap-4">
        {options.map((option, index) => {
          const candidate = event.candidates.find((item) => item.id === option.candidateId);
          const vetoed = event.votes.some((vote) => vote.candidateId === option.candidateId && vote.value === "veto");
          return <article key={`${option.candidateId}-${option.date}-${option.mealPeriod}`} className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold text-primary">方案 {index + 1} · {option.totalScore} 分</p><h3 className="mt-1 text-lg font-semibold text-foreground">{candidate?.name ?? option.candidateId}</h3><p className="mt-1 text-sm text-muted-foreground">{option.date} · {periodLabel(option.mealPeriod)}</p></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${option.readyToConfirm && !vetoed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{option.readyToConfirm && !vetoed ? "可确认" : "待协调"}</span>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-foreground">{option.reasons.map((reason) => <li key={reason}>· {reason}</li>)}</ul>
            {option.conflicts.length > 0 && <ul className="mt-3 space-y-1 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">{option.conflicts.map((conflict) => <li key={conflict}>· {conflict}</li>)}</ul>}
            {vetoed && <p className="mt-3 text-sm text-destructive">已有成员否决，不能确认。</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {VOTES.map((vote) => { const Icon = vote.icon; return <button key={vote.value} type="button" aria-label={`${vote.label} ${candidate?.name ?? option.candidateId}`} onClick={() => apply(castVote(event, { participantId, candidateId: option.candidateId, value: vote.value }))} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-foreground hover:bg-secondary"><Icon className="h-4 w-4" aria-hidden="true" />{vote.label}</button>; })}
              {canConfirm && <button type="button" aria-label={`确认 ${candidate?.name ?? option.candidateId}`} disabled={!option.readyToConfirm || vetoed} onClick={() => apply(confirmDecision(event, option))} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-45">确认</button>}
            </div>
          </article>;
        })}
      </div>
    </section>
  );
}

function periodLabel(period: "lunch" | "afternoon" | "dinner"): string {
  return ({ lunch: "午餐", afternoon: "下午茶", dinner: "晚餐" })[period];
}
