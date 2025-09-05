from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Importar rotas
from routes.auth_routes import router as auth_router
from routes.transaction_routes import router as transaction_router
from routes.reports_routes import router as reports_router
from routes.settings_routes import router as settings_router

# Importar database
from database import connect_to_mongo, close_mongo_connection, create_default_user

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="AgentePro - Controle de Caixa API",
    description="API para sistema de controle de caixa para agências de turismo",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "AgentePro Controle de Caixa API - Running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cashcontrol-api"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(transaction_router)
api_router.include_router(reports_router)
api_router.include_router(settings_router)

# Include the main router in the app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    await create_default_user()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()
