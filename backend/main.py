from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
import auth
import tickets

app = FastAPI(title="Helpdesk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tickets.router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Helpdesk API is running"}