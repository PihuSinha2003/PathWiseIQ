import React, { useEffect, useState } from "react";
import Section from "../components/Section.jsx";
import { api } from "../data/api.js";
import { cohorts as cohortsMock } from "../data/mock.js";

const PERIODS = [
  { key: "d0",  label: "D0"  },
  { key: "d1",  label: "D1"  },
  { key: "d2",  label: "D2"  },
  { key: "d7",  label: "D7"  },
  { key: "d14", label: "D14" },
  { key: "d30", label: "D30" },
];

function colorFor(value) {
  if (value == null) return "bg-ink-800/40 text-ink-500";
  if (value >= 70)  return "bg-accent-500/70 text-white";
  if (value >= 50)  return "bg-accent-500/50 text-white";
  if (value >= 35)  return "bg-accent-500/35 text-ink-100";
  if (value >= 22)  return "bg-accent-500/22 text-ink-100";
  if (value >= 10)  return "bg-accent-500/12 text-ink-300";
  return "bg-accent-500/6 text-ink-300";
}

export default function Cohorts() {
  const [rows, setRows] = useState(cohortsMock);

  useEffect(() => {
    api.cohorts().then((data) => {
      if (data && data.length) setRows(data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <Section
        title="Weekly cohort retention"
        subtitle="Each cell is the % of a signup cohort that came back on day N"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-500">
                <th className="text-left py-2 pr-3 font-medium">Cohort week</th>
                <th className="text-right py-2 pr-3 font-medium">Size</th>
                {PERIODS.map((p) => (
                  <th key={p.key} className="text-center py-2 px-2 font-medium">{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cohort_week} className="border-t border-ink-800/60">
                  <td className="py-2 pr-3 text-ink-100">{r.cohort_week}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink-300">{r.cohort_size}</td>
                  {PERIODS.map((p) => {
                    const v = r[p.key];
                    return (
                      <td key={p.key} className="px-1 py-1">
                        <div className={`text-center py-2 rounded ${colorFor(v)} tabular-nums text-xs font-medium`}>
                          {v == null ? "—" : `${v}%`}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="D7 is climbing" subtitle="Driven by the streak feature and the day 0 recommendation">
          <div className="text-3xl font-bold">+13 points <span className="text-base text-ink-500 font-medium">(week 1 to latest)</span></div>
          <p className="text-sm text-ink-300 mt-3">D7 went from 32% in week 1 to 45% in week 10. The retention loops seem to be working.</p>
        </Section>
        <Section title="D14 above target" subtitle="Target was 22%">
          <div className="text-3xl font-bold text-good">31% <span className="text-base text-ink-500 font-medium">latest cohort</span></div>
          <p className="text-sm text-ink-300 mt-3">Above target and still going up. Email reminders should add another few points if they work.</p>
        </Section>
        <Section title="D30 early but okay" subtitle="First few cohorts after the streak shipped">
          <div className="text-3xl font-bold">23%</div>
          <p className="text-sm text-ink-300 mt-3">+8 points over the very first cohort. If this holds the north star target is reachable this quarter.</p>
        </Section>
      </div>
    </div>
  );
}
