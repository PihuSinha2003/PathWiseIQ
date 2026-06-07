# Wireframes

I sketched every screen in markdown before opening the editor. Nothing fancy, just enough to make sure each screen has one clear thing for the user to do next.

The live versions are in `frontend/src/views/`.

## 1. Landing

```
+----------------------------------------------------+
|  PathwiseIQ                    [ Login ] [ Sign up ]|
+----------------------------------------------------+
|                                                    |
|   Know exactly what to study next.                 |
|   A study planner that tells you what to do.       |
|                                                    |
|        [    Get started, it's free    ]            |
|                                                    |
|   * personalised to your exam date                 |
|   * tells you the next best task to do             |
|   * streak counter that actually keeps you going   |
|                                                    |
|   [ small preview image of the planner ]           |
+----------------------------------------------------+
events: landing_viewed, signup_started
```

## 2. Onboarding, the 3 step version (control)

```
Step 1 of 3
+-----------------------------+
| What's your goal?           |
|  ( ) crack semester exams   |
|  ( ) crack a competitive    |
|  ( ) build a portfolio      |
|       [ Next ]              |
+-----------------------------+

Step 2 of 3   ** biggest leak here **
+-----------------------------+
| Pick your subjects          |
|  [ list of 24 checkboxes ]  |
|       [ Next ]              |
+-----------------------------+

Step 3 of 3
+-----------------------------+
| How many hours a day?       |
|  [ slider 1 to 8 ]          |
|       [ Finish ]            |
+-----------------------------+
```

## 3. Onboarding, the 2 step version (the one that won)

```
Step 1 of 2
+-----------------------------+
| When's your exam?           |
|  [ date picker ]            |
|       [ Next ]              |
+-----------------------------+

Step 2 of 2  (chips, 6 pre-checked)
+-----------------------------+
| Subjects                    |
|  [DS]v [DBMS]v [OS]v [CN]v  |
|  [DSA]v [OOP]v [ML] [AI]    |
|       [ Generate my plan ]  |
+-----------------------------+
```

## 4. The plan view

```
+--------------------------------------------------+
|  Your week               Streak: 4 days          |
+--------------------------------------------------+
|  Do this next:                                   |
|  DBMS, 5 normalisation problems, ~25 min         |
|  Why? You haven't touched DBMS in 3 days and     |
|  the exam is in 12.                              |
|        [ Start task ]  [ Skip ]                  |
|                                                  |
|  Today                                           |
|   [ ] DBMS, normalisation (25 min)               |
|   [ ] OS, process scheduling (30 min)            |
|   [ ] DSA, 2 graph problems (40 min)             |
|                                                  |
|  This week  [#####.....]  5 of 12 tasks done     |
+--------------------------------------------------+
events: ai_recommendation_viewed, task_started, task_completed, streak_extended
```

## 5. Dashboard, Overview

```
+--------------------------------------------------+
| Overview  Funnel  Cohorts  A/B  Insights  Recs   |
+--------------------------------------------------+
| [NSM 1184 +19%] [D7 34.8%] [Act 42.1%] [Mob -22] |
| [ Weekly Active Planners trend, 12 weeks ]       |
| [ Funnel preview ]   [ Top insight card ]        |
+--------------------------------------------------+
```

## 6. Funnel

```
Landing  ###################  100%  (12,000)
Signup   ########             42%   (5,053)   -58%
Plan     #####                25%   (2,966)   -41%
Rec      ####                 20%   (2,401)   -19%
Task     ###                  18%   (2,114)   -12%
```

## 7. Cohort grid

```
        D0   D1   D2   D7   D14  D30
Wk 1    100  64   48   32   22   15
Wk 2    100  67   51   34   23   17
Wk 3    100  72   55   36   25   18
Wk 4    100  74   57   38   27   20
Wk 5    100  78   60   41   30   22   <- after streak shipped
```

## 8. A/B test view

```
Onboarding A/B, running 14 days
                 A           B
Users            2,512       2,541
Signup to task   39.8%       48.4%       +8.6 points
p value          n/a         0.013       significant
95% CI on lift   [ +1.9 to +15.3 points ]
Verdict          --          ship B
```
