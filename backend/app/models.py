from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    signup_at = Column(DateTime, default=datetime.utcnow, index=True)
    device = Column(String, nullable=False, default="desktop")
    referrer = Column(String, nullable=True)
    experiment_variant = Column(String, nullable=True, index=True)

    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    anonymous_id = Column(String, index=True, nullable=True)
    name = Column(String, index=True, nullable=False)
    occurred_at = Column(DateTime, default=datetime.utcnow, index=True)
    properties = Column(JSON, default=dict)

    user = relationship("User", back_populates="events")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    subject = Column(String, nullable=False)
    title = Column(String, nullable=False)
    duration_min = Column(Integer, nullable=False, default=30)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tasks")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    variants = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
