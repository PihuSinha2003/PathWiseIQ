import React, { useState } from "react";
import Section from "../components/Section.jsx";
import { track } from "../data/api.js";

const SUBJECTS = ["DBMS", "OS", "DSA", "CN", "OOP", "ML", "AI", "Compilers", "DevOps"];

export default function Product() {
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState("B");
  const [examDate, setExamDate] = useState("");
  const [picked, setPicked] = useState(new Set(["DBMS", "OS", "DSA", "CN", "OOP", "ML"]));
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);

  React.useEffect(() => { track("landing_viewed", { device: window.innerWidth < 720 ? "mobile" : "desktop", variant }); }, [variant]);

  const togglePick = (s) => {
    const next = new Set(picked);
    next.has(s) ? next.delete(s) : next.add(s);
    setPicked(next);
  };

  const startSignup = () => { track("signup_started"); setStep(1); };

  const generatePlan = () => {
    track("onboarding_step_completed", { step_index: 2, variant });
    track("plan_created", { subject_count: picked.size, weeks_to_exam: examDate ? 6 : null });
    const newTasks = [...picked].slice(0, 4).map((s, i) => ({
      id: i + 1,
      subject: s,
      title: `${s}, practice set #${i + 1}`,
      duration_min: [25, 30, 45, 30][i % 4],
      done: false,
    }));
    setTasks(newTasks);
    track("ai_recommendation_viewed", { position: "above_fold", variant });
    setStep(3);
  };

  const complete = (id) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: true } : t)));
    track("task_completed", { task_id: id });
    setStreak((s) => s + 1);
    track("streak_extended", { streak_length: streak + 1 });
  };

  return (
    <div className="space-y-6">
      <Section
        title="Try the study planner"
        subtitle="Every click here fires an event the dashboard above reads from"
        action={
          <div className="flex gap-1 bg-ink-800/60 p-1 rounded-lg text-xs">
            {["A", "B"].map((v) => (
              <button
                key={v}
                className={`px-3 py-1.5 rounded-md font-medium ${variant === v ? "bg-accent-500 text-white" : "text-ink-300 hover:text-ink-100"}`}
                onClick={() => { setVariant(v); setStep(0); track("feature_flag_exposed", { experiment: "onboarding_v1", variant: v }); }}
              >
                Variant {v}
              </button>
            ))}
          </div>
        }
      >
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-3xl font-bold leading-tight">Know exactly what to <span className="text-accent-400">study next</span>.</h2>
              <p className="text-ink-300 mt-3">A weekly study plan that's actually personalised to your exam date, your subjects and your hours.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-300">
                <li>✓ Built around your exam date</li>
                <li>✓ Tells you the next best task to do</li>
                <li>✓ Streak counter that keeps you coming back</li>
              </ul>
              <button className="btn-primary mt-6" onClick={startSignup}>Get started, it's free</button>
            </div>
            <div className="card p-5 lg:p-6">
              <div className="text-xs text-ink-500 uppercase tracking-wider mb-2">Preview</div>
              <PlannerPreview />
            </div>
          </div>
        )}

        {step >= 1 && step < 3 && (
          <Onboarding
            variant={variant}
            step={step}
            setStep={setStep}
            examDate={examDate}
            setExamDate={setExamDate}
            subjects={SUBJECTS}
            picked={picked}
            togglePick={togglePick}
            onFinish={generatePlan}
          />
        )}

        {step === 3 && (
          <PlanView tasks={tasks} streak={streak} onComplete={complete} onReset={() => { setStep(0); setTasks([]); setStreak(0); }} />
        )}
      </Section>
    </div>
  );
}

