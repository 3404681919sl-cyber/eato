import React from "react";
import { X, FileDown } from "lucide-react";
import type { Place } from "../../types";
import { placesToCSV, downloadCSV } from "./csvExporter";

export default function ExportModal({ places, onClose }: { places: Place[]; onClose: () => void }) {
  const stats = {
    total: places.length,
    checked: places.flatMap((p) => p.visits.filter((v) => v.checkedIn)).length,
    totalSpent: places
      .flatMap((p) => p.visits.filter((v) => v.checkedIn))
      .reduce((s, v) => s + Number(v.spending || 0), 0),
  };

  const handleExportCSV = () => {
    const csv = placesToCSV(places);
    downloadCSV(csv, `eato-places-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <FileDown className="w-4 h-4 text-green-700" />
            </div>
            <span className="text-sm font-bold text-foreground">导出数据</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats preview */}
        <div className="px-6 py-4 space-y-2">
          <p className="text-xs text-muted-foreground">即将导出的数据概览：</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-secondary">
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{stats.total}</p>
              <p className="text-xs text-muted-foreground">餐厅</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary">
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{stats.checked}</p>
              <p className="text-xs text-muted-foreground">打卡</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary">
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>¥{stats.totalSpent}</p>
              <p className="text-xs text-muted-foreground">总花费</p>
            </div>
          </div>
        </div>

        {/* Export format options */}
        <div className="px-6 pb-4 space-y-2">
          <button onClick={handleExportCSV}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FileDown className="w-4 h-4 text-green-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">CSV 文件</p>
                <p className="text-xs text-muted-foreground">兼容 Excel /  Numbers</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>下载</span>
          </button>
        </div>
      </div>
    </div>
  );
}
