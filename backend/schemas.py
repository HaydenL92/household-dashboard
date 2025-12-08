from datetime import date
from pydantic import BaseModel


# ===== GROCERY =====
class GroceryBase(BaseModel):
  name: str
  category: str = "Other"
  done: bool = False


class GroceryCreate(GroceryBase):
  pass


class GroceryUpdate(BaseModel):
  name: str | None = None
  category: str | None = None
  done: bool | None = None


class GroceryOut(GroceryBase):
  id: int

  class Config:
    from_attributes = True


# ===== REMINDER =====
class ReminderBase(BaseModel):
  label: str
  last_done: date
  interval_days: int


class ReminderCreate(ReminderBase):
  pass


class ReminderUpdate(BaseModel):
  label: str | None = None
  last_done: date | None = None
  interval_days: int | None = None


class ReminderOut(ReminderBase):
  id: int

  class Config:
    from_attributes = True


# ===== BUDGET =====
class BudgetBase(BaseModel):
  week_spend: float
  week_limit: float


class BudgetUpdate(BaseModel):
  week_spend: float | None = None
  week_limit: float | None = None


class BudgetOut(BudgetBase):
  id: int

  class Config:
    from_attributes = True


# ===== SETTINGS =====
class SettingsBase(BaseModel):
  weather_location: str | None = None


class SettingsUpdate(SettingsBase):
  pass


class SettingsOut(SettingsBase):
  id: int

  class Config:
    from_attributes = True
