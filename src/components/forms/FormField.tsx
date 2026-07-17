import React from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: "text" | "textarea" | "number";
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export default function FormField({ label, value, onChange, placeholder, error, type = "text", required, disabled, maxLength }: FormFieldProps) {
  const inputClass =
    "w-full px-4 py-3 text-sm rounded-xl border text-foreground bg-secondary focus:outline-none focus:ring-2 transition-all " +
    (error ? "border-red-300 focus:ring-red-200" : "border-border focus:ring-primary/30");

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled} maxLength={maxLength}
          className={inputClass + " min-h-[80px] resize-y"} rows={3} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled} maxLength={maxLength}
          className={inputClass} />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// Helper: validation rules
export const validators = {
  required: (msg?: string) => (v: string) => (!v.trim() ? msg || "此项为必填" : undefined),
  minLength: (min: number, msg?: string) => (v: string) =>
    v.trim().length < min ? msg || `至少 ${min} 个字符` : undefined,
  maxLength: (max: number, msg?: string) => (v: string) =>
    v.length > max ? msg || `不超过 ${max} 个字符` : undefined,
  number: (msg?: string) => (v: string) =>
    v && isNaN(Number(v)) ? msg || "请输入有效数字" : undefined,
};

export function useValidate<T extends Record<string, string>>(
  fields: T,
  rules: Record<keyof T, ((v: string) => string | undefined)[]>
) {
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});

  const validate = React.useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasError = false;
    for (const key of Object.keys(rules) as (keyof T)[]) {
      for (const rule of rules[key]) {
        const err = rule(fields[key]);
        if (err) {
          newErrors[key] = err;
          hasError = true;
          break;
        }
      }
    }
    setErrors(newErrors);
    return !hasError;
  }, [fields, rules]);

  const clearError = (key: keyof T) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return { errors, validate, clearError };
}
