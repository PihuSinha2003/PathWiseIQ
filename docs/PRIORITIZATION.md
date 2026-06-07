# Prioritization

How I picked what to build.

## RICE scores

Formula: (Reach x Impact x Confidence) / Effort. Reach is rough users per month, Impact is 0.25 to 3, Confidence is a %, Effort is in weeks.

| Feature | Reach | Impact | Confidence | Effort | RICE |
|---|---:|---:|---:|---:|---:|
| Shorter 2 step onboarding | 5000 | 2 | 90% | 1 | 9000 |
| Show recommendation on day 0 | 5000 | 2 | 80% | 1 | 8000 |
| Streak counter | 4200 | 1 | 80% | 1.5 | 2240 |
| Fix mobile signup form | 2800 | 1 | 90% | 2 | 1260 |
| Email reminders on D3 and D7 | 3500 | 1 | 70% | 2 | 1225 |
| Show why the app picked this task | 3000 | 1 | 60% | 1.5 | 1200 |
| Pomodoro timer | 2200 | 1 | 60% | 2 | 660 |
| Native mobile app | 5000 | 2 | 80% | 16 | 500 |

## What made the cut for v1

Onboarding, plan generation, the recommendation, task check-off, event tracking, the dashboard, streak counter.

The mobile-first signup redesign didn't make v1 but the data says I should probably do it next.

## What I dropped

Native mobile app scored poorly because 16 weeks of effort is too much right now. The Pomodoro timer was something I wanted to build personally but the RICE score was low enough that it felt like a distraction. Email reminders are straightforward but I wanted to understand the product better before adding lifecycle messaging.

## One thing I'd do differently

I built event tracking before any user-facing feature. It slowed me down early but it meant every release had a question I could actually answer. Worth it.
