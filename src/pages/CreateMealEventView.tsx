import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, Minus, Plus, Users, Wallet } from "lucide-react";

import { MAX_SIMULATED_PARTICIPANTS } from "@/domain/meal";
import type { DomainIssue, MealEvent } from "@/domain/meal";
import type { MealEventRepository } from "@/services/mealEventRepository";
import {
  createCloudMealEvent,
  createMealEvent,
  type CreateMealEventInput,
  type SimulatedParticipantInput,
} from "@/services/mealEventFactory";

type SubmitStatus = "idle" | "saving" | "success" | "error";

type CreateMealEventViewProps = {
  repository: MealEventRepository;
  onCreated?: (event: MealEvent) => void;
  mode?: "local" | "cloud";
  cloudCreatorId?: string;
  developerMode?: boolean;
};

function getDateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createInitialInput(): CreateMealEventInput {
  return {
    title: "",
    city: "",
    area: "",
    budget: { min: 50, max: 100 },
    candidateDateRange: { start: getDateAfter(0), end: getDateAfter(7) },
    participants: [
      { displayName: "发起人" },
      { displayName: "朋友 1" },
      { displayName: "朋友 2" },
    ],
  };
}

export default function CreateMealEventView({
  repository,
  onCreated,
  mode = "local",
  cloudCreatorId,
  developerMode = false,
}: CreateMealEventViewProps) {
  const [input, setInput] = useState<CreateMealEventInput>(createInitialInput);
  const [issues, setIssues] = useState<DomainIssue[]>([]);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const submittedRef = useRef(false);
  const fieldsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const isCloudMode = mode === "cloud";

  useEffect(() => {
    const firstField = issues[0]?.field;
    fieldsRef.current[firstField]?.focus();
  }, [issues]);

  const findIssue = (field: string) => issues.find((issue) => issue.field === field)?.message;
  const validate = () => {
    const result = createMealEvent(input);
    setIssues(result.issues);
    return result;
  };
  const updateParticipant = (index: number, patch: Partial<SimulatedParticipantInput>) => {
    setInput((current) => ({
      ...current,
      participants: current.participants.map((participant, participantIndex) => (
        participantIndex === index ? { ...participant, ...patch } : participant
      )),
    }));
    setSubmitStatus("idle");
  };
  const removeParticipant = (index: number) => {
    setInput((current) => ({
      ...current,
      participants: current.participants.filter((_, participantIndex) => participantIndex !== index),
    }));
    setSubmitStatus("idle");
  };
  const addParticipant = () => {
    setInput((current) => ({
      ...current,
      participants: [...current.participants, { displayName: `朋友 ${current.participants.length - 1}` }],
    }));
    setSubmitStatus("idle");
  };
  const setFieldRef = (field: string) => (element: HTMLInputElement | null) => {
    fieldsRef.current[field] = element;
  };
  const updateValue = <K extends keyof CreateMealEventInput>(key: K, value: CreateMealEventInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
    setSubmitStatus("idle");
  };
  const updateBudget = (key: "min" | "max", value: string) => {
    updateValue("budget", { ...input.budget, [key]: Number(value) });
  };
  const updateDateRange = (key: "start" | "end", value: string) => {
    updateValue("candidateDateRange", { ...input.candidateDateRange, [key]: value });
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittedRef.current) return;

    const result = mode === "cloud" && cloudCreatorId
      ? createCloudMealEvent({
        title: input.title,
        city: input.city,
        area: input.area,
        budget: input.budget,
        candidateDateRange: input.candidateDateRange,
        creator: { id: cloudCreatorId, displayName: input.participants[0]?.displayName ?? "访客" },
      })
      : validate();
    if (!result.event) return;

    submittedRef.current = true;
    setSubmitStatus("saving");
    try {
      await repository.create(result.event);
      setSubmitStatus("success");
      onCreated?.(result.event);
    } catch {
      submittedRef.current = false;
      setSubmitStatus("error");
    }
  };

  return (
    <section className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          {developerMode ? (isCloudMode ? "云端协作" : "本设备练习") : (isCloudMode ? "邀请朋友一起填写" : "先自己试试")}
        </div>
        <h2 className="mt-3 text-3xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
          发起一顿饭
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isCloudMode
            ? (developerMode ? "创建后会保存到云端。当前先创建你本人，后续可邀请成员。" : "创建后即可邀请朋友。后续把链接发给朋友，他们填时间和口味。")
            : (developerMode ? "先在设备上本地练习：添加朋友、填写时间和偏好。这是本地模拟，不接入云端，无法真正邀请朋友。" : "先在设备上练习：添加朋友、填写时间和偏好。")}
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <legend className="px-2 text-sm font-semibold text-foreground">饭局信息</legend>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="饭局名称" inputId="meal-title" error={findIssue("title")}>
              <input
                ref={setFieldRef("title")}
                id="meal-title"
                aria-invalid={Boolean(findIssue("title"))}
                aria-describedby={findIssue("title") ? "title-error" : undefined}
                value={input.title}
                onChange={(event) => updateValue("title", event.target.value)}
                onBlur={validate}
                placeholder="例如：周五火锅局"
                className={inputClassName(Boolean(findIssue("title")))}
              />
            </Field>
            <Field label="城市" inputId="meal-city" hint="可稍后补充" error={findIssue("city")}>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  id="meal-city"
                  value={input.city}
                  onChange={(event) => updateValue("city", event.target.value)}
                  placeholder="例如：上海"
                  className={`${inputClassName(false)} pl-9`}
                />
              </div>
            </Field>
            <Field label="区域" inputId="meal-area" hint="可稍后补充" error={findIssue("area")}>
              <input
                id="meal-area"
                value={input.area}
                onChange={(event) => updateValue("area", event.target.value)}
                placeholder="例如：静安区"
                className={inputClassName(false)}
              />
            </Field>
            <Field label="候选日期" error={findIssue("candidateDateRange")}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  ref={setFieldRef("candidateDateRange")}
                  aria-label="候选开始日期"
                  type="date"
                  value={input.candidateDateRange.start}
                  onChange={(event) => updateDateRange("start", event.target.value)}
                  onBlur={validate}
                  className={inputClassName(Boolean(findIssue("candidateDateRange")))}
                />
                <input
                  aria-label="候选结束日期"
                  type="date"
                  value={input.candidateDateRange.end}
                  onChange={(event) => updateDateRange("end", event.target.value)}
                  onBlur={validate}
                  className={inputClassName(Boolean(findIssue("candidateDateRange")))}
                />
              </div>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="人均预算（元）" error={findIssue("budget")}>
              <div className="grid max-w-sm grid-cols-2 gap-2">
                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    ref={setFieldRef("budget")}
                    aria-label="最低人均预算"
                    type="number"
                    min="0"
                    value={input.budget.min}
                    onChange={(event) => updateBudget("min", event.target.value)}
                    onBlur={validate}
                    className={`${inputClassName(Boolean(findIssue("budget")))} pl-9`}
                  />
                </div>
                <input
                  aria-label="最高人均预算"
                  type="number"
                  min="0"
                  value={input.budget.max}
                  onChange={(event) => updateBudget("max", event.target.value)}
                  onBlur={validate}
                  className={inputClassName(Boolean(findIssue("budget")))}
                />
              </div>
            </Field>
          </div>
        </fieldset>

        {!isCloudMode && (
        <fieldset className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <legend className="px-2 text-sm font-semibold text-foreground">饭局成员（3–8 人）</legend>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">发起人可先代填，后续再为每位成员收集时间和饮食偏好。</p>
          <div className="mt-4 space-y-3">
            {input.participants.map((participant, index) => {
              const field = `participants.${index}.displayName`;
              const error = findIssue(field);
              return (
                <div key={`${index}-${participant.displayName}`} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-foreground" htmlFor={`participant-${index}`}>
                      成员 {index + 1} 昵称{index === 0 ? "（发起人）" : ""}
                    </label>
                    <input
                      ref={setFieldRef(field)}
                      id={`participant-${index}`}
                      aria-label={`成员 ${index + 1} 昵称`}
                      aria-invalid={Boolean(error)}
                      value={participant.displayName}
                      onChange={(event) => updateParticipant(index, { displayName: event.target.value })}
                      onBlur={validate}
                      className={inputClassName(Boolean(error))}
                    />
                    {error && <p className="mt-1.5 text-xs text-destructive" role="alert">{error}</p>}
                  </div>
                  {input.participants.length > 3 && (
                    <button
                      type="button"
                      aria-label={`移除成员 ${index + 1}`}
                      onClick={() => removeParticipant(index)}
                      className="mt-6 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Minus className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addParticipant}
            disabled={input.participants.length >= MAX_SIMULATED_PARTICIPANTS}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-primary/40 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            添加成员
          </button>
        </fieldset>
        )}

        {submitStatus === "error" && (
          <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {isCloudMode ? "云端保存失败，请稍后重试" : "本地保存失败，请稍后重试"}
          </p>
        )}
        {submitStatus === "success" && (
          <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground" role="status">
            {isCloudMode ? "饭局已创建，邀请朋友加入吧！" : "饭局已创建（本地练习）。"}
          </p>
        )}

        <button
          type="submit"
          disabled={submitStatus === "saving" || submitStatus === "success"}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
        >
          <CalendarDays className="w-4 h-4" aria-hidden="true" />
          {submitStatus === "saving" ? "创建中…" : (isCloudMode ? "创建并邀请朋友" : "创建饭局")}
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  inputId,
  hint,
  error,
  children,
}: {
  label: string;
  inputId?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium text-foreground" htmlFor={inputId}>{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p id={label === "饭局名称" ? "title-error" : undefined} className="mt-1.5 text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}

function inputClassName(hasError: boolean): string {
  return `min-h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/30 ${
    hasError ? "border-destructive" : "border-border"
  }`;
}