function PlannerPreview() {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold">Your week</div>
        <div className="badge bg-warn/15 text-warn">🔥 Streak 4</div>
      </div>
      <div className="card p-3 mb-3 bg-accent-500/10 border-accent-500/30">
        <div className="text-xs text-accent-400 font-semibold">Do this next</div>
        <div className="font-medium mt-0.5">DBMS, normalisation (25 min)</div>
        <div className="text-xs text-ink-300 mt-1">You haven't touched DBMS in 3 days and the exam is in 12.</div>
      </div>
      {["DSA, graph problems (40m)", "OS, process scheduling (30m)", "CN, TCP notes (25m)"].map((t) => (
        <div key={t} className="flex items-center gap-2 py-1.5 text-sm">
          <input type="checkbox" className="accent-accent-500" /><span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function Onboarding({ variant, step, setStep, examDate, setExamDate, subjects, picked, togglePick, onFinish }) {
  const total = variant === "A" ? 3 : 2;
  React.useEffect(() => {
    track("onboarding_step_viewed", { step_index: step, variant });
  }, [step, variant]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1 rounded-full flex-1 ${i < step ? "bg-accent-500" : "bg-ink-800"}`} />
        ))}
      </div>
      <div className="text-xs text-ink-500 mb-4">Step {step} of {total}</div>

      {variant === "A" && step === 1 && (
        <Step title="What's your goal?">
          {["Crack semester exams", "Crack a competitive exam", "Build a portfolio"].map((g) => (
            <label key={g} className="flex items-center gap-3 p-3 card cursor-pointer hover:bg-ink-800/50">
              <input type="radio" name="goal" className="accent-accent-500" defaultChecked={g.startsWith("Crack semester")} />
              <span>{g}</span>
            </label>
          ))}
          <Next onClick={() => { track("onboarding_step_completed", { step_index: 1, variant }); setStep(2); }} />
        </Step>
      )}

      {variant === "A" && step === 2 && (
        <Step title="Pick your subjects" hint="This is the step that loses the most users. Variant B fixes it.">
          <ScrollSubjects subjects={subjects} picked={picked} togglePick={togglePick} />
          <div className="flex justify-between gap-2 mt-4">
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => { track("onboarding_step_completed", { step_index: 2, variant }); setStep(3); }}>
              Next
            </button>
          </div>
        </Step>
      )}

      {variant === "A" && step === 3 && (
        <Step title="Your availability" hint="Hours per day">
          <input type="range" min="1" max="8" defaultValue="3" className="w-full accent-accent-500" />
          <Next label="Finish" onClick={onFinish} />
        </Step>
      )}

      {variant === "B" && step === 1 && (
        <Step title="When is your exam?">
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2.5 text-ink-100"
          />
          <Next onClick={() => { track("onboarding_step_completed", { step_index: 1, variant }); setStep(2); }} />
        </Step>
      )}

      {variant === "B" && step === 2 && (
        <Step title="Subjects" hint="The 6 common ones are pre picked, tap to change">
          <ChipSubjects subjects={subjects} picked={picked} togglePick={togglePick} />
          <Next label="Generate my plan" onClick={onFinish} />
        </Step>
      )}
    </div>
  );
}

function Step({ title, hint, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">{title}</h3>
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Next({ onClick, label = "Next" }) {
  return (
    <div className="pt-2">
      <button className="btn-primary w-full" onClick={onClick}>{label}</button>
    </div>
  );
}

function ChipSubjects({ subjects, picked, togglePick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((s) => {
        const on = picked.has(s);
        return (
          <button
            key={s}
            onClick={() => togglePick(s)}
            className={`px-3 py-1.5 text-sm rounded-full border transition ${on
              ? "bg-accent-500/20 border-accent-500/40 text-accent-400"
              : "bg-ink-800 border-ink-700 text-ink-300 hover:text-ink-100"}`}
          >
            {on ? "✓ " : ""}{s}
          </button>
        );
      })}
    </div>
  );
}

function ScrollSubjects({ subjects, picked, togglePick }) {
  return (
    <div className="max-h-56 overflow-auto space-y-1 pr-1">
      {[...subjects, ...subjects, ...subjects.slice(0, 4)].map((s, i) => (
        <label key={i} className="flex items-center gap-2 px-3 py-2 card cursor-pointer hover:bg-ink-800/50">
          <input
            type="checkbox"
            className="accent-accent-500"
            checked={picked.has(s)}
            onChange={() => togglePick(s)}
          />
          <span className="text-sm">{s} {i > 8 ? `(advanced)` : ""}</span>
        </label>
      ))}
    </div>
  );
}

function PlanView({ tasks, streak, onComplete, onReset }) {
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">Your plan is ready</h3>
          <p className="text-sm text-ink-300">{done}/{tasks.length} completed today</p>
        </div>
        <div className="badge bg-warn/15 text-warn">🔥 Streak {streak}</div>
      </div>

      <div className="card p-4 mb-4 bg-accent-500/10 border-accent-500/30">
        <div className="text-xs text-accent-400 font-semibold">Do this next</div>
        <div className="font-medium mt-1">{tasks[0]?.title} ({tasks[0]?.duration_min} min)</div>
        <div className="text-xs text-ink-300 mt-1">Picked because it's the most useful for your exam date.</div>
      </div>

      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className={`card p-3 flex items-center justify-between ${t.done ? "opacity-50" : ""}`}>
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-ink-500">{t.duration_min} min</div>
            </div>
            <button
              className={t.done ? "btn-ghost" : "btn-primary"}
              onClick={() => !t.done && onComplete(t.id)}
              disabled={t.done}
            >
              {t.done ? "Done ✓" : "Complete"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-sm text-ink-500 hover:text-ink-100" onClick={onReset}>Reset demo</button>
      </div>
    </div>
  );
}
