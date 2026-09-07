import { Copy, Link2, RotateCcw } from "lucide-react";
import { useState } from "react";

type MealInvitePanelProps = {
  eventId: string;
  isCreator: boolean;
  appUrl: string;
  repository: {
    createShareUrl(eventId: string, appUrl: string): Promise<string>;
  };
};

export default function MealInvitePanel({ eventId, isCreator, appUrl, repository }: MealInvitePanelProps) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  if (!isCreator) return null;

  const createInvite = async () => {
    setStatus("loading");
    try {
      setInviteUrl(await repository.createShareUrl(eventId, appUrl));
      setCopyStatus("idle");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const copyInvite = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
      <div className="flex items-start gap-3">
        <Link2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">邀请朋友加入</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">链接仅分享给受邀朋友；轮换后旧链接会立即失效。</p>
          {inviteUrl && (
            <>
              <input
                aria-label="饭局邀请链接"
                readOnly
                value={inviteUrl}
                className="mt-3 min-h-10 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground"
              />
              <button
                type="button"
                onClick={() => { void copyInvite(); }}
                className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-background"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                复制邀请链接
              </button>
              {copyStatus === "copied" && <p className="mt-2 text-xs text-primary" role="status">邀请链接已复制</p>}
              {copyStatus === "error" && <p className="mt-2 text-xs text-destructive" role="alert">复制失败，请手动复制链接</p>}
            </>
          )}
          {status === "error" && <p className="mt-3 text-xs text-destructive" role="alert">生成邀请链接失败，请稍后重试</p>}
          <button
            type="button"
            onClick={() => { void createInvite(); }}
            disabled={status === "loading"}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
          >
            {inviteUrl ? <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
            {status === "loading" ? "生成中…" : inviteUrl ? "轮换邀请链接" : "生成邀请链接"}
          </button>
        </div>
      </div>
    </section>
  );
}
