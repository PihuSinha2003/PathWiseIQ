# Case study

## Why I built this

I'm wrapping up final year and I wanted a project that wasn't just another CRUD app. I'm interested in how products actually get better over time, so I picked a small product idea and built both the product *and* the analytics around it. The point was less about the app and more about learning to think like the people who decide what to build next.

I picked a study planner because it's something I'd actually use during exam season.

## How I went about it

I gave myself roughly six weeks.

First I wrote a small PRD — what problem, who for, what's in v1 and what isn't. I had more ideas than time so I made a RICE table to force-rank them. Things I was excited about (like a Pomodoro timer) ended up near the bottom because the effort wasn't worth it relative to fixing onboarding.

Before writing any code I decided the one metric I actually cared about: users who finished at least one task that week. Signups felt too easy to inflate. A finished task means the product did something useful.

Then I built it. React and Tailwind for the frontend, FastAPI and SQLite for the backend. The "AI" recommendation is just a rule — pick the subject the user hasn't touched in the longest time and that's soonest before their exam. Nothing fancy.

Since I don't have real users, I wrote a seeder that generates around 5,000 fake users over 90 days. The drop-offs and retention curves are shaped to match what you'd plausibly see in a real early-stage app, so the dashboard tells a story instead of showing noise.

The queries are in `analytics/sql/` and there's a pandas script in `analytics/python/analysis.py` that prints the same numbers in the terminal. The FastAPI service computes everything live from the database and the dashboard reads from it.

The five things I noticed in the data are in `INSIGHTS.md`. The biggest ones were the onboarding step 2 leak, the mobile conversion gap, and the day 0 recommendation signal.

## Things I'd do differently

* I instrumented events first and then built features. That was the right call but it made the first two weeks feel slow.
* The seeder ended up being more code than I expected. If I had real users I'd skip a lot of it.
* I spent time on the cohort heatmap colors and probably should have spent it on the mobile layout.

## What I would build next

1. Email reminders on day 3 and 7 for users who go dormant.
2. A real spaced repetition logic for the recommendation, not just "longest untouched".
3. A simple friends-as-streak-partners thing. Accountability tends to keep people coming back.

That's roughly it. The README has the stack and how to run it.
