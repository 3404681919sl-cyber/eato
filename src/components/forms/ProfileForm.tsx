import React from "react";
import { X, User, Save } from "lucide-react";
import FormField, { validators, useValidate } from "./FormField";

interface ProfileFormProps {
  name: string;
  color: string;
  onSubmit: (data: { name: string; color: string }) => void;
  onClose: () => void;
}

const PRESET_COLORS = ["#BF4E2A", "#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2", "#6B7280"];

export default function ProfileForm({ name, color, onSubmit, onClose }: ProfileFormProps) {
  const [fields, setFields] = React.useState({ name, color });

  const rules = {
    name: [validators.required("请输入昵称"), validators.maxLength(12)],
    color: [],
  };

  const { errors, validate, clearError } = useValidate(fields, rules);

  const set = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    clearError(key as keyof typeof fields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(fields);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-700" />
            </div>
            <span className="text-sm font-bold text-foreground">编辑个人资料</span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Preview avatar */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm"
              style={{ backgroundColor: fields.color }}>
              {fields.name ? fields.name[0] : "?"}
            </div>
          </div>

          <FormField label="昵称" value={fields.name} onChange={(v) => set("name", v)}
            placeholder="你的昵称" error={errors.name} required maxLength={12} />

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">头像颜色</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => set("color", c)}
                  className={"w-8 h-8 rounded-full transition-all " + (fields.color === c ? "ring-2 ring-offset-2 ring-primary" : "opacity-60 hover:opacity-100")}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <button type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            保存
          </button>
        </form>
      </div>
    </div>
  );
}
