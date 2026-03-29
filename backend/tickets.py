from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Ticket
from auth import get_current_user, get_admin_user

router = APIRouter(prefix="/tickets", tags=["tickets"])


# --- Schemas ---
class TicketCreate(BaseModel):
    title: str
    description: str
    category: str = "general"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None


# --- Routes ---

# Any logged-in user can submit a ticket
@router.post("/", status_code=201)
def create_ticket(req: TicketCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ticket = Ticket(
        title=req.title,
        description=req.description,
        category=req.category,
        created_by=current_user.id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


# User sees only their own tickets
@router.get("/my")
def get_my_tickets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tickets = db.query(Ticket).filter(Ticket.created_by == current_user.id).all()
    return tickets


# Admin sees ALL tickets
@router.get("/all")
def get_all_tickets(db: Session = Depends(get_db), current_user=Depends(get_admin_user)):
    tickets = db.query(Ticket).all()
    return tickets


# Admin updates status and priority
@router.patch("/{ticket_id}")
def update_ticket(ticket_id: int, req: TicketUpdate, db: Session = Depends(get_db), current_user=Depends(get_admin_user)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if req.status:
        ticket.status = req.status
    if req.priority:
        ticket.priority = req.priority
    db.commit()
    db.refresh(ticket)
    return ticket


# Any user can view a single ticket (if it's theirs), admin can view any
@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not current_user.is_admin and ticket.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not your ticket")
    return ticket