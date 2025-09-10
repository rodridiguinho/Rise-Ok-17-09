from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from pathlib import Path
from dotenv import load_dotenv
import os
import logging
from datetime import datetime, date
from bson import ObjectId
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise RuntimeError("MONGO_URL environment variable is not set")

client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client.cash_control
        await client.admin.command('ping')
        logger.info("✅ Connected to MongoDB successfully")
        yield
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise
    finally:
        # Shutdown
        if client:
            client.close()
            logger.info("✅ MongoDB connection closed")

# Create FastAPI app
app = FastAPI(
    title="Cash Control API",
    description="API for Rise Travel Cash Control System",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    role: str = "Operador"
    status: str = "Ativo"

class UserLogin(BaseModel):
    email: str
    password: str

class TransactionCreate(BaseModel):
    type: str
    category: str
    description: str
    amount: float
    paymentMethod: str
    client: Optional[str] = None
    supplier: Optional[str] = None
    seller: Optional[str] = None
    saleValue: Optional[float] = None
    supplierValue: Optional[float] = None
    supplierPaymentDate: Optional[str] = None
    supplierPaymentStatus: Optional[str] = "Pendente"
    commissionValue: Optional[float] = None
    commissionPaymentDate: Optional[str] = None
    commissionPaymentStatus: Optional[str] = "Pendente"
    commissionPercentage: Optional[float] = None
    transactionDate: Optional[str] = None
    customCategory: Optional[str] = None
    # Travel-specific fields
    clientNumber: Optional[str] = None
    reservationLocator: Optional[str] = None
    departureDate: Optional[str] = None
    returnDate: Optional[str] = None
    departureTime: Optional[str] = None
    arrivalTime: Optional[str] = None
    hasStops: Optional[bool] = False
    originAirport: Optional[str] = None
    destinationAirport: Optional[str] = None
    tripType: Optional[str] = "Lazer"  # Lazer/Negócios
    products: Optional[list] = []  # Multiple products
    # Enhanced fields for client reservation and supplier miles
    clientReservationCode: Optional[str] = None
    departureCity: Optional[str] = None
    arrivalCity: Optional[str] = None
    productType: Optional[str] = "Passagem"  # Passagem/Hotel/Pacote/Outros
    supplierUsedMiles: Optional[bool] = False  # If supplier used miles
    supplierMilesQuantity: Optional[int] = None
    supplierMilesValue: Optional[float] = None
    supplierMilesProgram: Optional[str] = None
    airportTaxes: Optional[float] = None
    # Escalas
    outboundStops: Optional[str] = None
    returnStops: Optional[str] = None

# Create API router
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow().timestamp() + 2592000  # 30 days
    }
    return jwt.encode(payload, "your-secret-key", algorithm="HS256")

