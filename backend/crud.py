from sqlalchemy.orm import Session
from datetime import date

from . import models, schemas


# ===== GROCERY =====
def get_groceries(db: Session):
  return db.query(models.Grocery).order_by(models.Grocery.id).all()


def create_grocery(db: Session, grocery: schemas.GroceryCreate):
  db_item = models.Grocery(
    name=grocery.name,
    category=grocery.category,
    done=grocery.done,
  )
  db.add(db_item)
  db.commit()
  db.refresh(db_item)
  return db_item


def update_grocery(db: Session, grocery_id: int, grocery: schemas.GroceryUpdate):
  db_item = db.query(models.Grocery).filter(models.Grocery.id == grocery_id).first()
  if not db_item:
    return None

  data = grocery.dict(exclude_unset=True)
  for key, value in data.items():
    setattr(db_item, key, value)

  db.commit()
  db.refresh(db_item)
  return db_item


def delete_grocery(db: Session, grocery_id: int):
  db_item = db.query(models.Grocery).filter(models.Grocery.id == grocery_id).first()
  if not db_item:
    return False
  db.delete(db_item)
  db.commit()
  return True


# ===== REMINDERS =====
def get_reminders(db: Session):
  return db.query(models.Reminder).order_by(models.Reminder.id).all()


def create_reminder(db: Session, reminder: schemas.ReminderCreate):
  db_item = models.Reminder(
    label=reminder.label,
    last_done=reminder.last_done,
    interval_days=reminder.interval_days,
  )
  db.add(db_item)
  db.commit()
  db.refresh(db_item)
  return db_item


def update_reminder(db: Session, reminder_id: int, reminder: schemas.ReminderUpdate):
  db_item = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
  if not db_item:
    return None

  data = reminder.dict(exclude_unset=True)
  for key, value in data.items():
    setattr(db_item, key, value)

  db.commit()
  db.refresh(db_item)
  return db_item


def delete_reminder(db: Session, reminder_id: int):
  db_item = db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()
  if not db_item:
    return False
  db.delete(db_item)
  db.commit()
  return True


# ===== BUDGET =====
def get_budget(db: Session):
  # single-row table
  db_item = db.query(models.Budget).filter(models.Budget.id == 1).first()
  if not db_item:
    db_item = models.Budget(id=1, week_spend=0.0, week_limit=0.0)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
  return db_item


def update_budget(db: Session, payload: schemas.BudgetUpdate):
  db_item = get_budget(db)
  data = payload.dict(exclude_unset=True)
  for key, value in data.items():
    setattr(db_item, key, value)
  db.commit()
  db.refresh(db_item)
  return db_item


# ===== SETTINGS =====
def get_settings(db: Session):
  db_item = db.query(models.Settings).filter(models.Settings.id == 1).first()
  if not db_item:
    db_item = models.Settings(id=1, weather_location=None)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
  return db_item


def update_settings(db: Session, payload: schemas.SettingsUpdate):
  db_item = get_settings(db)
  data = payload.dict(exclude_unset=True)
  for key, value in data.items():
    setattr(db_item, key, value)
  db.commit()
  db.refresh(db_item)
  return db_item
