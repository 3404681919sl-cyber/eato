import React from "react";
import { Share2, Copy, Check, Users, QrCode } from "lucide-react";

export default function InvitePage({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const inviteCode = "EATO-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const inviteLink = `https://eato.app/invite/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#BF4E2A15" }}>
          <Users className="w-7 h-7" style={{ color: "#BF4E2A" }} />
        </div>
        <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          邀请好友加入
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          邀请好友一起打卡美食，安排聚餐时间
        </p>
      </div>

      {/* Invite code */}
      <div className="px-6 pb-4">
        <div className="rounded-xl border-2 border-dashed px-5 py-4 text-center"
          style={{ borderColor: "#BF4E2A30", backgroundColor: "#BF4E2A08" }}>
          <p className="text-xs text-muted-foreground mb-1">你的邀请码</p>
          <p className="text-2xl font-bold tracking-widest" style={{ color: "#BF4E2A", fontFamily: "'DM Mono', monospace" }}>
            {inviteCode}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 space-y-2">
        <button onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: copied ? "#16A34A" : "#BF4E2A", color: "white" }}>
          {copied ? <><Check className="w-4 h-4" /> 已复制链接</> : <><Copy className="w-4 h-4" /> 复制邀请链接</>}
        </button>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          <Share2 className="w-4 h-4" />
          分享给好友
        </button>
      </div>

      {/* Share preview */}
      <div className="px-6 pb-6">
        <div className="rounded-xl bg-secondary px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#BF4E2A" }}>
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">加入我的 Eato 美食计划</p>
              <p className="text-xs text-muted-foreground">一起打卡收藏餐厅</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            我已加入 Eato，邀请你一起来记录美食之旅！
            使用邀请码 <strong style={{ color: "#BF4E2A" }}>{inviteCode}</strong> 加入我的美食小组。
          </p>
        </div>
      </div>
    </div>
  );
}
