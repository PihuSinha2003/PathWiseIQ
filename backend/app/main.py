from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import analytics, models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PathwiseIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "pathwise-iq"}


@app.post("/events", status_code=201)
def ingest_event(payload: schemas.EventIn, db: Session = Depends(get_db)) -> dict:
    event = models.Event(
        name=payload.name,
        user_id=payload.user_id,
        anonymous_id=payload.anonymous_id,
        properties=payload.properties or {},
        occurred_at=payload.occurred_at or datetime.utcnow(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"id": event.id, "name": event.name}


@app.post("/users", response_model=schemas.UserOut, status_code=201)
def create_user(payload: schemas.UserIn, db: Session = Depends(get_db)):
    if db.query(models.User).filter_by(email=payload.email).first():
        raise HTTPException(status_code=409, detail="Email already exists")
    user = models.User(
        email=payload.email,
        device=payload.device,
        referrer=payload.referrer,
        experiment_variant=payload.experiment_variant,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/users/{user_id}/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(user_id: int, payload: schemas.TaskIn, db: Session = Depends(get_db)):
    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    task = models.Task(
        user_id=user_id,
        subject=payload.subject,
        title=payload.title,
        duration_min=payload.duration_min,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.post("/tasks/{task_id}/complete", response_model=schemas.TaskOut)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "done"
    task.completed_at = datetime.utcnow()
    db.add(
        models.Event(
            name="task_completed",
            user_id=task.user_id,
            properties={"task_id": task.id, "subject": task.subject},
        )
    )
    db.commit()
    db.refresh(task)
    return task


@app.get("/analytics/overview")
def overview(db: Session = Depends(get_db)) -> dict:
    return analytics.compute_overview(db)


@app.get("/analytics/funnel")
def funnel(
    device: str | None = None,
    variant: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    return analytics.compute_funnel(db, device=device, variant=variant)


@app.get("/analytics/cohorts")
def cohorts(db: Session = Depends(get_db)) -> list[dict]:
    return analytics.compute_cohorts(db)


@app.get("/analytics/experiment")
def experiment(db: Session = Depends(get_db)) -> dict:
    return analytics.compute_experiment(db)


@app.get("/analytics/insights")
def insights(db: Session = Depends(get_db)) -> list[dict]:
    return analytics.compute_insights(db)


@app.get("/analytics/recommendations")
def recommendations() -> list[dict]:
    return analytics.compute_recommendations()
