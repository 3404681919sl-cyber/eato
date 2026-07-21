import React from "react";
import { Download, Upload, Trash2, AlertTriangle, FileDown } from "lucide-react";
import { STORAGE_KEYS } from "../../constants";

export default function DataManagement({ places, slots, onReset }: {
  places: unknown[];
  slots: Record<string, string[]>;
  onReset: () => void;
}) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleExport = () => {
    const data = { places, slots, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eato-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    onReset();
    setShowConfirm(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl divide-y divide-border">
      {/* Export */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">导出备份</p>
              <p className="text-xs text-muted-foreground">将所有打卡数据导出为 JSON 文件</p>
            </div>
          </div>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      {/* Import placeholder */}
      <div className="px-6 py-5 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">导入数据</p>
              <p className="text-xs text-muted-foreground">从备份文件恢复数据（即将支持）</p>
            </div>
          </div>
          <button disabled
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-muted text-muted-foreground cursor-not-allowed">
            <Upload className="w-4 h-4" />
            导入
          </button>
        </div>
      </div>

      {/* Reset */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">重置所有数据</p>
              <p className="text-xs text-muted-foreground">清空所有打卡记录和日历数据（不可恢复）</p>
            </div>
          </div>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" />
              重置
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowConfirm(false)}
                className="text-sm px-3 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-secondary transition-colors">
                取消
              </button>
              <button onClick={handleReset}
                className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">
                <AlertTriangle className="w-4 h-4" />
                确认重置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
