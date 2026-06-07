# What the data showed

Numbers here come from the seeded data. You can re-run them with `analytics/python/analysis.py` or the SQL files in `analytics/sql/`.

## 1. Step 2 of onboarding is where most people leave

The funnel roughly looks like this:

| Stage | Users | Step % |
|---|---:|---:|
| Landing | ~12,000 | |
| Signup completed | 5,053 | 42% |
| Onboarding step 1 done | 4,420 | 88% |
| **Onboarding step 2 done** | **3,224** | **73%** |
| Onboarding step 3 done | 2,966 | 92% |
| First task done | 2,114 | |

Step 2 is "pick your subjects" with 24 checkboxes in a list. That's where a big chunk of users drop off. My guess is too many options at once.

What I'd change: swap the list for 6 pre-selected chips. That's the top recommendation in the dashboard.

## 2. Users who see the recommendation early stick around more

| Group | D7 retention | D14 retention |
|---|---:|---:|
| Saw recommendation in first session | ~51% | ~38% |
| Did not see it | ~22% | ~16% |

Around 2x the retention at D14. That's enough of a gap that I'd push the recommendation to the top of the screen on day 0.

## 3. Mobile is converting much worse

| Device | Landing to signup | Signup to first task |
|---|---:|---:|
| Desktop | ~53% | ~65% |
| Mobile | ~31% | ~49% |

Mobile is about half the traffic but converts at almost half the desktop rate. The signup form probably doesn't work well on a small screen.

## 4. Streak users seem to come back more

| Group | D7 retention |
|---|---:|
| Had a 3+ day streak in week 1 | ~41% |
| Did not | ~29% |

It's hard to say if streaks cause the retention or if the kind of person who builds a streak was going to stick around anyway. But the gap is big enough that it's worth keeping the feature.

## 5. The onboarding A/B test

| Variant | Users | Activation |
|---|---:|---:|
| A: 3 step | 2,512 | 39.8% |
| B: 2 step | 2,541 | 48.4% |

Variant B came out about 8.6 points higher. I ran a two-proportion z-test and got p = 0.013, which is significant. The 95% confidence interval is roughly +2 to +15 points, so the win is real.
