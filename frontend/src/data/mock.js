// Snapshot of what the API would return.
// Used as a fallback so the dashboard works without the backend running.

export const overview = {
  wap: 1184,
  wap_delta_pct: 19.0,
  activation_cvr: 17.6,
  d7_retention: 34.8,
  mobile_vs_desktop_pp: -22.0,
  as_of: "2026-05-21T00:00:00Z",
};

export const funnel = [
  { stage: "Landing viewed",        users: 12000, step_cvr: 100.0, cumulative_cvr: 100.0 },
  { stage: "Signup completed",      users: 5053,  step_cvr: 42.1,  cumulative_cvr: 42.1  },
  { stage: "Plan created",          users: 2966,  step_cvr: 58.7,  cumulative_cvr: 24.7  },
  { stage: "AI rec viewed",         users: 2401,  step_cvr: 80.9,  cumulative_cvr: 20.0  },
  { stage: "First task completed",  users: 2114,  step_cvr: 88.1,  cumulative_cvr: 17.6  },
];

export const funnelDesktop = [
  { stage: "Landing viewed",        users: 5400, step_cvr: 100.0, cumulative_cvr: 100.0 },
  { stage: "Signup completed",      users: 2862, step_cvr: 53.0,  cumulative_cvr: 53.0  },
  { stage: "Plan created",          users: 1860, step_cvr: 65.0,  cumulative_cvr: 34.4  },
  { stage: "AI rec viewed",         users: 1600, step_cvr: 86.0,  cumulative_cvr: 29.6  },
  { stage: "First task completed",  users: 1421, step_cvr: 88.8,  cumulative_cvr: 26.3  },
];

export const funnelMobile = [
  { stage: "Landing viewed",        users: 5640, step_cvr: 100.0, cumulative_cvr: 100.0 },
  { stage: "Signup completed",      users: 1748, step_cvr: 31.0,  cumulative_cvr: 31.0  },
  { stage: "Plan created",          users: 856,  step_cvr: 49.0,  cumulative_cvr: 15.2  },
  { stage: "AI rec viewed",         users: 617,  step_cvr: 72.0,  cumulative_cvr: 10.9  },
  { stage: "First task completed",  users: 524,  step_cvr: 84.9,  cumulative_cvr:  9.3  },
];

export const cohorts = [
  { cohort_week: "2026-02-23", cohort_size: 312, d0: 100, d1: 64, d2: 48, d7: 32, d14: 22, d30: 15 },
  { cohort_week: "2026-03-02", cohort_size: 348, d0: 100, d1: 67, d2: 51, d7: 34, d14: 23, d30: 17 },
  { cohort_week: "2026-03-09", cohort_size: 391, d0: 100, d1: 72, d2: 55, d7: 36, d14: 25, d30: 18 },
  { cohort_week: "2026-03-16", cohort_size: 420, d0: 100, d1: 74, d2: 57, d7: 38, d14: 27, d30: 20 },
  { cohort_week: "2026-03-23", cohort_size: 455, d0: 100, d1: 78, d2: 60, d7: 41, d14: 30, d30: 22 },
  { cohort_week: "2026-03-30", cohort_size: 470, d0: 100, d1: 79, d2: 61, d7: 42, d14: 31, d30: 23 },
  { cohort_week: "2026-04-06", cohort_size: 502, d0: 100, d1: 80, d2: 63, d7: 43, d14: 32, d30: null },
  { cohort_week: "2026-04-13", cohort_size: 517, d0: 100, d1: 81, d2: 63, d7: 44, d14: null, d30: null },
  { cohort_week: "2026-04-20", cohort_size: 538, d0: 100, d1: 82, d2: 64, d7: 45, d14: null, d30: null },
  { cohort_week: "2026-04-27", cohort_size: 560, d0: 100, d1: 83, d2: 65, d7: null, d14: null, d30: null },
  { cohort_week: "2026-05-04", cohort_size: 581, d0: 100, d1: 83, d2: 66, d7: null, d14: null, d30: null },
  { cohort_week: "2026-05-11", cohort_size: 540, d0: 100, d1: 84, d2: null, d7: null, d14: null, d30: null },
];

