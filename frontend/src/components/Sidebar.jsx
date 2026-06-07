import React from "react";

export default function Sidebar({ views, active, onChange }) {
  return (
    <aside className="w-60 shrink-0 border-r border-ink-800 bg-ink-900/60 backdrop-blur-md hidden md:flex md:flex-col">
      <div className="px-5 pt-6 pb-4 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center font-bold">P</div>
          <div>
            <div className="font-bold tracking-tight">PathwiseIQ</div>
            <div className="text-xs text-ink-500">Study planner + analytics</div>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {Object.entries(views).map(([id, v]) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition
              ${active === id
                ? "bg-accent-500/15 text-accent-400 ring-1 ring-accent-500/30"
                : "text-ink-300 hover:bg-ink-800/60 hover:text-ink-100"}`}
          >
            <span className="text-base leading-none">{v.icon}</span>
            <span className="font-medium">{v.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-5 text-xs text-ink-500 border-t border-ink-800">
        <div className="mb-1 font-semibold text-ink-300">North star</div>
        <div>Weekly Active Planners</div>
        <div className="mt-2 text-good">+19% this week</div>
      </div>
    </aside>
  );
}
