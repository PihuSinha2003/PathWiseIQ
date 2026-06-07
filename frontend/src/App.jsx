import React, { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Overview from "./views/Overview.jsx";
import Funnel from "./views/Funnel.jsx";
import Cohorts from "./views/Cohorts.jsx";
import Experiment from "./views/Experiment.jsx";
import Insights from "./views/Insights.jsx";
import Recommendations from "./views/Recommendations.jsx";
import Product from "./views/Product.jsx";

const VIEWS = {
  overview: { label: "Overview",      Component: Overview,        icon: "📊" },
  funnel:   { label: "Funnel",        Component: Funnel,          icon: "📉" },
  cohorts:  { label: "Cohorts",       Component: Cohorts,         icon: "🧊" },
  experiment: { label: "A/B test",    Component: Experiment,      icon: "🧪" },
  insights: { label: "Insights",      Component: Insights,        icon: "💡" },
  recs:     { label: "What to build", Component: Recommendations, icon: "🎯" },
  product:  { label: "Try the app",   Component: Product,         icon: "🎓" },
};

export default function App() {
  const [view, setView] = useState("overview");
  const Active = VIEWS[view].Component;

  return (
    <div className="min-h-screen flex">
      <Sidebar views={VIEWS} active={view} onChange={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar label={VIEWS[view].label} />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Active />
        </main>
      </div>
    </div>
  );
}
