from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class EventIn(BaseModel):
    name: str
    user_id: int | None = None
    anonymous_id: str | None = None
    properties: dict[str, Any] = Field(default_factory=dict)
    occurred_at: datetime | None = None


class UserIn(BaseModel):
    email: EmailStr
    device: str = "desktop"
    referrer: str | None = None
    experiment_variant: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    signup_at: datetime
    device: str
    experiment_variant: str | None

    class Config:
        from_attributes = True


class TaskIn(BaseModel):
    subject: str
    title: str
    duration_min: int = 30


class TaskOut(BaseModel):
    id: int
    user_id: int
    subject: str
    title: str
    duration_min: int
    status: str
    completed_at: datetime | None

    class Config:
        from_attributes = True


class FunnelStep(BaseModel):
    stage: str
    users: int
    step_cvr: float
    cumulative_cvr: float


class CohortRow(BaseModel):
    cohort_week: str
    cohort_size: int
    d0: float
    d1: float
    d2: float
    d7: float
    d14: float
    d30: float


class ExperimentSummary(BaseModel):
    experiment: str
    variant_a: str
    variant_b: str
    users_a: int
    users_b: int
    cvr_a: float
    cvr_b: float
    lift_pp: float
    p_value: float
    ci_low_pp: float
    ci_high_pp: float
    winner: str
