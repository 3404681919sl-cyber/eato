import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";

import type { DomainIssue, MealEvent } from "@/domain/meal";
import {
  addManualCandidate,
  beginDecision,
  setParticipantAvailability,
  updateParticipantPreferences,
} from "@/domain/mealCollectionActions";

type MealCollectionPanelProps = {
  event: MealEvent;
  onSave: (event: MealEvent) => void;
  currentUserId?: string;
};

const PERIODS = [
  { id: "lunch", label: "午餐" },
  { id: "afternoon", label: "下午茶" },
  { id: "dinner", label: "晚餐" },
] as const;

export default function MealCollectionPanel({ event, onSave, currentUserId }: MealCollectionPanelProps) {
  const initialParticipantId = currentUserId && event.participantIds.includes(currentUserId) ? currentUserId : event.creatorId;
  const [participantId, setParticipantId] = useState(initialParticipantId);
  const [preferenceDraft, setPreferenceDraft] = useState(() => toPreferenceDraft(event.preferences[initialParticipantId]));
  const [issues, setIssues] = useState<DomainIssue[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateTags, setCandidateTags] = useState("");
  const [candidatePrice, setCandidatePrice] = useState("");
  const dates = useMemo(() => dateRange(event.candidateDateRange.start, event.candidateDateRange.end), [event.candidateDateRange]);
  const profile = event.preferences[participantId];
  const isCloudScoped = Boolean(currentUserId);
  const canManageMeal = !isCloudScoped || currentUserId === event.creatorId;

  const apply = (result: { event: MealEvent; issues: DomainIssue[] }) => {
    setIssues(result.issues);
    if (result.issues.length === 0) onSave(result.event);
  };
  const isAvailable = (date: string, mealPeriod: "lunch" | "afternoon" | "dinner") => (
    event.availabilities.some((slot) => slot.participantId === participantId && slot.date === date && slot.mealPeriod === mealPeriod)
  );
  const savePreferences = () => {
    apply(updateParticipantPreferences(event, participantId, {
      ...defaultPreference(event),
      ...profile,
      likedCuisines: preferenceDraft.likedCuisines.split(","),
      dislikedCuisines: preferenceDraft.dislikedCuisines.split(","),
      taboos: preferenceDraft.taboos.split(","),
    }));
  };
  const selectParticipant = (nextParticipantId: string) => {
    setParticipantId(nextParticipantId);
    setPreferenceDraft(toPreferenceDraft(event.preferences[nextParticipantId]));
  };
  const addCandidate = () => {
    apply(addManualCandidate(event, {
      id: crypto.randomUUID(),
      name: candidateName,
      cuisineTags: candidateTags.split(","),
      ...(candidatePrice ? { pricePerPerson: Number(candidatePrice) } : {}),
    }));
    if (candidateName.trim() && candidateTags.trim()) {
      setCandidateName("");
      setCandidateTags("");
      setCandidatePrice("");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {issues.length > 0 && <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{issues[0].message}</p>}
      <section className="rounded-2xl border border-border p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground">{isCloudScoped ? "填写我的资料" : "代填成员资料"}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{isCloudScoped ? "成员之间可见时间、预算和忌口；云端只会保存你自己的资料。" : "所有资料仅保存在本设备，成员之间可见时间、预算和忌口。"}</p>
        {!isCloudScoped && <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="选择代填成员">
          {event.participants.map((participant) => (
            <button key={participant.id} type="button" aria-pressed={participant.id === participantId} onClick={() => selectParticipant(participant.id)}
              className={`min-h-11 rounded-xl px-3 text-sm font-medium ${participant.id === participantId ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"}`}>
              {participant.displayName}
            </button>
          ))}
        </div>}
        <p className="mt-4 text-sm font-medium text-foreground">{isCloudScoped ? "正在填写：" : "正在代填："}{event.participants.find((participant) => participant.id === participantId)?.displayName}</p>
        <div className="mt-3 space-y-3">
          {dates.map((date) => (
            <div key={date} className="flex flex-wrap items-center gap-2">
              <span className="w-24 text-xs font-medium text-muted-foreground">{date}</span>
              {PERIODS.map((period) => {
                const available = isAvailable(date, period.id);
                return (
                  <button key={period.id} type="button" aria-label={`${date} ${period.label}`} aria-pressed={available} onClick={() => apply(setParticipantAvailability(event, {
                    participantId, date, mealPeriod: period.id, available: !available,
                  }))}
                    className={`min-h-11 rounded-xl border px-3 text-sm transition-colors ${available ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {available && <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />}{period.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <TextField label="喜欢菜系" value={preferenceDraft.likedCuisines} onChange={(value) => setPreferenceDraft((current) => ({ ...current, likedCuisines: value }))} />
          <TextField label="不喜欢菜系" value={preferenceDraft.dislikedCuisines} onChange={(value) => setPreferenceDraft((current) => ({ ...current, dislikedCuisines: value }))} />
          <TextField label="忌口" value={preferenceDraft.taboos} onChange={(value) => setPreferenceDraft((current) => ({ ...current, taboos: value }))} />
          <button type="button" onClick={savePreferences} className="min-h-11 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary">保存偏好</button>
        </div>
      </section>

      {/* §3: 候选方案 — 所有成员可见，成员之间共享候选列表 */}
      {event.candidates.length > 0 && (
        <section className="rounded-2xl border border-border p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">候选方案</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-foreground">
            {event.candidates.map((candidate) => (
              <li key={candidate.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{candidate.name}</span>
                {candidate.cuisineTags.length > 0 && <span className="text-xs text-muted-foreground">（{candidate.cuisineTags.join("、")}）</span>}
                {candidate.pricePerPerson != null && <span className="text-xs text-muted-foreground">¥{candidate.pricePerPerson}/人</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* §4: 成员进度 — 所有成员可见（不含邮箱 / auth uid 等敏感信息） */}
      <section className="rounded-2xl border border-border p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground">成员进度</h2>
        <ul className="mt-3 divide-y divide-border">
          {event.participants.map((participant) => {
            const hasAvailability = event.availabilities.some((slot) => slot.participantId === participant.id);
            const preference = event.preferences[participant.id];
            // "已提供口味" counts only real cuisine input (liked/disliked/taboos).
            // A default budget does NOT count as a filled preference.
            const hasCuisine = Boolean(preference && (preference.likedCuisines.length > 0 || preference.dislikedCuisines.length > 0 || preference.taboos.length > 0));
            return (
              <li key={participant.id} className="py-2 text-sm">
                <span className="font-medium text-foreground">{participant.displayName}</span>
                {participant.role === "creator" && <span className="ml-1 text-xs text-muted-foreground">（创建者）</span>}
                <span className="ml-2 text-muted-foreground">{hasAvailability ? "✓ 已选时间" : "○ 未选时间"} · {hasCuisine ? "✓ 已提供口味" : "○ 未提供口味"}</span>
                {preference && preference.likedCuisines.length > 0 && <span className="ml-2 text-xs text-muted-foreground">喜欢：{preference.likedCuisines.join("、")}</span>}
                {preference && preference.taboos.length > 0 && <span className="ml-2 text-xs text-muted-foreground">忌口：{preference.taboos.join("、")}</span>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* §3 + §6: 人工候选添加与生成方案 — 仅创建者可操作，成员只能查看上方候选列表 */}
      {canManageMeal && <section className="rounded-2xl border border-border p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground">人工候选</h2>
        <p className="mt-1 text-xs text-muted-foreground">当前不接入外部餐厅或优惠数据，请手动填写候选。</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <TextField label="候选名称" value={candidateName} onChange={setCandidateName} />
          <TextField label="菜系标签" hint="用逗号分隔" value={candidateTags} onChange={setCandidateTags} />
          <TextField label="人均消费" hint="可选" type="number" value={candidatePrice} onChange={setCandidatePrice} />
        </div>
        <button type="button" onClick={addCandidate} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/40 px-4 text-sm font-semibold text-primary hover:bg-primary/5">
          <Plus className="h-4 w-4" aria-hidden="true" />添加人工候选
        </button>
      </section>}

      {canManageMeal && event.status === "collecting" && <button type="button" onClick={() => apply(beginDecision(event))} className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
        生成规则方案
      </button>}
    </div>
  );
}

function toPreferenceDraft(profile: MealEvent["preferences"][string] | undefined) {
  return {
    likedCuisines: profile?.likedCuisines.join(", ") ?? "",
    dislikedCuisines: profile?.dislikedCuisines.join(", ") ?? "",
    taboos: profile?.taboos.join(", ") ?? "",
  };
}

function defaultPreference(event: MealEvent) {
  return {
    likedCuisines: [],
    dislikedCuisines: [],
    taboos: [],
    budget: { ...event.budget },
    isFlexible: true,
  };
}

function TextField({ label, hint, type = "text", value, onChange }: { label: string; hint?: string; type?: "text" | "number"; value: string; onChange: (value: string) => void }) {
  const id = `meal-${label}`;
  return <div>
    <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor={id}>{label}{hint && <span className="ml-1 text-muted-foreground">{hint}</span>}</label>
    <input id={id} type={type} min={type === "number" ? "0" : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
  </div>;
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${start}T12:00:00.000Z`);
  const last = new Date(`${end}T12:00:00.000Z`);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}
