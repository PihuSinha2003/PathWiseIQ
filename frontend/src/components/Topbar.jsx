import React from "react";

export default function Topbar({ label }) {
  return (
    <header className="flex items-center justify-between px-6 lg:px-8 h-16 border-b border-ink-800 bg-ink-900/40 backdrop-blur-md">
      <div>
        <div className="text-xs uppercase tracking-wider text-ink-500">PathwiseIQ</div>
        <h1 className="text-lg font-semibold">{label}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="badge bg-ink-800 text-ink-300">5,053 users, 90 days</span>
        <span className="badge-good">Live</span>
      </div>
    </header>
  );
}
