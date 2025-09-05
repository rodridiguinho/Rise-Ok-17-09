from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from bson import ObjectId
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'agentepro_cashcontrol')]

# JWT Settings
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Create the main app
app = FastAPI(
    title="AgentePro - Controle de Caixa API",
    description="API para sistema de controle de caixa para agências de turismo",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TransactionCreate(BaseModel):
    type: str
    category: str
    description: str
    amount: float
    paymentMethod: str
    client: Optional[str] = None
    supplier: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow().timestamp() + 3600  # 1 hour
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "AgentePro Controle de Caixa API - Running"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cashcontrol-api"}

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    """Deletar transação (mockado)"""
    try:
        # Por enquanto apenas simula deleção
        return {"success": True, "message": "Transaction deleted successfully"}
    except Exception as e:
        logging.error(f"Delete transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting transaction")

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    """Login do usuário"""
    try:
        # Buscar usuário
        user = await db.users.find_one({"email": login_data.email})
        if not user or not verify_password(login_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Criar token
        token = create_jwt_token(str(user["_id"]), user["email"])
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"],
                "role": user.get("role", "user"),
                "companyName": user.get("companyName"),
                "phone": user.get("phone"),
                "address": user.get("address"),
                "settings": user.get("settings", {})
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login error")

@api_router.get("/transactions/summary")
async def get_transaction_summary():
    """Obter resumo das transações"""
    try:
        # Por enquanto retorna dados mockados
        return {
            "totalEntradas": 16030.00,
            "totalSaidas": 1850.00,
            "saldoAtual": 14180.00,
            "transacoesHoje": 3,
            "clientesAtendidos": 6,
            "ticketMedio": 2671.67
        }
    except Exception as e:
        logging.error(f"Summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting summary")

@api_router.get("/transactions")
async def get_transactions():
    """Obter transações"""
    try:
        # Por enquanto retorna dados mockados
        mock_transactions = [
            {
                "id": "1",
                "date": "2025-01-05",
                "time": "09:30",
                "type": "entrada",
                "category": "Pacote Turístico",
                "description": "Pacote Europa 7 dias - Cliente João Silva",
                "amount": 8500.00,
                "paymentMethod": "Cartão de Crédito",
                "client": "João Silva",
                "status": "Confirmado",
                "createdAt": datetime.utcnow()
            },
            {
                "id": "2",
                "date": "2025-01-05",
                "time": "10:15",
                "type": "saida",
                "category": "Fornecedor",
                "description": "Pagamento Hotel Ibis - Reserva #4523",
                "amount": 1200.00,
                "paymentMethod": "Transferência",
                "supplier": "Hotel Ibis",
                "status": "Pago",
                "createdAt": datetime.utcnow()
            }
        ]
        return mock_transactions
    except Exception as e:
        logging.error(f"Transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting transactions")

@api_router.post("/transactions")
async def create_transaction(transaction: TransactionCreate):
    """Criar nova transação"""
    try:
        # Por enquanto apenas simula criação
        new_transaction = {
            "id": str(ObjectId()),
            "date": date.today().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M"),
            "type": transaction.type,
            "category": transaction.category,
            "description": transaction.description,
            "amount": transaction.amount,
            "paymentMethod": transaction.paymentMethod,
            "client": transaction.client,
            "supplier": transaction.supplier,
            "status": "Confirmado",
            "createdAt": datetime.utcnow()
        }
        return new_transaction
    except Exception as e:
        logging.error(f"Create transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating transaction")

@api_router.get("/transactions/categories")
async def get_categories():
    """Obter categorias"""
    return {
        "categories": [
            "Pacote Turístico",
            "Passagem Aérea", 
            "Hotel/Hospedagem",
            "Seguro Viagem",
            "Transfer",
            "Excursão",
            "Aluguel de Carro",
            "Cruzeiro",
            "Ingresso/Atrações",
            "Fornecedor",
            "Despesa Operacional",
            "Comissão"
        ]
    }

@api_router.get("/transactions/payment-methods")
async def get_payment_methods():
    """Obter métodos de pagamento"""
    return {
        "paymentMethods": [
            "Dinheiro",
            "PIX",
            "Cartão de Crédito",
            "Cartão de Débito",
            "Transferência",
            "Cartão Corporativo"
        ]
    }

@api_router.post("/reports/export/pdf")
async def export_pdf():
    """Exportar PDF (mockado)"""
    return {"success": True, "message": "PDF export initiated"}

@api_router.post("/reports/export/excel") 
async def export_excel():
    """Exportar Excel (mockado)"""
    return {"success": True, "message": "Excel export initiated"}

# Include the main router in the app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup event
@app.on_event("startup")
async def startup_db_client():
    """Conectar ao MongoDB e criar usuário padrão"""
    try:
        await client.admin.command('ping')
        logger.info("✅ Connected to MongoDB")
        
        # Criar usuário padrão se não existir
        existing_user = await db.users.find_one({"email": "rorigo@risetravel.com.br"})
        if not existing_user:
            default_user = {
                "email": "rorigo@risetravel.com.br",
                "password": hash_password("Emily2030*"),
                "name": "Rodrigo Silva",
                "role": "Gerente",
                "companyName": "AgentePro Turismo",
                "phone": "+55 11 99999-9999",
                "address": "Rua das Flores, 123 - São Paulo, SP",
                "settings": {
                    "currency": "BRL",
                    "timezone": "America/Sao_Paulo",
                    "notifications": {
                        "emailNotifications": True,
                        "pushNotifications": False,
                        "dailyReport": True,
                        "transactionAlerts": True,
                        "lowCashAlert": True
                    },
                    "preferences": {
                        "theme": "light",
                        "autoExport": False,
                        "backupFrequency": "weekly",
                        "decimalPlaces": 2
                    }
                },
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            await db.users.insert_one(default_user)
            logger.info("✅ Default user created")
    except Exception as e:
        logger.error(f"❌ Database connection error: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("✅ MongoDB connection closed")