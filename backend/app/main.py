from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .routers import auth, profile, benchmarks, plan, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        db.connect()
    except Exception as e:
        print(f"Failed to connect to database: {e}")
    yield
    # Shutdown
    db.disconnect()

app = FastAPI(lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sarah-careeriq.onrender.com",
    "https://www.sarah-careeriq.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(benchmarks.router, prefix="/api/v1")
app.include_router(plan.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

@app.get("/healthz")
async def health_check():
    try:
        if db.client:
            # Ping the database to verify connection
            await db.client.admin.command('ping')
            return {"status": "ok", "db": "connected"}
        else:
            return {"status": "ok", "db": "disconnected (client not initialized)"}
    except Exception as e:
        return {"status": "ok", "db": "disconnected", "error": str(e)}

@app.get("/")
async def root():
    return {"message": "Welcome to CareerIQ Backend"}