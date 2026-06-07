# KPI framework

The things I decided to measure and the events that feed them.

## Main metrics

| Metric | What it means | Rough target |
|---|---|---:|
| Weekly Active Planners | users who finished at least one task in the last 7 days | 1500 |
| Landing to signup | what % of visitors actually sign up | 40% |
| Signup to first task done | what % of signups get through onboarding and do something | 55% |
| D7 retention | % of a signup cohort that came back on day 7 | 30% |
| D14 retention | % that came back on day 14 | 22% |
| D30 retention | % that came back on day 30 | 16% |
| Recommendation click rate | how often the day 0 suggestion gets clicked | 35% |

The targets are rough guesses I set before looking at any data.

## Events I track

These get sent to `/events` whenever something meaningful happens. I tried to keep the list small so the SQL stays simple.

| Event | When |
|---|---|
| landing_viewed | user hits the home page |
| signup_started | clicked the CTA |
| signup_completed | account created |
| onboarding_step_viewed | any onboarding screen opens |
| onboarding_step_completed | step submitted |
| onboarding_abandoned | closed onboarding halfway |
| plan_created | first plan generated |
| ai_recommendation_viewed | the recommendation box rendered |
| ai_recommendation_clicked | user clicked it |
| task_completed | task marked done |
| streak_extended | streak count went up |
| session_started | app opened |
| feature_flag_exposed | user got put into an A/B test |

Each event stores a few extra fields (device type, which variant they're in, which step) so I can filter later without changing the schema.
