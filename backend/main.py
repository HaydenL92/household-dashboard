from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import SessionLocal, engine
from . import models, schemas, crud

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Home Hub API")

# Allow your Next.js dev server
origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


# ===== GROCERY ROUTES =====
@app.get("/groceries", response_model=list[schemas.GroceryOut])
def list_groceries(db: Session = Depends(get_db)):
  return crud.get_groceries(db)


@app.post("/groceries", response_model=schemas.GroceryOut)
def add_grocery(item: schemas.GroceryCreate, db: Session = Depends(get_db)):
  return crud.create_grocery(db, item)


@app.patch("/groceries/{grocery_id}", response_model=schemas.GroceryOut)
def patch_grocery(grocery_id: int, item: schemas.GroceryUpdate, db: Session = Depends(get_db)):
  updated = crud.update_grocery(db, grocery_id, item)
  if not updated:
    raise HTTPException(status_code=404, detail="Grocery not found")
  return updated


@app.delete("/groceries/{grocery_id}")
def remove_grocery(grocery_id: int, db: Session = Depends(get_db)):
  ok = crud.delete_grocery(db, grocery_id)
  if not ok:
    raise HTTPException(status_code=404, detail="Grocery not found")
  return {"ok": True}


# ===== REMINDER ROUTES =====
@app.get("/reminders", response_model=list[schemas.ReminderOut])
def list_reminders(db: Session = Depends(get_db)):
  return crud.get_reminders(db)


@app.post("/reminders", response_model=schemas.ReminderOut)
def add_reminder(reminder: schemas.ReminderCreate, db: Session = Depends(get_db)):
  return crud.create_reminder(db, reminder)


@app.patch("/reminders/{reminder_id}", response_model=schemas.ReminderOut)
def patch_reminder(reminder_id: int, payload: schemas.ReminderUpdate, db: Session = Depends(get_db)):
  updated = crud.update_reminder(db, reminder_id, payload)
  if not updated:
    raise HTTPException(status_code=404, detail="Reminder not found")
  return updated


@app.delete("/reminders/{reminder_id}")
def remove_reminder(reminder_id: int, db: Session = Depends(get_db)):
  ok = crud.delete_reminder(db, reminder_id)
  if not ok:
    raise HTTPException(status_code=404, detail="Reminder not found")
  return {"ok": True}


# ===== BUDGET ROUTES =====
@app.get("/budget", response_model=schemas.BudgetOut)
def get_budget(db: Session = Depends(get_db)):
  return crud.get_budget(db)


@app.patch("/budget", response_model=schemas.BudgetOut)
def update_budget(payload: schemas.BudgetUpdate, db: Session = Depends(get_db)):
  return crud.update_budget(db, payload)


# ===== SETTINGS ROUTES =====
@app.get("/settings", response_model=schemas.SettingsOut)
def get_settings(db: Session = Depends(get_db)):
  return crud.get_settings(db)


@app.patch("/settings", response_model=schemas.SettingsOut)
def update_settings(payload: schemas.SettingsUpdate, db: Session = Depends(get_db)):
  return crud.update_settings(db, payload)
