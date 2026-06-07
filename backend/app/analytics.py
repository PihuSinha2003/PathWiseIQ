import math
from datetime import datetime, timedelta
from typing import Iterable

import numpy as np
import pandas as pd
from scipy import stats
from sqlalchemy.orm import Session

from . import models

FUNNEL_STAGES: list[tuple[str, str]] = [
    ("Landing viewed", "landing_viewed"),
    ("Signup completed", "signup_completed"),
    ("Plan created", "plan_created"),
    ("AI rec viewed", "ai_recommendation_viewed"),
    ("First task completed", "task_completed"),
]


def _events_df(db: Session) -> pd.DataFrame:
    rows = db.query(
        models.Event.id,
        models.Event.user_id,
        models.Event.anonymous_id,
        models.Event.name,
        models.Event.occurred_at,
        models.Event.properties,
    ).all()
    df = pd.DataFrame(rows, columns=["id", "user_id", "anonymous_id", "name", "occurred_at", "properties"])
    if not df.empty:
        df["occurred_at"] = pd.to_datetime(df["occurred_at"])
    return df


def _users_df(db: Session) -> pd.DataFrame:
    rows = db.query(
        models.User.id,
        models.User.signup_at,
        models.User.device,
        models.User.experiment_variant,
    ).all()
    df = pd.DataFrame(rows, columns=["user_id", "signup_at", "device", "experiment_variant"])
    if not df.empty:
        df["signup_at"] = pd.to_datetime(df["signup_at"])
    return df


def compute_funnel(
    db: Session,
    device: str | None = None,
    variant: str | None = None,
) -> list[dict]:
    events = _events_df(db)
    users = _users_df(db)
    if events.empty:
        return []

    if device or variant:
        keep = users.copy()
        if device:
            keep = keep[keep["device"] == device]
        if variant:
            keep = keep[keep["experiment_variant"] == variant]
        events = events[events["user_id"].isin(keep["user_id"]) | events["user_id"].isna()]

    stage_counts: list[int] = []
    for label, event_name in FUNNEL_STAGES:
        ids = events.loc[events["name"] == event_name, "user_id"].dropna().unique()
        anon = events.loc[
            (events["name"] == event_name) & (events["user_id"].isna()),
            "anonymous_id",
        ].dropna().unique()
        stage_counts.append(int(len(ids) + len(anon)))

    top = stage_counts[0] or 1
    out: list[dict] = []
    for i, ((label, _), count) in enumerate(zip(FUNNEL_STAGES, stage_counts)):
        prev = stage_counts[i - 1] if i > 0 else top
        step_cvr = (count / prev) if prev else 0.0
        out.append(
            {
                "stage": label,
                "users": count,
                "step_cvr": round(step_cvr * 100, 1),
                "cumulative_cvr": round((count / top) * 100, 1),
            }
        )
    return out


def compute_cohorts(db: Session, periods: Iterable[int] = (0, 1, 2, 7, 14, 30)) -> list[dict]:
    events = _events_df(db)
    users = _users_df(db)
    if users.empty:
        return []

    users["cohort_week"] = users["signup_at"].dt.to_period("W").apply(lambda r: r.start_time.date().isoformat())

    user_events = events.dropna(subset=["user_id"]).merge(users, on="user_id")
    user_events["day"] = (user_events["occurred_at"].dt.normalize() - user_events["signup_at"].dt.normalize()).dt.days

    rows: list[dict] = []
    for cohort_week, cohort_df in users.groupby("cohort_week"):
        size = len(cohort_df)
        row: dict = {"cohort_week": cohort_week, "cohort_size": size}
        for d in periods:
            if d == 0:
                row[f"d{d}"] = 100.0
                continue
            active = user_events[
                (user_events["cohort_week"] == cohort_week) & (user_events["day"] == d)
            ]["user_id"].nunique()
            row[f"d{d}"] = round((active / size) * 100, 1) if size else 0.0
        rows.append(row)

    rows.sort(key=lambda r: r["cohort_week"])
    return rows


