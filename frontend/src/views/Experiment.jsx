import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import Section from "../components/Section.jsx";
import KpiCard from "../components/KpiCard.jsx";
import { api } from "../data/api.js";
import { experiment as expMock } from "../data/mock.js";

export default function Experiment() {
  const [exp, setExp] = useState(expMock);

  useEffect(() => {
    api.experiment().then((data) => {
      if (data && Object.keys(data).length) setExp(data);
    });
  }, []);

  const significant = exp.p_value < 0.05;
  const chart = [
    { variant: "A · 3 step", cvr: exp.cvr_a, fill: "#6b7693" },
    { variant: "B · 2 step", cvr: exp.cvr_b, fill: "#6366f1" },
  ];

  return (
    <div className="space-y-6">
      <Section title="Onboarding A vs B" subtitle="Primary metric: signup to first task done (activation)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2740" vertical={false} />
                <XAxis dataKey="variant" stroke="#6b7693" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7693" tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "#0f1530", border: "1px solid #1f2740", borderRadius: 8 }} cursor={{ fill: "transparent" }} />
                <Bar dataKey="cvr" radius={[6, 6, 0, 0]}>
                  {chart.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <KpiCard label="Variant A users"  value={exp.users_a.toLocaleString()} hint="3 step onboarding (control)" />
            <KpiCard label="Variant B users"  value={exp.users_b.toLocaleString()} hint="2 step onboarding (test)" />
            <KpiCard label="A activation"     value={exp.cvr_a} suffix="%" />
            <KpiCard label="B activation"     value={exp.cvr_b} suffix="%" tone="good" />
            <KpiCard label="Lift (B minus A)" value={`+${exp.lift_pp}`} suffix="pts"  tone="good" hint={`95% CI [${exp.ci_low_pp >= 0 ? "+" : ""}${exp.ci_low_pp}, +${exp.ci_high_pp}] pts`} />
            <KpiCard label="p value"          value={exp.p_value}        tone={significant ? "good" : "bad"} hint={significant ? "Significant at 0.05" : "Not significant"} />
          </div>
        </div>
      </Section>

      <Section title="What I'd do with this">
        <div className="flex items-start gap-4">
          <div className={`px-3 py-1 rounded-md text-sm font-semibold ${significant ? "bg-good/15 text-good" : "bg-warn/15 text-warn"}`}>
            {significant ? `Ship variant ${exp.winner}` : "Not significant, keep running"}
          </div>
          <p className="text-sm text-ink-300 flex-1">
            Variant B (2 step onboarding with the chip selector) beats the 3 step control by{" "}
            <span className="font-semibold text-ink-100">+{exp.lift_pp} points</span> on activation at p = {exp.p_value}.
            The 95% confidence interval doesn't include zero, so the win isn't noise. I'd roll variant B to everyone.
          </p>
        </div>
      </Section>

      <Section title="How the test was set up">
        <ul className="text-sm text-ink-300 space-y-2 list-disc list-inside marker:text-accent-400">
          <li><strong className="text-ink-100">Hypothesis.</strong> A shorter onboarding activates more users.</li>
          <li><strong className="text-ink-100">Split.</strong> 50/50 by user id, decided server side at signup so a user stays in one bucket.</li>
          <li><strong className="text-ink-100">Sample size.</strong> Aimed for 80% power to detect a 5 point lift on a 40% baseline. Ended up well past that.</li>
          <li><strong className="text-ink-100">Stats.</strong> Two proportion z test, CI uses unpooled standard error.</li>
          <li><strong className="text-ink-100">Things I watched.</strong> Plan creation rate, recommendation click rate, error rate. None regressed.</li>
        </ul>
      </Section>
    </div>
  );
}
