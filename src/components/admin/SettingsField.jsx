/**
 * SettingsField — Reusable form field for settings (text, number, toggle, select).
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
};

export default function SettingsField({ label, type = "text", value, onChange, options, placeholder, disabled, min, max, step, description }) {
  const isToggle = type === "toggle";

  if (isToggle) {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0 flex-1">
          <Label className="text-white/70 text-xs">{label}</Label>
          {description && <p className="text-[10px] text-white/30 mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => !disabled && onChange(!value)}
          disabled={disabled}
          className="relative flex-shrink-0"
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: value ? "#22c55e" : "rgba(255,255,255,0.10)",
            border: "1px solid " + (value ? "rgba(34,197,94,0.50)" : "rgba(255,255,255,0.10)"),
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <div
            className="absolute top-0.5 rounded-full bg-white transition-all"
            style={{
              width: 16,
              height: 16,
              left: value ? 20 : 2,
              transition: "left 0.2s ease",
            }}
          />
        </button>
      </div>
    );
  }

  if (type === "select") {
    return (
      <div className="space-y-1">
        <Label className="text-white/70 text-xs">{label}</Label>
        <Select value={String(value || "")} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-xs">
            <SelectValue placeholder={placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {(options || []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <p className="text-[10px] text-white/30">{description}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="text-white/70 text-xs">{label}</Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => {
          const v = type === "number" ? parseInt(e.target.value, 10) || 0 : e.target.value;
          onChange(v);
        }}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="bg-white/5 border-white/10 text-white h-9 text-xs"
        style={{ fontSize: "14px" }}
      />
      {description && <p className="text-[10px] text-white/30">{description}</p>}
    </div>
  );
}