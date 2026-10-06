/**
 * InlinePlanRow — A single editable plan row (no individual save).
 * Used inside PagePlansSection for batch-save editing in the Page Access page.
 */
import { Trash2 } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.35)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const DURATION_TYPES = [
  { value: "DAYS",    label: "Days",    multiplier: 1   },
  { value: "MONTHS",  label: "Months",  multiplier: 30  },
  { value: "YEARS",   label: "Years",   multiplier: 365 },
  { value: "LIFETIME",label: "Lifetime",multiplier: null},
];

export default function InlinePlanRow({ plan, onChange, onDelete }) {
  const update = (field, value) => {
    const updated = { ...plan, [field]: value };
    // Recompute duration_days when type or count changes
    if (field === 'duration_type' || field === 'duration_count') {
      const type = updated.duration_type;
      const count = parseInt(updated.duration_count) || 0;
      const typeMeta = DURATION_TYPES.find(t => t.value === type);
      if (type === 'LIFETIME' || !typeMeta?.multiplier) {
        updated.duration_days = null;
        updated.duration_count = null;
      } else {
        updated.duration_days = count * typeMeta.multiplier;
        updated.duration_count = count;
      }
    }
    onChange(updated);
  };

  const isLifetime = plan.duration_type === 'LIFETIME';

  return (
    <div className="rounded-lg border p-2.5 space-y-2" style={{
      background: G.bg, borderColor: G.border,
    }}>
      <div className="flex items-center gap-2">
        <input
          value={plan.plan_name || ""}
          onChange={e => update('plan_name', e.target.value)}
          placeholder="Plan name e.g. 1 Month"
          className="flex-1 px-2 py-1.5 rounded text-sm text-white outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
        />
        <button onClick={onDelete}
          className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[9px] text-white/40 block mb-0.5">Price</label>
          <input
            type="number" min={0} step="0.01"
            value={plan.price ?? ""}
            onChange={e => update('price', e.target.value)}
            placeholder="25"
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
          />
        </div>
        <div>
          <label className="text-[9px] text-white/40 block mb-0.5">Currency</label>
          <input
            value={plan.currency || "AED"}
            onChange={e => update('currency', e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
          />
        </div>
        <div>
          <label className="text-[9px] text-white/40 block mb-0.5">Type</label>
          <select
            value={plan.duration_type || "DAYS"}
            onChange={e => update('duration_type', e.target.value)}
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(8,16,40,0.98)", border: `1px solid ${G.border}` }}
          >
            {DURATION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
      {!isLifetime && (
        <div>
          <label className="text-[9px] text-white/40 block mb-0.5">Duration ({(plan.duration_type || 'DAYS').toLowerCase()})</label>
          <input
            type="number" min={1}
            value={plan.duration_count ?? ""}
            onChange={e => update('duration_count', e.target.value)}
            placeholder="e.g. 3"
            className="w-full px-2 py-1.5 rounded text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}` }}
          />
        </div>
      )}
    </div>
  );
}