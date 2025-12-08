from sqlalchemy import Column, Integer, String, Boolean, Date, Float
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime

from .database import Base


class Grocery(Base):
  __tablename__ = "groceries"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String, nullable=False)
  category = Column(String, nullable=False, default="Other")
  done = Column(Boolean, nullable=False, default=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Reminder(Base):
  __tablename__ = "reminders"

  id = Column(Integer, primary_key=True, index=True)
  label = Column(String, nullable=False)
  last_done = Column(Date, nullable=False)
  interval_days = Column(Integer, nullable=False)
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Budget(Base):
  __tablename__ = "budget"

  id = Column(Integer, primary_key=True, index=True)
  week_spend = Column(Float, nullable=False, default=0.0)
  week_limit = Column(Float, nullable=False, default=0.0)


class Settings(Base):
  __tablename__ = "settings"

  id = Column(Integer, primary_key=True, index=True)
  weather_location = Column(String, nullable=True)