export const experiment = {
  experiment: "onboarding_v1",
  variant_a: "A, 3 step onboarding",
  variant_b: "B, 2 step onboarding",
  users_a: 2512,
  users_b: 2541,
  cvr_a: 39.8,
  cvr_b: 48.4,
  lift_pp: 8.6,
  p_value: 0.013,
  ci_low_pp: 1.9,
  ci_high_pp: 15.3,
  winner: "B",
};

export const insights = [
  {
    title: "Biggest drop is onboarding step 2 (pick subjects)",
    body: "Only 72.9% of users get past the subjects step. That's a 27 point leak on what's otherwise a tight funnel. Probably too many options on one screen.",
    metric: "-27.1 pts",
    severity: "bad",
  },
  {
    title: "Mobile converts 22 points lower than desktop",
    body: "47% of traffic is mobile but only 31% of them sign up. The signup form has 9 fields visible on desktop and only 3 on mobile.",
    metric: "-22 pts",
    severity: "bad",
  },
  {
    title: "Users who see the recommendation early retain much better at D14",
    body: "Users who see the recommendation in their first session are at roughly 38% on day 14, vs around 16% for users who don't.",
    metric: "+22 pts",
    severity: "good",
  },
  {
    title: "Streak users retain +6.1 points at D7",
    body: "Getting a 3 day streak in week 1 is the strongest engagement loop in the data. Worth nudging users into it.",
    metric: "+6.1 pts",
    severity: "good",
  },
  {
    title: "Onboarding A/B, variant B wins (p = 0.013)",
    body: "2 step onboarding beats 3 step by +8.6 points on activation. 95% CI is [+1.9, +15.3] points.",
    metric: "+8.6 pts",
    severity: "good",
  },
];

export const recommendations = [
  {
    title: "Shorten onboarding to 2 steps with chip multi select",
    rationale: "Step 2 of the 3 step flow loses 27% of users. Pre checking the 6 common subjects should get rid of the choice overload.",
    projected_lift: "+11.4 pts activation",
    effort: "1 week",
    owner: "Onboarding",
    rice: 9000,
  },
  {
    title: "Show the recommendation on day 0, above the fold",
    rationale: "Users who see the recommendation in their first session retain noticeably better at D14. Worth surfacing early.",
    projected_lift: "+8 pts D14 retention",
    effort: "1 week",
    owner: "Product",
    rice: 8000,
  },
  {
    title: "Ship a streak counter with 'don't lose it' wording",
    rationale: "Streak users retain 41% at D7 vs 29% without. Loss framed copy tends to do better than gain framed.",
    projected_lift: "+6.1 pts D7 retention",
    effort: "1.5 weeks",
    owner: "Engagement",
    rice: 2240,
  },
  {
    title: "Redo the signup form for mobile first",
    rationale: "Mobile is 47% of traffic but converts 22 points lower than desktop. The signup form is the obvious bottleneck.",
    projected_lift: "+15 pts mobile signup",
    effort: "2 weeks",
    owner: "Growth",
    rice: 1260,
  },
  {
    title: "Email reminders on D3 and D7 for dormant users",
    rationale: "62% of users who go dormant by D7 never come back. A reminder with the unfinished plan should help.",
    projected_lift: "+4 pts D14 retention",
    effort: "2 weeks",
    owner: "Lifecycle",
    rice: 1225,
  },
];

export const wapTrend = [
  { week: "W1", wap: 410 }, { week: "W2", wap: 472 }, { week: "W3", wap: 521 },
  { week: "W4", wap: 558 }, { week: "W5", wap: 612 }, { week: "W6", wap: 689 },
  { week: "W7", wap: 754 }, { week: "W8", wap: 821 }, { week: "W9", wap: 889 },
  { week: "W10", wap: 952 }, { week: "W11", wap: 1041 }, { week: "W12", wap: 1184 },
];
