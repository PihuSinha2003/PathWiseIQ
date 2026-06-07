import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import KpiCard from "../components/KpiCard.jsx";
import Section from "../components/Section.jsx";
import { api } from "../data/api.js";
import { wapTrend, funnel as funnelMock, insights as insightsMock } from "../data/mock.js";

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [funnelRows, setFunnelRows] = useState(funnelMock);
  const [topInsights, setTopInsights] = useState(insightsMock);

  useEffect(() => {
    api.overview().then(setOverview);
    api.funnel().then(setFunnelRows);
    api.insights().then(setTopInsights);
  }, []);

  if (!overview) return <div className="text-ink-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="North star (Weekly Active Planners)"
          value={overview.wap.toLocaleString()}
          delta={overview.wap_delta_pct}
          hint="Users who finished at least one task in the last 7 days"
        />
        <KpiCard label="Activation" value={overview.activation_cvr} suffix="%" hint="Landing to first task done" />
        <KpiCard label="D7 retention"   value={overview.d7_retention}   suffix="%" hint="Average across cohorts" />
        <KpiCard
          label="Mobile vs desktop"
          value={overview.mobile_vs_desktop_pp}
          suffix="pts"
          tone={overview.mobile_vs_desktop_pp < 0 ? "bad" : "good"}
          hint="Activation gap"
        />
      </div>

      <Section title="Weekly Active Planners, last 12 weeks" subtitle="Growing since the recommendation moved to day 0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wapTrend} margin={{ top: 8, right: 16, bottom: 4, left: -10 }}>
              <defs>
                <linearGradient id="g-wap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2740" />
              <XAxis dataKey="week" stroke="#6b7693" tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7693" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f1530", border: "1px solid #1f2740", borderRadius: 8 }}
                labelStyle={{ color: "#aab1c5" }}
              />
              <Area type="monotone" dataKey="wap" stroke="#818cf8" strokeWidth={2.5} fill="url(#g-wap)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="Funnel snapshot" subtitle="12k visitors down to about 2.1k who finished a task" className="lg:col-span-2">
          <div className="space-y-3">
            {funnelRows.map((row, i) => {
              const width = (row.cumulative_cvr ?? 0).toFixed(1);
              return (
                <div key={row.stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-300">{row.stage}</span>
                    <span className="tabular-nums text-ink-100">{row.users.toLocaleString()} <span className="text-ink-500">({width}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-ink-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-500 to-accent-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  {i > 0 && (
                    <div className="text-xs text-ink-500 mt-1">step CVR: {row.step_cvr}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Biggest thing to fix" subtitle="From the funnel above">
          {topInsights[0] && (
            <div>
              <div className="text-bad font-semibold">{topInsights[0].title}</div>
              <p className="text-sm text-ink-300 mt-2">{topInsights[0].body}</p>
              <div className="mt-3">
                <span className="badge-bad">{topInsights[0].metric}</span>
              </div>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
