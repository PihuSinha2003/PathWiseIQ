import React, { useEffect, useMemo, useState } from "react";
import Section from "../components/Section.jsx";
import { api } from "../data/api.js";
import { funnel as fAll, funnelDesktop, funnelMobile } from "../data/mock.js";

const FILTERS = [
  { id: "all",     label: "All devices" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile",  label: "Mobile" },
];

export default function Funnel() {
  const [device, setDevice] = useState("all");
  const [rows, setRows] = useState(fAll);

  useEffect(() => {
    const d = device === "all" ? null : device;
    api.funnel(d).then((data) => {
      if (data && data.length) setRows(data);
      else setRows(device === "desktop" ? funnelDesktop : device === "mobile" ? funnelMobile : fAll);
    });
  }, [device]);

  const biggestDrop = useMemo(() => {
    let worst = null;
    for (let i = 1; i < rows.length; i++) {
      if (!worst || rows[i].step_cvr < worst.step_cvr) {
        worst = { from: rows[i - 1].stage, to: rows[i].stage, step_cvr: rows[i].step_cvr };
      }
    }
    return worst;
  }, [rows]);

  return (
    <div className="space-y-6">
      <Section
        title="Conversion funnel"
        subtitle="Landing to signup to plan to recommendation to first task"
        action={
          <div className="flex gap-1 bg-ink-800/60 p-1 rounded-lg">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                  device === f.id ? "bg-accent-500 text-white" : "text-ink-300 hover:text-ink-100"
                }`}
                onClick={() => setDevice(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {rows.map((row, i) => {
            const w = row.cumulative_cvr ?? 0;
            const dropPct = i > 0 ? (rows[i - 1].cumulative_cvr - row.cumulative_cvr).toFixed(1) : null;
            return (
              <div key={row.stage} className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-3 text-sm text-ink-300">{row.stage}</div>
                <div className="col-span-7">
                  <div className="h-7 bg-ink-800 rounded-md overflow-hidden flex items-center">
                    <div
                      className="h-full bg-gradient-to-r from-accent-500 to-accent-400 flex items-center pl-3 text-xs font-semibold"
                      style={{ width: `${w}%` }}
                    >
                      {w}%
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-right tabular-nums text-sm">
                  {row.users.toLocaleString()}
                  {i > 0 && (
                    <div className="text-xs text-ink-500">step {row.step_cvr}% · −{dropPct}pp</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Biggest drop off" subtitle="The step that loses the most users">
          {biggestDrop && (
            <div>
              <div className="text-bad text-lg font-semibold">
                {biggestDrop.from} to {biggestDrop.to}
              </div>
              <div className="text-3xl font-bold mt-2 tabular-nums">{biggestDrop.step_cvr}%</div>
              <p className="text-sm text-ink-300 mt-3">
                Shortening this step should recover roughly{" "}
                <span className="text-good font-semibold">+11.4 points</span> on activation (see Recommendations).
              </p>
            </div>
          )}
        </Section>

        <Section title="Desktop vs mobile activation" subtitle="The 22 point gap to fix">
          <div className="space-y-3">
            <DeviceRow label="Desktop" cvr={funnelDesktop[funnelDesktop.length - 1].cumulative_cvr} share={45} />
            <DeviceRow label="Mobile"  cvr={funnelMobile[funnelMobile.length - 1].cumulative_cvr}   share={47} />
            <DeviceRow label="Tablet"  cvr={14.8} share={8} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function DeviceRow({ label, cvr, share }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink-300">{label} <span className="text-ink-500">· {share}% of traffic</span></span>
        <span className="tabular-nums">{cvr}%</span>
      </div>
      <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
        <div className="h-full bg-accent-500" style={{ width: `${cvr * 2}%`, maxWidth: "100%" }} />
      </div>
    </div>
  );
}
