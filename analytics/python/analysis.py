"""Prints the headline funnel, cohort and A/B numbers from the database."""
import math
import os
import sys
from pathlib import Path

import pandas as pd
from scipy import stats
from sqlalchemy import create_engine, text

REPO = Path(__file__).resolve().parents[2]
DEFAULT_DB = f"sqlite:///{(REPO / 'backend' / 'pathwise.db').as_posix()}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB)

engine = create_engine(DATABASE_URL, future=True)


def load() -> tuple[pd.DataFrame, pd.DataFrame]:
    with engine.connect() as conn:
        users = pd.read_sql(
            text("SELECT id AS user_id, signup_at, device, experiment_variant FROM users"), conn
        )
        events = pd.read_sql(
            text("SELECT user_id, anonymous_id, name, occurred_at FROM events"), conn
        )
    if not users.empty:
        users["signup_at"] = pd.to_datetime(users["signup_at"])
    if not events.empty:
        events["occurred_at"] = pd.to_datetime(events["occurred_at"])
    return users, events


FUNNEL = [
    ("Landing viewed", "landing_viewed"),
    ("Signup completed", "signup_completed"),
    ("Plan created", "plan_created"),
    ("AI rec viewed", "ai_recommendation_viewed"),
    ("First task completed", "task_completed"),
]


def funnel(events: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for label, name in FUNNEL:
        sub = events[events["name"] == name]
        n_users = sub["user_id"].dropna().nunique()
        n_anon = sub.loc[sub["user_id"].isna(), "anonymous_id"].nunique()
        rows.append({"stage": label, "users": int(n_users + n_anon)})
    df = pd.DataFrame(rows)
    top = df["users"].iloc[0] if len(df) else 1
    df["cumulative_pct"] = (df["users"] / top * 100).round(1)
    df["step_pct"] = (df["users"] / df["users"].shift(1).fillna(top) * 100).round(1)
    return df


def cohort(users: pd.DataFrame, events: pd.DataFrame, days=(1, 2, 7, 14, 30)) -> pd.DataFrame:
    users = users.copy()
    users["cohort_week"] = users["signup_at"].dt.to_period("W").dt.start_time.dt.date

    ue = events.dropna(subset=["user_id"]).merge(users, on="user_id")
    ue["day_offset"] = (ue["occurred_at"].dt.normalize() - ue["signup_at"].dt.normalize()).dt.days

    rows = []
    for week, grp in users.groupby("cohort_week"):
        size = len(grp)
        row = {"cohort_week": week.isoformat(), "cohort_size": size}
        for d in days:
            active = ue[(ue["cohort_week"] == week) & (ue["day_offset"] == d)]["user_id"].nunique()
            row[f"d{d}"] = round(active / size * 100, 1) if size else 0.0
        rows.append(row)
    return pd.DataFrame(rows).sort_values("cohort_week").reset_index(drop=True)


def experiment(users: pd.DataFrame, events: pd.DataFrame) -> dict:
    completers = set(events.loc[events["name"] == "task_completed", "user_id"].dropna().astype(int))

    def stats_for(variant: str) -> tuple[int, int]:
        sub = users[users["experiment_variant"] == variant]
        n = len(sub)
        k = sub["user_id"].isin(completers).sum()
        return int(k), int(n)

    k_a, n_a = stats_for("A")
    k_b, n_b = stats_for("B")
    if not n_a or not n_b:
        return {}

    p_a = k_a / n_a
    p_b = k_b / n_b
    p_pool = (k_a + k_b) / (n_a + n_b)
    se_pool = math.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
    z = (p_b - p_a) / se_pool if se_pool else 0.0
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    se_diff = math.sqrt(p_a * (1 - p_a) / n_a + p_b * (1 - p_b) / n_b)
    diff = p_b - p_a
    ci_low = (diff - 1.96 * se_diff) * 100
    ci_high = (diff + 1.96 * se_diff) * 100

    return {
        "n_a": n_a,
        "n_b": n_b,
        "cvr_a": round(p_a * 100, 1),
        "cvr_b": round(p_b * 100, 1),
        "lift_pp": round(diff * 100, 1),
        "p_value": round(p_value, 4),
        "ci_low_pp": round(ci_low, 1),
        "ci_high_pp": round(ci_high, 1),
        "winner": "B" if (p_b > p_a and p_value < 0.05) else ("A" if (p_a > p_b and p_value < 0.05) else "inconclusive"),
    }


def ai_rec_retention_lift(users: pd.DataFrame, events: pd.DataFrame) -> dict:
    saw = set(events.loc[events["name"] == "ai_recommendation_viewed", "user_id"].dropna().astype(int))
    ue = events.dropna(subset=["user_id"]).merge(users, on="user_id")
    ue["day_offset"] = (ue["occurred_at"].dt.normalize() - ue["signup_at"].dt.normalize()).dt.days

    def retention(segment_users: set[int], day: int) -> float:
        if not segment_users:
            return 0.0
        active_in_seg = ue[(ue["day_offset"] == day) & (ue["user_id"].isin(segment_users))]["user_id"].nunique()
        return round(active_in_seg / len(segment_users) * 100, 1)

    all_users = set(users["user_id"])
    not_saw = all_users - saw

    return {
        "saw_d7":  retention(saw, 7),
        "saw_d14": retention(saw, 14),
        "no_d7":   retention(not_saw, 7),
        "no_d14":  retention(not_saw, 14),
    }


def banner(text: str) -> None:
    print()
    print("=" * len(text))
    print(text)
    print("=" * len(text))


def main() -> None:
    users, events = load()
    if users.empty or events.empty:
        print("No data. Run `python -m app.seed` from the backend folder first.")
        sys.exit(1)

    banner("FUNNEL (Landing > Signup > Plan > Rec > Task)")
    print(funnel(events).to_string(index=False))

    banner("COHORT RETENTION (weekly signup cohorts, %)")
    print(cohort(users, events).to_string(index=False))

    banner("ONBOARDING A/B")
    exp = experiment(users, events)
    if exp:
        print(f"  Variant A users : {exp['n_a']:>5}    activation = {exp['cvr_a']}%")
        print(f"  Variant B users : {exp['n_b']:>5}    activation = {exp['cvr_b']}%")
        print(f"  Lift            : {exp['lift_pp']:+} points")
        print(f"  p-value         : {exp['p_value']}")
        print(f"  95% CI on lift  : [{exp['ci_low_pp']:+}, {exp['ci_high_pp']:+}] points")
        print(f"  Winner          : {exp['winner']}")

    banner("RECOMMENDATION VS RETENTION")
    lift = ai_rec_retention_lift(users, events)
    print(f"  Saw rec      D7={lift['saw_d7']}%   D14={lift['saw_d14']}%")
    print(f"  Did not see  D7={lift['no_d7']}%   D14={lift['no_d14']}%")


if __name__ == "__main__":
    main()
