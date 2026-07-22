import { useState } from "react";
import {
  Loader2, Zap, ExternalLink, ChevronUp, BadgePercent,
} from "lucide-react";
import type { Category, DealStatus, DealsResult } from "@/types";
import { PLATFORMS } from "@/constants";
import { generateDeals } from "@/data/catalog";

interface DealsPanelProps {
  category: Category;
  placeName: string;
  onClose: () => void;
}

export default function DealsPanel({ category, placeName, onClose }: DealsPanelProps) {
  const [status, setStatus] = useState<DealStatus>("idle");
  const [result, setResult] = useState<DealsResult | null>(null);

  const search = () => {
    setStatus("loading");
    setTimeout(() => {
      setResult(generateDeals(category));
      setStatus("done");
    }, 1600);
  };

  if (status === "idle") {
    return (
      <div className="flex items-center justify-between py-3 px-4">
        <p className="text-xs text-muted-foreground">点击自动检索各平台最新优惠，AI 为你比对最优组合</p>
        <button
          onClick={search}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ backgroundColor: "#BF4E2A", color: "white" }}
        >
          <Zap className="w-3 h-3" />
          开始查询
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="py-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">正在检索美团、抖音、大众点评、淘宝闪购、闲鱼…</span>
        </div>
        <div className="flex gap-2">
          {Object.values(PLATFORMS).map((p, i) => (
            <div
              key={p.name}
              className="text-xs px-2 py-1 rounded-full font-medium animate-pulse"
              style={{ backgroundColor: p.bg, color: p.textColor, animationDelay: `${i * 0.15}s` }}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="py-4 px-4">
      {/* Platform rows */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        {result.deals.map((deal) => {
          const p = PLATFORMS[deal.platform];
          const disc = Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
          const urls: Record<string, string> = {
            meituan: `https://s.meituan.com/${encodeURIComponent(placeName)}`,
            douyin: `https://www.douyin.com/search/${encodeURIComponent(placeName)}`,
            dianping: `https://www.dianping.com/search/keyword/${encodeURIComponent(placeName)}`,
            taobao: `https://s.taobao.com/search?q=${encodeURIComponent(placeName)}`,
            xianyu: `https://s.ershou.taobao.com/search.htm?q=${encodeURIComponent(placeName)}`,
          };
          return (
            <div
              key={deal.platform}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ${deal.isBest ? "ring-2" : ""}`}
              style={{
                backgroundColor: deal.isBest ? p.bg : "rgba(242,233,213,0.25)",
                borderColor: deal.isBest ? p.color : "rgba(150,100,50,0.12)",
                boxShadow: deal.isBest ? `0 0 0 2px ${p.color}30` : undefined,
              }}
            >
              {/* Platform badge */}
              <div
                className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold min-w-[68px] text-center"
                style={{ backgroundColor: p.color + "22", color: p.textColor, border: `1px solid ${p.color}40` }}
              >
                {p.name}
              </div>
              {/* Description */}
              <p className="text-xs text-muted-foreground flex-1 truncate">{deal.description}</p>
              {/* Tag */}
              {deal.tag && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: deal.isBest ? "#BF4E2A" : "#E8963C", color: "white" }}
                >
                  {deal.tag}
                </span>
              )}
              {/* Price */}
              <div className="flex items-baseline gap-1 flex-shrink-0">
                <span
                  className="text-base font-bold"
                  style={{ color: deal.isBest ? "#BF4E2A" : "#2C1810", fontFamily: "DM Mono, monospace" }}
                >
                  ¥{deal.price}
                </span>
                <span className="text-[11px] text-muted-foreground line-through" style={{ fontFamily: "DM Mono, monospace" }}>
                  ¥{deal.originalPrice}
                </span>
                <span className="text-[10px] font-medium" style={{ color: "#16A34A" }}>
                  -{disc}%
                </span>
              </div>
              {/* Link */}
              <a
                href={urls[deal.platform]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* AI stack suggestion */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ backgroundColor: "#BF4E2A0D", border: "1px solid #BF4E2A25" }}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#BF4E2A20" }}>
          <Zap className="w-3 h-3 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary mb-0.5">AI 智能叠券建议</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.bestStack}</p>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronUp className="w-3 h-3" />
          收起
        </button>
      </div>
    </div>
  );
}
