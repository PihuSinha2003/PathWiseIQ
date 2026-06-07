"""Generates fake users and events so the dashboard has something to show."""
import random
import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from . import models

random.seed(42)

DAYS = 90
USERS_PER_DAY_RANGE = (40, 90)

SUBJECTS = ["DBMS", "OS", "CN", "DSA", "OOP", "ML", "AI", "OS", "Compilers", "DevOps"]

FUNNEL = {
    "desktop": {
        "landing_to_signup_start": 0.62,
        "signup_start_to_signup_done": 0.85,
        "signup_done_to_onb1": 0.92,
        "onb1_to_onb2": {"A": 0.70, "B": 0.88},
        "onb2_to_onb3": {"A": 0.94, "B": 1.0},
        "onb3_to_plan": 0.99,
        "plan_to_rec_viewed": 0.86,
        "rec_viewed_to_task_done": 0.91,
        "plan_to_task_no_rec": 0.30,
    },
    "mobile": {
        "landing_to_signup_start": 0.42,
        "signup_start_to_signup_done": 0.74,
        "signup_done_to_onb1": 0.86,
        "onb1_to_onb2": {"A": 0.60, "B": 0.82},
        "onb2_to_onb3": {"A": 0.88, "B": 1.0},
        "onb3_to_plan": 0.97,
        "plan_to_rec_viewed": 0.72,
        "rec_viewed_to_task_done": 0.85,
        "plan_to_task_no_rec": 0.21,
    },
    "tablet": {
        "landing_to_signup_start": 0.51,
        "signup_start_to_signup_done": 0.80,
        "signup_done_to_onb1": 0.89,
        "onb1_to_onb2": {"A": 0.66, "B": 0.85},
        "onb2_to_onb3": {"A": 0.91, "B": 1.0},
        "onb3_to_plan": 0.98,
        "plan_to_rec_viewed": 0.80,
        "rec_viewed_to_task_done": 0.88,
        "plan_to_task_no_rec": 0.26,
    },
}

DEVICE_MIX = [("desktop", 0.45), ("mobile", 0.47), ("tablet", 0.08)]
REFERRERS = ["google", "instagram", "linkedin", "direct", "youtube", "friend"]


def _pick_device() -> str:
    r = random.random()
    cum = 0.0
    for d, p in DEVICE_MIX:
        cum += p
        if r <= cum:
            return d
    return "desktop"


def _bernoulli(p: float) -> bool:
    return random.random() < p


def _add(db: Session, event: str, user_id: int | None, when: datetime, props: dict | None = None,
         anon_id: str | None = None) -> None:
    db.add(
        models.Event(
            name=event,
            user_id=user_id,
            anonymous_id=anon_id,
            properties=props or {},
            occurred_at=when,
        )
    )


def _retention_returns(activated: bool, has_streak: bool, day_offset: int) -> bool:
    base = {1: 0.55, 2: 0.42, 3: 0.34, 7: 0.28, 14: 0.20, 21: 0.15, 30: 0.13, 45: 0.10, 60: 0.08}
    p = base.get(day_offset, 0.05)
    if not activated:
        p *= 0.25
    if has_streak:
        p *= 1.45
    return _bernoulli(min(p, 0.95))


