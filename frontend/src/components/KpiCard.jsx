import React from "react";

export default function KpiCard({ label, value, suffix, delta, deltaSuffix = "%", hint, tone = "neutral" }) {
  const deltaTone =
    tone === "good" ? "text-good"
    : tone === "bad" ? "text-bad"
    : delta == null ? "text-ink-500"
    : delta > 0 ? "text-good"
    : delta < 0 ? "text-bad"
    : "text-ink-300";

  return (
    <div className="kpi-card">
      <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className="text-3xl font-bold tabular-nums">
        {value}
        {suffix && <span className="text-base text-ink-300 ml-1 font-medium">{suffix}</span>}
      </div>
      {delta != null && (
        <div className={`text-sm font-medium ${deltaTone}`}>
          {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta).toFixed(1)}{deltaSuffix}
        </div>
      )}
      {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
    </div>
  );
}
