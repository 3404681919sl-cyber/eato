import React from "react";
import { Settings, Database, Info, Trash2, Download, Upload } from "lucide-react";
import { APP_NAME, APP_VERSION } from "../../constants";
import DataManagement from "./DataManagement";
import AboutSection from "./AboutSection";

type SettingsTab = "data" | "about";

export default function SettingsPage({ places, slots, onReset }: {
  places: unknown[];
  slots: Record<string, string[]>;
  onReset: () => void;
}) {
  const [tab, setTab] = React.useState<SettingsTab>("data");

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "data", label: "数据管理", icon: <Database className="w-4 h-4" /> },
    { id: "about", label: "关于",     icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            设置
          </h2>
          <p className="text-xs text-muted-foreground">管理你的 {APP_NAME} 数据</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all " +
              (tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "data" && <DataManagement places={places} slots={slots} onReset={onReset} />}
      {tab === "about" && <AboutSection />}
    </div>
  );
}