# Authentication routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Registrar novo usuário"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já existe")
        
        # Hash password and create user
        hashed_password = hash_password(user_data.password)
        
        new_user = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "phone": user_data.phone,
            "role": user_data.role,
            "status": user_data.status,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.users.insert_one(new_user)
        
        # Create JWT token
        token = create_jwt_token(str(result.inserted_id), user_data.email)
        
        return {
            "message": "User created successfully",
            "access_token": token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration error")

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    """Login do usuário"""
    try:
        # Find user
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")
        
        # Verify password
        if not verify_password(login_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Email ou senha inválidos")
        
        # Create JWT token
        token = create_jwt_token(str(user["_id"]), user["email"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login error")

# Users API endpoints
@api_router.get("/users")
async def get_users():
    """Obter lista de usuários"""
    try:
        users = await db.users.find({}).to_list(100)
        for user in users:
            user["id"] = str(user["_id"])
            user["_id"] = str(user["_id"])
            # Remove password from response
            user.pop("password", None)
            # Convert datetime objects to strings
            if "createdAt" in user:
                user["createdAt"] = user["createdAt"].isoformat()
            if "updatedAt" in user:
                user["updatedAt"] = user["updatedAt"].isoformat()
        return users
    except Exception as e:
        logging.error(f"Error getting users: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting users")

@api_router.post("/users")
async def create_user(user_data: dict):
    """Criar novo usuário"""
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já existe")
        
        # Hash password and create user
        hashed_password = hash_password(user_data["password"])
        
        new_user = {
            "name": user_data["name"],
            "email": user_data["email"],
            "password": hashed_password,
            "phone": user_data.get("phone", ""),
            "role": user_data.get("role", "Operador"),
            "status": user_data.get("status", "Ativo"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = await db.users.insert_one(new_user)
        
        # Get created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        if created_user:
            created_user["id"] = str(created_user["_id"])
            created_user["_id"] = str(created_user["_id"])
            created_user.pop("password", None)
            # Convert datetime objects to strings
            if "createdAt" in created_user:
                created_user["createdAt"] = created_user["createdAt"].isoformat()
            if "updatedAt" in created_user:
                created_user["updatedAt"] = created_user["updatedAt"].isoformat()
        
        return created_user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating user")

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: dict):
    """Atualizar usuário"""
    try:
        # Prepare update data
        update_data = {
            "name": user_data.get("name"),
            "email": user_data.get("email"),
            "phone": user_data.get("phone", ""),
            "role": user_data.get("role", "Operador"),
            "status": user_data.get("status", "Ativo"),
            "updatedAt": datetime.utcnow()
        }
        
        # If password is being updated, hash it
        if user_data.get("password"):
            update_data["password"] = hash_password(user_data["password"])
        
        # Check if email already exists for another user
        if update_data.get("email"):
            existing_user = await db.users.find_one({
                "email": update_data["email"],
                "_id": {"$ne": ObjectId(user_id)}
            })
            if existing_user:
                raise HTTPException(status_code=400, detail="Email já existe")
        
        # Update user
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
        if updated_user:
            updated_user["id"] = str(updated_user["_id"])
            updated_user["_id"] = str(updated_user["_id"])
            updated_user.pop("password", None)
            # Convert datetime objects to strings
            if "createdAt" in updated_user:
                updated_user["createdAt"] = updated_user["createdAt"].isoformat()
            if "updatedAt" in updated_user:
                updated_user["updatedAt"] = updated_user["updatedAt"].isoformat()
        
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user")

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Deletar usuário"""
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")

# Clients API endpoints
@api_router.get("/clients")
async def get_clients():
    """Obter lista de clientes"""
    try:
        clients = await db.clients.find({}).to_list(100)
        for client in clients:
            client["id"] = str(client["_id"])
            client["_id"] = str(client["_id"])
            # Convert datetime objects to strings
            if "createdAt" in client:
                client["createdAt"] = client["createdAt"].isoformat()
            if "updatedAt" in client:
                client["updatedAt"] = client["updatedAt"].isoformat()
        return clients
    except Exception as e:
        logging.error(f"Error getting clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting clients")

@api_router.post("/clients")
async def create_client(client_data: dict):
    """Criar novo cliente"""
    try:
        # Check if email already exists
        if client_data.get("email"):
            existing_client = await db.clients.find_one({"email": client_data["email"]})
            if existing_client:
                raise HTTPException(status_code=400, detail="Email já existe")
        
        # Generate unique client number
        client_count = len(await db.clients.find().to_list(None))
        client_number = client_count + 1
        
        # Prepare client data
        new_client = {
            "name": client_data["name"],
            "email": client_data.get("email", ""),
            "phone": client_data.get("phone", ""),
            "document": client_data.get("document", ""),
            "address": client_data.get("address", ""),
            "city": client_data.get("city", ""),
            "state": client_data.get("state", ""),
            "zipCode": client_data.get("zipCode", ""),
            "clientNumber": f"CLI{client_number:04d}",
            "status": client_data.get("status", "Ativo"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert client
        result = await db.clients.insert_one(new_client)
        
        # Get created client
        created_client = await db.clients.find_one({"_id": result.inserted_id})
        if created_client:
            created_client["id"] = str(created_client["_id"])
            created_client["_id"] = str(created_client["_id"])
            # Convert datetime objects to strings
            if "createdAt" in created_client:
                created_client["createdAt"] = created_client["createdAt"].isoformat()
            if "updatedAt" in created_client:
                created_client["updatedAt"] = created_client["updatedAt"].isoformat()
        
        return created_client
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating client: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating client")

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, client_data: dict):
    """Atualizar cliente"""
    try:
        # Prepare update data
        update_data = {
            "name": client_data.get("name"),
            "email": client_data.get("email", ""),
            "phone": client_data.get("phone", ""),
            "document": client_data.get("document", ""),
            "address": client_data.get("address", ""),
            "city": client_data.get("city", ""),
            "state": client_data.get("state", ""),
            "zipCode": client_data.get("zipCode", ""),
            "status": client_data.get("status", "Ativo"),
            "updatedAt": datetime.utcnow()
        }
        
        # Check if email already exists for another client
        if update_data.get("email"):
            existing_client = await db.clients.find_one({
                "email": update_data["email"],
                "_id": {"$ne": ObjectId(client_id)}
            })
            if existing_client:
                raise HTTPException(status_code=400, detail="Email já existe")
        
        # Update client
        result = await db.clients.update_one(
            {"_id": ObjectId(client_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Get updated client
        updated_client = await db.clients.find_one({"_id": ObjectId(client_id)})
        if updated_client:
            updated_client["id"] = str(updated_client["_id"])
            updated_client["_id"] = str(updated_client["_id"])
            # Convert datetime objects to strings
            if "createdAt" in updated_client:
                updated_client["createdAt"] = updated_client["createdAt"].isoformat()
            if "updatedAt" in updated_client:
                updated_client["updatedAt"] = updated_client["updatedAt"].isoformat()
        
        return updated_client
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating client: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating client")

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str):
    """Deletar cliente"""
    try:
        result = await db.clients.delete_one({"_id": ObjectId(client_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return {"success": True, "message": "Client deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting client: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting client")

# Suppliers API endpoints
@api_router.get("/suppliers")
async def get_suppliers():
    """Obter lista de fornecedores"""
    try:
        suppliers = await db.suppliers.find({}).to_list(100)
        for supplier in suppliers:
            supplier["id"] = str(supplier["_id"])
            supplier["_id"] = str(supplier["_id"])
            # Convert datetime objects to strings
            if "createdAt" in supplier:
                supplier["createdAt"] = supplier["createdAt"].isoformat()
            if "updatedAt" in supplier:
                supplier["updatedAt"] = supplier["updatedAt"].isoformat()
        return suppliers
    except Exception as e:
        logging.error(f"Error getting suppliers: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting suppliers")

@api_router.post("/suppliers")
async def create_supplier(supplier_data: dict):
    """Criar novo fornecedor"""
    try:
        # Check if email already exists
        if supplier_data.get("email"):
            existing_supplier = await db.suppliers.find_one({"email": supplier_data["email"]})
            if existing_supplier:
                raise HTTPException(status_code=400, detail="Email já existe")
        
        # Generate unique supplier number
        supplier_count = len(await db.suppliers.find().to_list(None))
        supplier_number = supplier_count + 1
        
        # Prepare supplier data
        new_supplier = {
            "name": supplier_data["name"],
            "email": supplier_data.get("email", ""),
            "phone": supplier_data.get("phone", ""),
            "document": supplier_data.get("document", ""),
            "address": supplier_data.get("address", ""),
            "city": supplier_data.get("city", ""),
            "state": supplier_data.get("state", ""),
            "zipCode": supplier_data.get("zipCode", ""),
            "category": supplier_data.get("category", ""),
            "supplierType": supplier_data.get("supplierType", ""),
            # Purchase type fields
            "purchaseType": supplier_data.get("purchaseType", "Dinheiro"),  # Milhas/Dinheiro/Voucher
            "milesQuantity": supplier_data.get("milesQuantity", 0),
            "milesValuePer1000": supplier_data.get("milesValuePer1000", 0),
            "milesProgram": supplier_data.get("milesProgram", ""),
            "milesAccount": supplier_data.get("milesAccount", ""),
            "discountApplied": supplier_data.get("discountApplied", 0),
            "discountType": supplier_data.get("discountType", "reais"),  # reais/percentual
            "supplierNumber": f"FOR{supplier_number:04d}",
            "status": supplier_data.get("status", "Ativo"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert supplier
        result = await db.suppliers.insert_one(new_supplier)
        
        # Get created supplier
        created_supplier = await db.suppliers.find_one({"_id": result.inserted_id})
        if created_supplier:
            created_supplier["id"] = str(created_supplier["_id"])
            created_supplier["_id"] = str(created_supplier["_id"])
            # Convert datetime objects to strings
            if "createdAt" in created_supplier:
                created_supplier["createdAt"] = created_supplier["createdAt"].isoformat()
            if "updatedAt" in created_supplier:
                created_supplier["updatedAt"] = created_supplier["updatedAt"].isoformat()
        
        return created_supplier
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating supplier: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating supplier")

@api_router.put("/suppliers/{supplier_id}")
async def update_supplier(supplier_id: str, supplier_data: dict):
    """Atualizar fornecedor"""
    try:
        # Prepare update data
        update_data = {
            "name": supplier_data.get("name"),
            "email": supplier_data.get("email", ""),
            "phone": supplier_data.get("phone", ""),
            "document": supplier_data.get("document", ""),
            "address": supplier_data.get("address", ""),
            "city": supplier_data.get("city", ""),
            "state": supplier_data.get("state", ""),
            "zipCode": supplier_data.get("zipCode", ""),
            "category": supplier_data.get("category", ""),
            "supplierType": supplier_data.get("supplierType", ""),
            # Travel-specific purchase fields
            "purchaseType": supplier_data.get("purchaseType", "Dinheiro"),
            "milesQuantity": supplier_data.get("milesQuantity", 0),
            "milesValuePer1000": supplier_data.get("milesValuePer1000", 0),
            "milesProgram": supplier_data.get("milesProgram", ""),
            "milesAccount": supplier_data.get("milesAccount", ""),
            "discountApplied": supplier_data.get("discountApplied", 0),
            "discountType": supplier_data.get("discountType", "reais"),
            "status": supplier_data.get("status", "Ativo"),
            "updatedAt": datetime.utcnow()
        }
        
        # Check if email already exists for another supplier
        if update_data.get("email"):
            existing_supplier = await db.suppliers.find_one({
                "email": update_data["email"],
                "_id": {"$ne": ObjectId(supplier_id)}
            })
            if existing_supplier:
                raise HTTPException(status_code=400, detail="Email já existe")
        
        # Update supplier
        result = await db.suppliers.update_one(
            {"_id": ObjectId(supplier_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        # Get updated supplier
        updated_supplier = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
        if updated_supplier:
            updated_supplier["id"] = str(updated_supplier["_id"])
            updated_supplier["_id"] = str(updated_supplier["_id"])
            # Convert datetime objects to strings
            if "createdAt" in updated_supplier:
                updated_supplier["createdAt"] = updated_supplier["createdAt"].isoformat()
            if "updatedAt" in updated_supplier:
                updated_supplier["updatedAt"] = updated_supplier["updatedAt"].isoformat()
        
        return updated_supplier
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating supplier: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating supplier")

@api_router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: str):
    """Deletar fornecedor"""
    try:
        result = await db.suppliers.delete_one({"_id": ObjectId(supplier_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Supplier not found")
        
        return {"success": True, "message": "Supplier deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting supplier: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting supplier")

# Transactions API endpoints
@api_router.get("/transactions")
async def get_transactions():
    """Obter transações"""
    try:
        transactions = await db.transactions.find({}).to_list(None)
        for transaction in transactions:
            transaction["id"] = str(transaction["_id"])
            transaction["_id"] = str(transaction["_id"])
            # Convert datetime objects to strings
            if "createdAt" in transaction:
                transaction["createdAt"] = transaction["createdAt"].isoformat()
            if "updatedAt" in transaction:
                transaction["updatedAt"] = transaction["updatedAt"].isoformat()
        return transactions
    except Exception as e:
        logging.error(f"Transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting transactions")

@api_router.post("/transactions")
async def create_transaction(transaction: TransactionCreate):
    """Criar nova transação"""
    try:
        # Use the transaction date provided by user, or default to today
        transaction_date = transaction.transactionDate if transaction.transactionDate else date.today().strftime("%Y-%m-%d")
        
        # Calculate commission percentage if values provided
        commission_percentage = None
        if transaction.saleValue and transaction.commissionValue:
            commission_percentage = (transaction.commissionValue / transaction.saleValue) * 100
        
        # Use custom category if provided, otherwise use predefined category
        final_category = transaction.customCategory if transaction.customCategory else transaction.category
        
        # Prepare transaction data
        new_transaction = {
            "date": transaction_date,  # Use the actual transaction date, not entry date
            "time": datetime.now().strftime("%H:%M"),  # Keep current time for record keeping
            "type": transaction.type,
            "category": final_category,
            "description": transaction.description,
            "amount": transaction.amount,
            "paymentMethod": transaction.paymentMethod,
            "client": transaction.client,
            "supplier": transaction.supplier,
            "seller": transaction.seller,
            "saleValue": transaction.saleValue,
            "supplierValue": transaction.supplierValue,
            "supplierPaymentDate": transaction.supplierPaymentDate,
            "supplierPaymentStatus": transaction.supplierPaymentStatus or "Pendente",
            "commissionValue": transaction.commissionValue,
            "commissionPaymentDate": transaction.commissionPaymentDate,
            "commissionPaymentStatus": transaction.commissionPaymentStatus or "Pendente",
            "commissionPercentage": commission_percentage,
            "customCategory": transaction.customCategory,
            # Travel-specific fields
            "clientNumber": transaction.clientNumber,
            "reservationLocator": transaction.reservationLocator,
            "departureDate": transaction.departureDate,
            "returnDate": transaction.returnDate,
            "departureTime": transaction.departureTime,
            "arrivalTime": transaction.arrivalTime,
            "hasStops": transaction.hasStops,
            "originAirport": transaction.originAirport,
            "destinationAirport": transaction.destinationAirport,
            "tripType": transaction.tripType or "Lazer",
            "products": transaction.products or [],
            # Enhanced fields for client reservation and supplier miles
            "clientReservationCode": transaction.clientReservationCode,
            "departureCity": transaction.departureCity,
            "arrivalCity": transaction.arrivalCity,
            "productType": transaction.productType or "Passagem",
            "supplierUsedMiles": transaction.supplierUsedMiles or False,
            "supplierMilesQuantity": transaction.supplierMilesQuantity,
            "supplierMilesValue": transaction.supplierMilesValue,
            "supplierMilesProgram": transaction.supplierMilesProgram,
            "airportTaxes": transaction.airportTaxes,
            # Escalas
            "outboundStops": transaction.outboundStops,
            "returnStops": transaction.returnStops,
            "status": "Confirmado",
            "transactionDate": transaction_date,  # Store the actual transaction date
            "createdAt": datetime.utcnow(),  # Keep record of when this was entered into system
            "updatedAt": datetime.utcnow(),
            "entryDate": date.today().strftime("%Y-%m-%d")  # When this was entered into system
        }
        
        # Insert transaction into database
        result = await db.transactions.insert_one(new_transaction)
        
        # Get created transaction
        created_transaction = await db.transactions.find_one({"_id": result.inserted_id})
        if created_transaction:
            created_transaction["id"] = str(created_transaction["_id"])
            created_transaction["_id"] = str(created_transaction["_id"])
            # Convert datetime objects to strings
            if "createdAt" in created_transaction:
                created_transaction["createdAt"] = created_transaction["createdAt"].isoformat()
            if "updatedAt" in created_transaction:
                created_transaction["updatedAt"] = created_transaction["updatedAt"].isoformat()
        
        return {"message": "Transação criada com sucesso", **created_transaction}
    except Exception as e:
        logging.error(f"Create transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar transação: {str(e)}")

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
        ],
        "expenseCategories": [
            "Salários",
            "Aluguel",
            "Conta de Água",
            "Conta de Luz",
            "Internet",
            "Telefone",
            "Condomínio",
            "Marketing",
            "Material de Escritório",
            "Combustível",
            "Manutenção",
            "Impostos",
            "Outras Despesas",
            "Personalizada"
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

@api_router.get("/transactions/summary")
async def get_transaction_summary():
    """Obter resumo das transações"""
    try:
        # Get transactions from database
        transactions = await db.transactions.find({}).to_list(None)
        
        total_entradas = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'entrada')
        total_saidas = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'saida')
        saldo_atual = total_entradas - total_saidas
        
        # Count today's transactions
        today = date.today().strftime("%Y-%m-%d")
        transacoes_hoje = len([t for t in transactions if t.get('date') == today or t.get('transactionDate') == today])
        
        # Count unique clients
        clientes_atendidos = len(set(t.get('client', '') for t in transactions if t.get('client')))
        
        # Calculate average ticket
        entrada_transactions = [t for t in transactions if t.get('type') == 'entrada']
        ticket_medio = total_entradas / len(entrada_transactions) if entrada_transactions else 0
        
        return {
            "totalEntradas": total_entradas,
            "totalSaidas": total_saidas,
            "saldoAtual": saldo_atual,
            "transacoesHoje": transacoes_hoje,
            "clientesAtendidos": clientes_atendidos,
            "ticketMedio": ticket_medio
        }
    except Exception as e:
        logging.error(f"Summary error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting summary")

@api_router.get("/reports/sales-analysis")
async def get_sales_analysis(start_date: str = None, end_date: str = None):
    """Obter análise de vendas por período"""
    try:
        # Build date filter
        date_filter = {}
        if start_date and end_date:
            date_filter = {
                "$or": [
                    {"date": {"$gte": start_date, "$lte": end_date}},
                    {"transactionDate": {"$gte": start_date, "$lte": end_date}}
                ]
            }
        
        # Get transactions in period
        transactions = await db.transactions.find(date_filter).to_list(None)
        
        # Convert ObjectIds to strings for JSON serialization
        for transaction in transactions:
            transaction["id"] = str(transaction["_id"])
            transaction["_id"] = str(transaction["_id"])
            # Convert datetime objects to strings
            if "createdAt" in transaction:
                transaction["createdAt"] = transaction["createdAt"].isoformat()
            if "updatedAt" in transaction:
                transaction["updatedAt"] = transaction["updatedAt"].isoformat()
        
        # Filter sales transactions (entradas)
        sales_transactions = [t for t in transactions if t.get('type') == 'entrada']
        
        # Calculate sales metrics (handle None values)
        total_sales = sum((t.get('saleValue') or 0) if t.get('saleValue') is not None else (t.get('amount') or 0) for t in sales_transactions)
        total_supplier_costs = sum((t.get('supplierValue') or 0) for t in sales_transactions)
        total_commissions = sum((t.get('commissionValue') or 0) for t in sales_transactions)
        net_profit = total_sales - total_supplier_costs - total_commissions
        
        # Count transactions
        sales_count = len(sales_transactions)
        average_sale = total_sales / sales_count if sales_count > 0 else 0
        
        return {
            "period": {"start_date": start_date, "end_date": end_date},
            "sales": {
                "total_sales": total_sales,
                "total_supplier_costs": total_supplier_costs,
                "total_commissions": total_commissions,
                "net_profit": net_profit,
                "sales_count": sales_count,
                "average_sale": average_sale
            },
            "transactions": sales_transactions
        }
    except Exception as e:
        logging.error(f"Sales analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting sales analysis")

@api_router.get("/reports/complete-analysis")
async def get_complete_analysis(start_date: str = None, end_date: str = None):
    """Obter análise completa por período"""
    try:
        # Build date filter
        date_filter = {}
        if start_date and end_date:
            date_filter = {
                "$or": [
                    {"date": {"$gte": start_date, "$lte": end_date}},
                    {"transactionDate": {"$gte": start_date, "$lte": end_date}}
                ]
            }
        
        # Get all transactions in period
        transactions = await db.transactions.find(date_filter).to_list(None)
        
        # Convert ObjectIds to strings for JSON serialization
        for transaction in transactions:
            transaction["id"] = str(transaction["_id"])
            transaction["_id"] = str(transaction["_id"])
            # Convert datetime objects to strings
            if "createdAt" in transaction:
                transaction["createdAt"] = transaction["createdAt"].isoformat()
            if "updatedAt" in transaction:
                transaction["updatedAt"] = transaction["updatedAt"].isoformat()
        
        # Separate by type
        entradas = [t for t in transactions if t.get('type') == 'entrada']
        saidas = [t for t in transactions if t.get('type') == 'saida']
        
        # Calculate totals
        total_entradas = sum(t.get('amount', 0) for t in entradas)
        total_saidas = sum(t.get('amount', 0) for t in saidas)
        balance = total_entradas - total_saidas
        
        return {
            "period": {"start_date": start_date, "end_date": end_date},
            "summary": {
                "total_entradas": total_entradas,
                "total_saidas": total_saidas,
                "balance": balance,
                "entradas_count": len(entradas),
                "saidas_count": len(saidas)
            },
            "entradas": entradas,
            "saidas": saidas,
            "all_transactions": transactions
        }
    except Exception as e:
        logging.error(f"Complete analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error getting complete analysis")

class CompanySettings(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    cnpj: Optional[str] = None
    website: Optional[str] = None

# Company settings endpoints
@app.get("/api/company/settings")
async def get_company_settings():
    try:
        # Try to get existing settings
        settings = await db.company_settings.find_one({})
        if settings:
            # Remove MongoDB _id field
            settings.pop('_id', None)
            return settings
        else:
            # Return default settings
            default_settings = {
                "name": "Rise Travel",
                "email": "rodrigo@risetravel.com",
                "phone": "(11) 99999-9999",
                "address": "Rua das Viagens, 123",
                "city": "São Paulo",
                "state": "SP",
                "zipCode": "01234-567",
                "cnpj": "12.345.678/0001-90",
                "website": "www.risetravel.com.br"
            }
            return default_settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar configurações da empresa: {str(e)}")

@api_router.put("/transactions/{transaction_id}")
async def update_transaction(transaction_id: str, transaction: TransactionCreate):
    try:
        # Find the transaction to update
        existing_transaction = await db.transactions.find_one({"id": transaction_id})
        if not existing_transaction:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        # Parse transaction date
        transaction_date = transaction.transactionDate
        if transaction_date:
            try:
                parsed_date = datetime.strptime(transaction_date, "%Y-%m-%d")
                transaction_date = parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                transaction_date = date.today().strftime("%Y-%m-%d")
        else:
            transaction_date = date.today().strftime("%Y-%m-%d")
        
        # Calculate commission percentage
        commission_percentage = 0.0
        if transaction.saleValue and transaction.commissionValue:
            commission_percentage = (transaction.commissionValue / transaction.saleValue) * 100
        
        # Determine final category
        final_category = transaction.customCategory if transaction.customCategory else transaction.category
        
        # Prepare updated transaction data
        updated_transaction_data = {
            "date": transaction_date,
            "time": datetime.now().strftime("%H:%M"),
            "type": transaction.type,
            "category": final_category,
            "description": transaction.description,
            "amount": transaction.amount,
            "paymentMethod": transaction.paymentMethod,
            "client": transaction.client,
            "supplier": transaction.supplier,
            "seller": transaction.seller,
            "saleValue": transaction.saleValue,
            "supplierValue": transaction.supplierValue,
            "supplierPaymentDate": transaction.supplierPaymentDate,
            "supplierPaymentStatus": transaction.supplierPaymentStatus or "Pendente",
            "commissionValue": transaction.commissionValue,
            "commissionPaymentDate": transaction.commissionPaymentDate,
            "commissionPaymentStatus": transaction.commissionPaymentStatus or "Pendente",
            "commissionPercentage": commission_percentage,
            "customCategory": transaction.customCategory,
            # Travel-specific fields
            "clientNumber": transaction.clientNumber,
            "reservationLocator": transaction.reservationLocator,
            "departureDate": transaction.departureDate,
            "returnDate": transaction.returnDate,
            "departureTime": transaction.departureTime,
            "arrivalTime": transaction.arrivalTime,
            "hasStops": transaction.hasStops,
            "originAirport": transaction.originAirport,
            "destinationAirport": transaction.destinationAirport,
            "tripType": transaction.tripType or "Lazer",
            "products": transaction.products or [],
            # Enhanced fields for client reservation and supplier miles
            "clientReservationCode": transaction.clientReservationCode,
            "departureCity": transaction.departureCity,
            "arrivalCity": transaction.arrivalCity,
            "productType": transaction.productType or "Passagem",
            "supplierUsedMiles": transaction.supplierUsedMiles or False,
            "supplierMilesQuantity": transaction.supplierMilesQuantity,
            "supplierMilesValue": transaction.supplierMilesValue,
            "supplierMilesProgram": transaction.supplierMilesProgram,
            "airportTaxes": transaction.airportTaxes,
            # Escalas
            "outboundStops": transaction.outboundStops,
            "returnStops": transaction.returnStops,
            "status": "Confirmado",
            "transactionDate": transaction_date,
            "updatedAt": datetime.utcnow(),
            "entryDate": existing_transaction.get("entryDate", date.today().strftime("%Y-%m-%d"))
        }
        
        # Update the transaction
        result = await db.transactions.update_one(
            {"id": transaction_id},
            {"$set": updated_transaction_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Transação não encontrada ou não foi modificada")
        
        # Return updated transaction
        updated_transaction = await db.transactions.find_one({"id": transaction_id})
        updated_transaction.pop('_id', None)
        
        return {"message": "Transação atualizada com sucesso", **updated_transaction}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar transação: {str(e)}")

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str):
    try:
        # Check if transaction exists
        existing_transaction = await db.transactions.find_one({"id": transaction_id})
        if not existing_transaction:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        # Delete the transaction
        result = await db.transactions.delete_one({"id": transaction_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        return {"message": "Transação excluída com sucesso", "id": transaction_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Delete transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao excluir transação: {str(e)}")

@app.post("/api/company/settings")
async def save_company_settings(settings: CompanySettings):
    try:
        settings_dict = settings.dict()
        settings_dict["updatedAt"] = datetime.utcnow()
        
        # Upsert: update if exists, create if not
        result = await db.company_settings.replace_one(
            {},  # Empty filter to match any document (assuming single company)
            settings_dict,
            upsert=True
        )
        
        return {
            "message": "Configurações da empresa salvas com sucesso",
            "settings": settings_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar configurações da empresa: {str(e)}")

# Clear test data endpoint
@app.post("/api/admin/clear-test-data")
async def clear_test_data():
    try:
        # Count documents before deletion for reporting
        transactions_count = await db.transactions.count_documents({})
        clients_count = await db.clients.count_documents({})
        suppliers_count = await db.suppliers.count_documents({})
        users_count = await db.users.count_documents({"role": {"$ne": "Admin"}})  # Keep admin users
        
        # Clear collections (keeping admin users)
        await db.transactions.delete_many({})
        await db.clients.delete_many({})
        await db.suppliers.delete_many({})
        
        # Delete non-admin users (keep at least one admin)
        admin_users = await db.users.find({"role": "Admin"}).to_list(length=None)
        if len(admin_users) > 0:
            # Keep the first admin user, delete others if they are test users
            await db.users.delete_many({
                "role": {"$ne": "Admin"},
                "email": {"$ne": "rodrigo@risetravel.com"}  # Keep the main admin
            })
        
        # Reset company settings to defaults (optional - you might want to keep these)
        default_company_settings = {
            "name": "Rise Travel",
            "email": "rodrigo@risetravel.com",
            "phone": "(11) 99999-9999",
            "address": "Rua das Viagens, 123",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "01234-567",
            "cnpj": "12.345.678/0001-90",
            "website": "www.risetravel.com.br",
            "updatedAt": datetime.utcnow()
        }
        
        await db.company_settings.replace_one(
            {},
            default_company_settings,
            upsert=True
        )
        
        return {
            "message": "Dados de teste limpos com sucesso",
            "cleared": {
                "transactions": transactions_count,
                "clients": clients_count,
                "suppliers": suppliers_count,
                "users": users_count
            },
            "status": "Sistema pronto para produção"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar dados de teste: {str(e)}")

@api_router.get("/travel/airlines")
async def get_airlines():
    """Obter lista de companhias aéreas"""
    airlines = [
        {"code": "LA", "name": "LATAM Airlines", "country": "BR"},
        {"code": "G3", "name": "GOL Linhas Aéreas", "country": "BR"},
        {"code": "AD", "name": "Azul Linhas Aéreas", "country": "BR"},
        {"code": "AA", "name": "American Airlines", "country": "US"},
        {"code": "UA", "name": "United Airlines", "country": "US"},
        {"code": "DL", "name": "Delta Air Lines", "country": "US"},
        {"code": "AF", "name": "Air France", "country": "FR"},
        {"code": "LH", "name": "Lufthansa", "country": "DE"},
        {"code": "KL", "name": "KLM Royal Dutch Airlines", "country": "NL"},
        {"code": "BA", "name": "British Airways", "country": "GB"},
        {"code": "IB", "name": "Iberia", "country": "ES"},
        {"code": "TP", "name": "TAP Air Portugal", "country": "PT"},
        {"code": "AZ", "name": "Alitalia", "country": "IT"},
        {"code": "EK", "name": "Emirates", "country": "AE"},
        {"code": "QR", "name": "Qatar Airways", "country": "QA"},
        {"code": "TK", "name": "Turkish Airlines", "country": "TR"},
        {"code": "JJ", "name": "TAM Linhas Aéreas", "country": "BR"},
        {"code": "AR", "name": "Aerolíneas Argentinas", "country": "AR"},
        {"code": "CM", "name": "Copa Airlines", "country": "PA"},
        {"code": "AC", "name": "Air Canada", "country": "CA"}
    ]
    return {"airlines": airlines}

@api_router.get("/travel/airports")
async def get_airports(search: str = ""):
    """Buscar aeroportos"""
    airports = [
        {"code": "GRU", "name": "Aeroporto Internacional de São Paulo/Guarulhos", "city": "São Paulo", "country": "BR"},
        {"code": "CGH", "name": "Aeroporto de São Paulo/Congonhas", "city": "São Paulo", "country": "BR"},
        {"code": "SDU", "name": "Aeroporto Santos Dumont", "city": "Rio de Janeiro", "country": "BR"},
        {"code": "GIG", "name": "Aeroporto Internacional Tom Jobim", "city": "Rio de Janeiro", "country": "BR"},
        {"code": "BSB", "name": "Aeroporto Internacional de Brasília", "city": "Brasília", "country": "BR"},
        {"code": "CNF", "name": "Aeroporto Internacional Tancredo Neves", "city": "Belo Horizonte", "country": "BR"},
        {"code": "SSA", "name": "Aeroporto Internacional de Salvador", "city": "Salvador", "country": "BR"},
        {"code": "FOR", "name": "Aeroporto Internacional Pinto Martins", "city": "Fortaleza", "country": "BR"},
        {"code": "REC", "name": "Aeroporto Internacional do Recife", "city": "Recife", "country": "BR"},
        {"code": "POA", "name": "Aeroporto Internacional Salgado Filho", "city": "Porto Alegre", "country": "BR"},
        {"code": "CWB", "name": "Aeroporto Internacional Afonso Pena", "city": "Curitiba", "country": "BR"},
        {"code": "FLN", "name": "Aeroporto Internacional Hercílio Luz", "city": "Florianópolis", "country": "BR"},
        {"code": "JFK", "name": "John F. Kennedy International Airport", "city": "New York", "country": "US"},
        {"code": "LAX", "name": "Los Angeles International Airport", "city": "Los Angeles", "country": "US"},
        {"code": "MIA", "name": "Miami International Airport", "city": "Miami", "country": "US"},
        {"code": "CDG", "name": "Charles de Gaulle Airport", "city": "Paris", "country": "FR"},
        {"code": "LHR", "name": "Heathrow Airport", "city": "London", "country": "GB"},
        {"code": "FCO", "name": "Leonardo da Vinci Airport", "city": "Rome", "country": "IT"},
        {"code": "MAD", "name": "Madrid-Barajas Airport", "city": "Madrid", "country": "ES"},
        {"code": "LIS", "name": "Lisbon Airport", "city": "Lisbon", "country": "PT"}
    ]
    
    if search:
        filtered_airports = []
        search_lower = search.lower()
        for airport in airports:
            if (search_lower in airport["code"].lower() or 
                search_lower in airport["name"].lower() or 
                search_lower in airport["city"].lower()):
                filtered_airports.append(airport)
        return {"airports": filtered_airports}
    
    return {"airports": airports}

# Include the main router in the app  
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Rise Travel Cash Control API - Sistema funcionando corretamente!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)