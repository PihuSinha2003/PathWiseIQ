import React, { useEffect, useState } from "react";
import Section from "../components/Section.jsx";
import { api } from "../data/api.js";
import { insights as insightsMock } from "../data/mock.js";

const severityClass = {
  good: "badge-good",
  bad:  "badge-bad",
  warn: "badge-warn",
};

export default function Insights() {
  const [items, setItems] = useState(insightsMock);

  useEffect(() => {
    api.insights().then((data) => {
      if (data && data.length) {
        setItems(
          data.map((d, i) => ({
            ...d,
            severity: d.severity || (insightsMock[i]?.severity ?? "warn"),
          }))
        );
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <Section title="What I noticed in the data" subtitle="Each card is something I'd actually do something about">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.title} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-ink-100">{it.title}</h3>
                <span className={severityClass[it.severity] || "badge"}>{it.metric}</span>
              </div>
              <p className="text-sm text-ink-300">{it.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How to read this" subtitle="Each insight turns into a concrete thing to do">
        <p className="text-sm text-ink-300">
          These come straight out of the funnel, cohort and A/B queries. The Recommendations tab
          turns them into a ranked list with projected lift and rough effort.
        </p>
      </Section>
    </div>
  );
}
