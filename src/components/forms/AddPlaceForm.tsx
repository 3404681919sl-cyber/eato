import React from "react";
import { X, Plus } from "lucide-react";
import FormField, { validators, useValidate } from "./FormField";
import type { Category, Mood } from "../../types";
import { CAT, MOOD, CATEGORY_IMAGES } from "../../constants";

interface AddPlaceFormProps {
  onSubmit: (data: { name: string; category: Category; mood: Mood; plannedMenu: string; image: string }) => void;
  onClose: () => void;
}

export default function AddPlaceForm({ onSubmit, onClose }: AddPlaceFormProps) {
  const [fields, setFields] = React.useState({
    name: "", category: "other" as Category, mood: "casual" as Mood,
    plannedMenu: "", image: "",
  });

  const rules = {
    name: [validators.required("请输入餐厅名称"), validators.maxLength(30)],
    category: [validators.required()],
    mood: [validators.required()],
    plannedMenu: [validators.maxLength(100)],
    image: [],
  };

  const { errors, validate, clearError } = useValidate(fields, rules);

  const set = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    clearError(key as keyof typeof fields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(fields);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">添加餐厅</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FormField label="餐厅名称" value={fields.name} onChange={(v) => set("name", v)}
            placeholder="如：海底捞火锅" error={errors.name} required />

          {/* Category selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">分类 *</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CAT) as [Category, typeof CAT[Category]][]).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => set("category", key)}
                  className={"flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all " +
                    (fields.category === key ? "shadow-sm" : "opacity-60 hover:opacity-100")}
                  style={{
                    backgroundColor: fields.category === key ? cfg.light : "transparent",
                    borderColor: cfg.color + "40",
                    color: cfg.color,
                  }}>
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">心情 *</label>
            <div className="flex gap-2">
              {(Object.entries(MOOD) as [Mood, typeof MOOD[Mood]][]).map(([key, cfg]) => (
                <button key={key} type="button" onClick={() => set("mood", key)}
                  className={"flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all " +
                    (fields.mood === key ? "shadow-sm" : "opacity-60 hover:opacity-100")}
                  style={{
                    backgroundColor: fields.mood === key ? cfg.color + "20" : "transparent",
                    borderColor: cfg.color + "40",
                    color: cfg.color,
                  }}>
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <FormField label="已点菜单" value={fields.plannedMenu} onChange={(v) => set("plannedMenu", v)}
            placeholder="如：番茄锅+虾滑+毛肚" type="textarea" error={errors.plannedMenu} />

          <FormField label="图片链接" value={fields.image} onChange={(v) => set("image", v)}
            placeholder="可选，输入图片 URL 或留空" />

          {/* Preview */}
          {fields.image && (
            <div className="rounded-xl overflow-hidden border border-border w-20 h-20">
              <img src={fields.image} alt="preview" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              取消
            </button>
            <button type="submit"
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              添加餐厅
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
