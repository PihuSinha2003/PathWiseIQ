import React, { useEffect, useState } from "react";
import Section from "../components/Section.jsx";
import { api } from "../data/api.js";
import { recommendations as recsMock } from "../data/mock.js";

export default function Recommendations() {
  const [recs, setRecs] = useState(recsMock);

  useEffect(() => {
    api.recommendations().then((data) => {
      if (data && data.length) setRecs(data);
    });
  }, []);

  const sorted = [...recs].sort((a, b) => b.rice - a.rice);
  const maxRice = sorted[0]?.rice ?? 1;

  return (
    <div className="space-y-6">
      <Section
        title="What I'd build next"
        subtitle="Ranked by RICE. The top one is the one I'd ship first."
      >
        <div className="space-y-4">
          {sorted.map((r, i) => (
            <div key={r.title} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-accent-500/15 text-accent-400 ring-1 ring-accent-500/30 flex items-center justify-center font-bold tabular-nums">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-100">{r.title}</h3>
                    <p className="text-sm text-ink-300 mt-1">{r.rationale}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-ink-500">RICE</div>
                  <div className="text-lg font-bold tabular-nums">{r.rice.toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Field label="Projected lift" value={r.projected_lift} tone="good" />
                <Field label="Effort"          value={r.effort} />
                <Field label="Owner"           value={r.owner} />
                <Field label="RICE rank"       value={`#${i + 1} of ${sorted.length}`} />
              </div>

              <div className="mt-4 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                  style={{ width: `${(r.rice / maxRice) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Field({ label, value, tone }) {
  const valueClass = tone === "good" ? "text-good" : "text-ink-100";
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}
