# PathwiseIQ

A study planner app for students plus a product analytics dashboard I built on top of it.

I made this to practice product thinking the way a PM or analyst would. So instead of just building the app, I also tracked what users do, drew a funnel, ran a fake A/B test, and wrote down what I would change next.

## What it does

The app lets a student pick a few subjects and an exam date, then shows them a daily plan and a "do this next" suggestion. Nothing fancy.

The interesting part is the dashboard. It answers questions like:

* where do users drop off between landing and finishing their first task
* which week's signups stick around the longest
* did the shorter onboarding flow actually beat the longer one
* what should I change next, and why

## What the dashboard shows (using generated demo data)

A few things it surfaces from the fake data:

* landing to signup is around 42%
* step 2 of onboarding is where the most users drop off
* mobile converts noticeably worse than desktop
* users who see the recommendation early retain better at D14
* the shorter onboarding (variant B) won the A/B test at p = 0.013

The numbers come from a seeder, not real users. The drop-off shapes and retention curves are set up so the dashboard tells a coherent story rather than showing random noise.

## Stack

* React, Vite, Tailwind, Recharts for the frontend
* FastAPI and SQLAlchemy for the API
* SQLite by default, swap in Postgres with one env var
* Pandas and SciPy for the analytics script
* Plain SQL files in `analytics/sql/` so the same queries can plug into Metabase or Power BI

## How the app is structured

```
pathwise-iq/
  README.md
  docs/                  PRD, prioritization, KPIs, wireframes, insights writeup
  frontend/              React app (the planner + the dashboard live here)
  backend/               FastAPI service
    app/
      main.py            routes
      models.py          tables
      analytics.py       funnel, cohort, A/B math
      seed.py            generates the demo data
  analytics/
    sql/                 funnel, cohort, experiment, feature adoption SQL
    python/analysis.py   prints headline numbers from the database
```

## Run it

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # or source .venv/bin/activate on mac/linux
pip install -r requirements.txt
python -m app.seed              # creates pathwise.db with ~5000 fake users
uvicorn app.main:app --reload   # API on :8000
```

Frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev                     # app on :5173
```

If the backend isn't running, the dashboard still works because the frontend falls back to the demo data baked into `src/data/mock.js`.

Optional analytics script:

```bash
cd analytics/python
python analysis.py              # prints funnel + cohort + A/B in the terminal
```

## What's in the docs folder

* `PRD.md`: what the product is and what it isn't
* `PRIORITIZATION.md`: which features I picked and why (RICE table)
* `NORTH_STAR.md`: the one number I'd care about most
* `KPI_FRAMEWORK.md`: the metric tree and the events I track
* `INSIGHTS.md`: five things I noticed in the data
* `CASE_STUDY.md`: the story version of the whole thing
* `wireframes/`: rough sketches of every screen before I built it
* `RESUME_BULLETS.md`: short lines I can paste into a resume or LinkedIn

Start with `CASE_STUDY.md` if you want the story, or jump into the dashboard at `/` if you cloned it locally.
