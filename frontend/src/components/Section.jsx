import React from "react";

export default function Section({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`card p-5 lg:p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