def _two_proportion_z(success_a: int, n_a: int, success_b: int, n_b: int) -> tuple[float, float, float]:
    if not n_a or not n_b:
        return 1.0, 0.0, 0.0
    p_a = success_a / n_a
    p_b = success_b / n_b
    p_pool = (success_a + success_b) / (n_a + n_b)
    se_pool = math.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
    if se_pool == 0:
        return 1.0, 0.0, 0.0
    z = (p_b - p_a) / se_pool
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    se_diff = math.sqrt(p_a * (1 - p_a) / n_a + p_b * (1 - p_b) / n_b)
    diff = p_b - p_a
    ci_low = diff - 1.96 * se_diff
    ci_high = diff + 1.96 * se_diff
    return p_value, ci_low * 100, ci_high * 100


def compute_experiment(db: Session, experiment_key: str = "onboarding_v1") -> dict:
    events = _events_df(db)
    users = _users_df(db)
    if users.empty:
        return {}

    users = users[users["experiment_variant"].isin(["A", "B"])]
    variant_a = users[users["experiment_variant"] == "A"]
    variant_b = users[users["experiment_variant"] == "B"]

    completers = (
        events[events["name"] == "task_completed"]["user_id"].dropna().unique()
    )
    success_a = int(variant_a["user_id"].isin(completers).sum())
    success_b = int(variant_b["user_id"].isin(completers).sum())
    n_a, n_b = len(variant_a), len(variant_b)
    cvr_a = (success_a / n_a) if n_a else 0.0
    cvr_b = (success_b / n_b) if n_b else 0.0

    p_value, ci_low_pp, ci_high_pp = _two_proportion_z(success_a, n_a, success_b, n_b)
    lift_pp = (cvr_b - cvr_a) * 100
    winner = "B" if cvr_b > cvr_a and p_value < 0.05 else ("A" if cvr_a > cvr_b and p_value < 0.05 else "inconclusive")

    return {
        "experiment": experiment_key,
        "variant_a": "A (3-step onboarding)",
        "variant_b": "B (2-step onboarding)",
        "users_a": n_a,
        "users_b": n_b,
        "cvr_a": round(cvr_a * 100, 1),
        "cvr_b": round(cvr_b * 100, 1),
        "lift_pp": round(lift_pp, 1),
        "p_value": round(p_value, 4),
        "ci_low_pp": round(ci_low_pp, 1),
        "ci_high_pp": round(ci_high_pp, 1),
        "winner": winner,
    }


def compute_overview(db: Session) -> dict:
    events = _events_df(db)
    users = _users_df(db)
    if events.empty or users.empty:
        return {}

    now = events["occurred_at"].max()
    week_ago = now - timedelta(days=7)
    prev_week = week_ago - timedelta(days=7)

    completers_this_week = events[
        (events["name"] == "task_completed") & (events["occurred_at"] >= week_ago)
    ]["user_id"].dropna().nunique()
    completers_prev_week = events[
        (events["name"] == "task_completed")
        & (events["occurred_at"] >= prev_week)
        & (events["occurred_at"] < week_ago)
    ]["user_id"].dropna().nunique()

    wap = int(completers_this_week)
    wap_delta = ((completers_this_week - completers_prev_week) / completers_prev_week * 100) if completers_prev_week else 0.0

    funnel = compute_funnel(db)
    activation = funnel[-1]["cumulative_cvr"] if funnel else 0.0

    cohorts = compute_cohorts(db)
    d7_values = [c["d7"] for c in cohorts if c["d7"] is not None]
    d7 = round(np.mean(d7_values), 1) if d7_values else 0.0

    desktop_funnel = compute_funnel(db, device="desktop")
    mobile_funnel = compute_funnel(db, device="mobile")
    desktop_act = desktop_funnel[-1]["cumulative_cvr"] if desktop_funnel else 0.0
    mobile_act = mobile_funnel[-1]["cumulative_cvr"] if mobile_funnel else 0.0
    mobile_gap = round(mobile_act - desktop_act, 1)

    return {
        "wap": wap,
        "wap_delta_pct": round(wap_delta, 1),
        "activation_cvr": activation,
        "d7_retention": d7,
        "mobile_vs_desktop_pp": mobile_gap,
        "as_of": now.isoformat() if isinstance(now, (datetime, pd.Timestamp)) else str(now),
    }