def seed(db: Session) -> None:
    print(f"Seeding {DAYS} days of fake data...")
    db.query(models.Event).delete()
    db.query(models.Task).delete()
    db.query(models.User).delete()
    db.commit()

    start = datetime.utcnow() - timedelta(days=DAYS)
    total_users = 0
    total_events = 0

    for day in range(DAYS):
        day_dt = start + timedelta(days=day)
        weekend = day_dt.weekday() >= 5
        visitors = random.randint(*USERS_PER_DAY_RANGE) * (3 if not weekend else 2)

        for _ in range(visitors):
            device = _pick_device()
            ref = random.choice(REFERRERS)
            variant = random.choice(["A", "B"])
            f = FUNNEL[device]

            visit_at = day_dt + timedelta(
                hours=random.randint(7, 23), minutes=random.randint(0, 59)
            )
            anon_id = uuid.uuid4().hex

            _add(db, "landing_viewed", None, visit_at,
                 {"device": device, "referrer": ref, "variant": variant}, anon_id=anon_id)
            total_events += 1

            if not _bernoulli(f["landing_to_signup_start"]):
                continue
            _add(db, "signup_started", None, visit_at + timedelta(seconds=20),
                 {"device": device}, anon_id=anon_id)
            total_events += 1

            if not _bernoulli(f["signup_start_to_signup_done"]):
                continue
            user = models.User(
                email=f"u{total_users:05d}+{anon_id[:6]}@pathwise.test",
                signup_at=visit_at + timedelta(minutes=1),
                device=device,
                referrer=ref,
                experiment_variant=variant,
            )
            db.add(user)
            db.flush()
            total_users += 1

            _add(db, "feature_flag_exposed", user.id, user.signup_at,
                 {"experiment": "onboarding_v1", "variant": variant})
            _add(db, "signup_completed", user.id, user.signup_at,
                 {"method": "email", "variant": variant})
            total_events += 2

            if not _bernoulli(f["signup_done_to_onb1"]):
                _add(db, "onboarding_abandoned", user.id, user.signup_at + timedelta(minutes=1),
                     {"step_index": 0})
                continue
            t1 = user.signup_at + timedelta(seconds=45)
            _add(db, "onboarding_step_viewed", user.id, t1, {"step_index": 1, "variant": variant})
            _add(db, "onboarding_step_completed", user.id, t1 + timedelta(seconds=30),
                 {"step_index": 1, "variant": variant})
            total_events += 2

            if not _bernoulli(f["onb1_to_onb2"][variant]):
                _add(db, "onboarding_abandoned", user.id, t1 + timedelta(minutes=1),
                     {"step_index": 1})
                continue
            t2 = t1 + timedelta(minutes=1)
            _add(db, "onboarding_step_viewed", user.id, t2, {"step_index": 2, "variant": variant})
            _add(db, "onboarding_step_completed", user.id, t2 + timedelta(seconds=40),
                 {"step_index": 2, "variant": variant})
            total_events += 2

            if variant == "A":
                if not _bernoulli(f["onb2_to_onb3"][variant]):
                    _add(db, "onboarding_abandoned", user.id, t2 + timedelta(minutes=1),
                         {"step_index": 2})
                    continue
                t3 = t2 + timedelta(minutes=1)
                _add(db, "onboarding_step_viewed", user.id, t3,
                     {"step_index": 3, "variant": variant})
                _add(db, "onboarding_step_completed", user.id, t3 + timedelta(seconds=30),
                     {"step_index": 3, "variant": variant})
                total_events += 2
                plan_t = t3 + timedelta(minutes=1)
            else:
                plan_t = t2 + timedelta(minutes=1)

            if not _bernoulli(f["onb3_to_plan"]):
                continue
            _add(db, "plan_created", user.id, plan_t,
                 {"subject_count": random.randint(3, 6), "weeks_to_exam": random.randint(2, 12)})
            total_events += 1

            for i, subj in enumerate(random.sample(SUBJECTS, k=random.randint(3, 5))):
                db.add(
                    models.Task(
                        user_id=user.id,
                        subject=subj,
                        title=f"{subj} practice set #{i+1}",
                        duration_min=random.choice([20, 30, 45, 60]),
                        created_at=plan_t,
                    )
                )

            saw_rec = _bernoulli(f["plan_to_rec_viewed"])
            if saw_rec:
                rec_t = plan_t + timedelta(seconds=20)
                _add(db, "ai_recommendation_viewed", user.id, rec_t,
                     {"position": "above_fold", "variant": variant})
                total_events += 1
                if _bernoulli(0.65):
                    _add(db, "ai_recommendation_clicked", user.id, rec_t + timedelta(seconds=5),
                         {"position": "above_fold"})
                    total_events += 1

            if saw_rec:
                will_complete = _bernoulli(f["rec_viewed_to_task_done"])
            else:
                will_complete = _bernoulli(f["plan_to_task_no_rec"])
            activated = will_complete
            if will_complete:
                done_t = plan_t + timedelta(minutes=random.randint(5, 40))
                _add(db, "task_started", user.id, done_t - timedelta(minutes=10),
                     {"subject": random.choice(SUBJECTS)})
                _add(db, "task_completed", user.id, done_t,
                     {"subject": random.choice(SUBJECTS), "duration_min": random.choice([20, 30, 45])})
                total_events += 2

            has_streak = activated and _bernoulli(0.35)
            if has_streak:
                streak_t = plan_t + timedelta(days=1, minutes=random.randint(0, 60))
                _add(db, "streak_extended", user.id, streak_t, {"streak_length": 2})
                total_events += 1

            for d_off in (1, 2, 3, 7, 14, 21, 30, 45, 60):
                if user.signup_at + timedelta(days=d_off) > datetime.utcnow():
                    break
                if _retention_returns(activated, has_streak, d_off):
                    ts = user.signup_at + timedelta(days=d_off, hours=random.randint(8, 22))
                    _add(db, "session_started", user.id, ts, {"device": device})
                    if _bernoulli(0.7):
                        _add(db, "task_started", user.id, ts + timedelta(minutes=2),
                             {"subject": random.choice(SUBJECTS)})
                        _add(db, "task_completed", user.id, ts + timedelta(minutes=random.randint(15, 60)),
                             {"subject": random.choice(SUBJECTS), "duration_min": random.choice([20, 30, 45])})
                        if has_streak:
                            _add(db, "streak_extended", user.id, ts + timedelta(minutes=1),
                                 {"streak_length": d_off + 1})
                    total_events += 3

        if day % 10 == 0:
            db.commit()
            print(f"  day {day:>3} / {DAYS}  users={total_users}  events={total_events}")

    db.commit()
    print(f"Done. {total_users} users, {total_events} events.")


def main() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
