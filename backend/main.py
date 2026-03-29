from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
import auth
import tickets

app = FastAPI(title="Helpdesk API")

# Allow React (running on port 5173) to talk to FastAPI (running on port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(tickets.router)

# Create tables on startup
@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Helpdesk API is running"}