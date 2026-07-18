import React from "react";
import { Info, ExternalLink, Github } from "lucide-react";
import { APP_NAME, APP_TAGLINE, BRAND } from "../../constants";

export default function AboutSection() {
  return (
    <div className="bg-card border border-border rounded-2xl px-6 py-6 space-y-6">
      {/* App info */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: BRAND.primary }}>
          <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>E</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{APP_NAME}</h3>
          <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>v1.0.0</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed px-1">
        和朋友一起打卡收藏的餐厅，安排聚餐时间，分析消费习惯。让每一顿都值得期待。
      </p>

      {/* Tech stack */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">技术栈</p>
        <div className="flex flex-wrap gap-2">
          {["React 18", "TypeScript", "Tailwind 4", "Vite 6", "Express", "Recharts"].map((tech) => (
            <span key={tech}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2 pt-2 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">相关链接</p>
        <div className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-4 h-4" />
            GitHub 仓库
            <ExternalLink className="w-3 h-3 ml-auto" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground/50 text-center pt-2">
        &copy; 2026 {APP_NAME}. All rights reserved.
      </p>
    </div>
  );
}
