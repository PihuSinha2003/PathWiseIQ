# PRD: PathwiseIQ Study Planner

This is the planning doc I wrote before starting to code.

## The problem

Final year students already use Google Calendar or Notion to plan, but those tools don't help with the actual question: *what should I study right now?*

I asked about a dozen friends and sent a short form to around 80 people. A few things came up repeatedly:

* most people give up on their study plan within a week
* the hardest moment is sitting down and not knowing where to start
* existing tools don't really help you make a decision

So the product needs to answer one thing well: what's the most useful thing I can do in the next 30 minutes?

## Who it's for

Mostly CS and engineering students in their final year. I'm not building for casual learners with no deadline.

## What's in v1

1. Landing page
2. Email signup
3. Short onboarding (exam date, subjects, hours per day)
4. A weekly plan generated from those inputs
5. A "do this next" suggestion at the top of the plan
6. Task check-off and a streak counter
7. Event tracking on the steps that matter
8. A small dashboard for my own product questions

## What's not in v1

* No mobile app, just a responsive web version
* No payments
* No content — the app tells you what to study, you bring the material
* No group or classroom features

## Numbers I'd roughly like to hit

These are guesses I set before looking at any data.

* Landing to signup: around 40%
* Signup to first task done: around 55%
* D7 retention: 30%
* North star (Weekly Active Planners): 1,500

## Things I was unsure about

* Will people trust a plan the app generated? Probably yes if I explain why each task was chosen.
* Is 3 step onboarding too long? I tested a 2 step version to find out.
* Mobile might be a problem if the form is the same as desktop.

## Definitions

* **Activated user**: someone who finished their first task within 24 hours of signing up
* **WAP**: Weekly Active Planner, anyone who finished at least one task in the last 7 days
* **D7 / D14 / D30**: % of a signup cohort that came back on that day