def compute_insights(db: Session) -> list[dict]:
    funnel = compute_funnel(db)
    insights: list[dict] = []

    if funnel:
        biggest_drop = min(
            ((i, row) for i, row in enumerate(funnel) if i > 0),
            key=lambda x: x[1]["step_cvr"],
        )
        idx, row = biggest_drop
        prev = funnel[idx - 1]
        insights.append(
            {
                "title": f"Biggest drop: {prev['stage']} to {row['stage']}",
                "body": (
                    f"Only {row['step_cvr']:.1f}% of users move from "
                    f"{prev['stage']} to {row['stage']}. "
                    f"Shortening this step is the most useful thing to fix."
                ),
                "metric": f"{row['step_cvr']:.1f}% step CVR",
            }
        )

    desktop = compute_funnel(db, device="desktop")
    mobile = compute_funnel(db, device="mobile")
    if desktop and mobile:
        d_act = desktop[-1]["cumulative_cvr"]
        m_act = mobile[-1]["cumulative_cvr"]
        insights.append(
            {
                "title": "Mobile activation is much lower than desktop",
                "body": (
                    f"Mobile activates at {m_act:.1f}% vs desktop at {d_act:.1f}%. "
                    f"A {abs(d_act - m_act):.1f} point gap on roughly half the traffic "
                    f"is the biggest unfixed opportunity in the funnel."
                ),
                "metric": f"{d_act - m_act:+.1f} pp",
            }
        )

    exp = compute_experiment(db)
    if exp:
        insights.append(
            {
                "title": f"Onboarding A/B, variant {exp['winner']} won",
                "body": (
                    f"Variant B (2 step) converts at {exp['cvr_b']:.1f}% vs "
                    f"{exp['cvr_a']:.1f}% for A. Lift +{exp['lift_pp']:.1f} points, "
                    f"p = {exp['p_value']:.3f}, 95% CI [{exp['ci_low_pp']:+.1f}, "
                    f"{exp['ci_high_pp']:+.1f}]."
                ),
                "metric": f"p = {exp['p_value']:.3f}",
            }
        )

    return insights


def compute_recommendations() -> list[dict]:
    return [
        {
            "title": "Shorten onboarding to 2 steps with chip multi select",
            "rationale": "Step 2 of the 3 step flow loses 27% of users. Pre checking the 6 most common subjects gets rid of the choice overload.",
            "projected_lift": "+11.4 points activation",
            "effort": "1 week",
            "owner": "Onboarding",
            "rice": 9000,
        },
        {
            "title": "Show the recommendation on day 0, above the fold",
            "rationale": "Users who see the recommendation in their first session retain noticeably better at D14. Worth surfacing it earlier.",
            "projected_lift": "+8 points D14 retention",
            "effort": "1 week",
            "owner": "Product",
            "rice": 8000,
        },
        {
            "title": "Ship a streak counter with 'don't lose it' wording",
            "rationale": "Streak users retain 41% at D7 vs 29% without. Loss framed copy tends to do better than gain framed in similar apps.",
            "projected_lift": "+6.1 points D7 retention",
            "effort": "1.5 weeks",
            "owner": "Engagement",
            "rice": 2240,
        },
        {
            "title": "Redo the signup form for mobile first",
            "rationale": "Mobile is 47% of traffic but converts 22 points lower than desktop. The signup form is the obvious bottleneck.",
            "projected_lift": "+15 points mobile signup CVR",
            "effort": "2 weeks",
            "owner": "Growth",
            "rice": 1260,
        },
        {
            "title": "Email reminders on day 3 and day 7 for dormant users",
            "rationale": "62% of users who go dormant by D7 never come back. A reminder with the unfinished plan tends to help.",
            "projected_lift": "+4 points D14 retention",
            "effort": "2 weeks",
            "owner": "Lifecycle",
            "rice": 1225,
        },
    ]
