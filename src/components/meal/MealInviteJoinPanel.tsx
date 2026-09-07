import { Users } from "lucide-react";
import { useState } from "react";

type MealInviteJoinPanelProps = {
  appUrl: string;
  repository: {
    join(appUrl: string, displayName: string): Promise<string>;
  };
  onJoined(eventId: string): void;
};

export default function MealInviteJoinPanel({ appUrl, repository, onJoined }: MealInviteJoinPanelProps) {
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "joining" | "joined" | "error">("idle");
  const [error, setError] = useState("");

  const join = async () => {
    setStatus("joining");
    setError("");
    try {
      const eventId = await repository.join(appUrl, displayName);
      setStatus("joined");
      onJoined(eventId);
    } catch (joinError) {
      setStatus("error");
      setError(joinError instanceof Error ? joinError.message : "加入饭局失败，请稍后重试");
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
      <Users className="h-8 w-8 text-primary" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>加入饭局</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">请输入在这场饭局中使用的昵称。加入后你只能编辑自己的时间、偏好和投票。</p>
      <label className="mt-5 block text-sm font-medium text-foreground" htmlFor="invite-display-name">加入饭局时使用的昵称</label>
      <input
        id="invite-display-name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
        placeholder="例如：小美"
      />
      {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
      {status === "joined" && <p className="mt-3 text-sm text-primary" role="status">已加入饭局，正在打开…</p>}
      <button
        type="button"
        onClick={() => { void join(); }}
        disabled={status === "joining" || status === "joined"}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-55"
      >
        {status === "joining" ? "加入中…" : "加入饭局"}
      </button>
    </section>
  );
}
