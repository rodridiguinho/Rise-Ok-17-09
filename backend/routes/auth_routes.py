from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user_model import User, UserCreate, UserLogin, UserResponse
from auth.auth_handler import auth_handler
from database import get_database
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Registrar novo usuário"""
    try:
        # Verificar se o email já existe
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash da senha
        hashed_password = auth_handler.hash_password(user_data.password)
        
        # Criar usuário
        user_dict = user_data.dict()
        user_dict["password"] = hashed_password
        user = User(**user_dict)
        
        # Inserir no banco
        result = await db.users.insert_one(user.dict(by_alias=True))
        
        # Buscar usuário criado
        created_user = await db.users.find_one({"_id": result.inserted_id})
        
        # Retornar dados do usuário (sem senha)
        user_response = UserResponse(
            id=str(created_user["_id"]),
            email=created_user["email"],
            name=created_user["name"],
            role=created_user["role"],
            companyName=created_user.get("companyName"),
            phone=created_user.get("phone"),
            address=created_user.get("address"),
            settings=created_user["settings"]
        )
        
        return user_response
        
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )


@router.post("/login")
async def login_user(login_data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Login do usuário"""
    try:
        # Buscar usuário por email
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Verificar senha
        if not auth_handler.verify_password(login_data.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Gerar token
        token = auth_handler.encode_token(str(user["_id"]), user["email"])
        
        # Dados do usuário para retorno
        user_data = UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"],
            companyName=user.get("companyName"),
            phone=user.get("phone"),
            address=user.get("address"),
            settings=user["settings"]
        )

        return {
            "success": True,
            "token": token,
            "user": user_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during login"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obter dados do usuário atual"""
    try:
        user_id = payload.get("user_id")
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            name=user["name"],
            role=user["role"],
            companyName=user.get("companyName"),
            phone=user.get("phone"),
            address=user.get("address"),
            settings=user["settings"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting user data"
        )


@router.post("/logout")
async def logout_user():
    """Logout do usuário (cliente deve remover o token)"""
    return {"success": True, "message": "Logout successful"}