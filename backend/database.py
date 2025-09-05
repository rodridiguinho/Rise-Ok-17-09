from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from typing import Optional

# Configurações do banco
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME', 'agentepro_cashcontrol')

# Cliente global do MongoDB
client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo():
    """Conectar ao MongoDB"""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        database = client[DB_NAME]
        
        # Verificar conexão
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        
        # Criar índices
        await create_indexes()
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Fechar conexão com o MongoDB"""
    if client:
        client.close()
        print("✅ MongoDB connection closed")


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency para obter instância do banco"""
    return database


async def create_indexes():
    """Criar índices necessários"""
    try:
        # Índices para usuários
        await database.users.create_index("email", unique=True)
        
        # Índices para transações
        await database.transactions.create_index([("userId", 1), ("date", -1)])
        await database.transactions.create_index([("userId", 1), ("type", 1)])
        await database.transactions.create_index([("userId", 1), ("category", 1)])
        await database.transactions.create_index([("userId", 1), ("createdAt", -1)])
        
        print("✅ Database indexes created")
        
    except Exception as e:
        print(f"⚠️  Error creating indexes: {e}")


# Funções auxiliares para dados iniciais
async def create_default_user():
    """Criar usuário padrão se não existir"""
    try:
        existing_user = await database.users.find_one({"email": "rorigo@risetravel.com.br"})
        if not existing_user:
            from models.user_model import User, UserSettings
            from auth.auth_handler import auth_handler
            
            default_settings = UserSettings()
            hashed_password = auth_handler.hash_password("Emily2030*")
            
            default_user = User(
                email="rorigo@risetravel.com.br",
                password=hashed_password,
                name="Rodrigo Silva",
                role="Gerente",
                companyName="AgentePro Turismo",
                phone="+55 11 99999-9999",
                address="Rua das Flores, 123 - São Paulo, SP",
                settings=default_settings
            )
            
            await database.users.insert_one(default_user.dict(by_alias=True))
            print("✅ Default user created")
            
    except Exception as e:
        print(f"⚠️  Error creating default user: {e}")