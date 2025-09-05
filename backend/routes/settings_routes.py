from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import logging
from datetime import datetime

from models.user_model import UserSettings, UserUpdate
from auth.auth_handler import auth_handler
from database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/")
async def get_user_settings(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Obter configurações do usuário"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        user = await db.users.find_one({"_id": user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "companyName": user.get("companyName"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "address": user.get("address"),
            "settings": user.get("settings", {}),
            "name": user.get("name")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting user settings"
        )


@router.put("/")
async def update_user_settings(
    settings_data: dict,
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Atualizar configurações do usuário"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Verificar se usuário existe
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Preparar dados para atualização
        update_data = {}
        
        # Campos básicos
        if "companyName" in settings_data:
            update_data["companyName"] = settings_data["companyName"]
        if "phone" in settings_data:
            update_data["phone"] = settings_data["phone"]
        if "address" in settings_data:
            update_data["address"] = settings_data["address"]
        if "name" in settings_data:
            update_data["name"] = settings_data["name"]
        
        # Configurações
        if "settings" in settings_data:
            update_data["settings"] = settings_data["settings"]
        
        # Data de atualização
        update_data["updatedAt"] = datetime.utcnow()
        
        # Atualizar no banco
        await db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Settings updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user settings"
        )


@router.post("/reset")
async def reset_user_settings(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Resetar configurações para padrão"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Configurações padrão
        default_settings = UserSettings()
        
        # Atualizar no banco
        await db.users.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "settings": default_settings.dict(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        return {"success": True, "message": "Settings reset to default"}
        
    except Exception as e:
        logger.error(f"Error resetting user settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting user settings"
        )


@router.get("/export-data")
async def export_user_data(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Exportar todos os dados do usuário"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Buscar dados do usuário
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Buscar transações
        transactions = await db.transactions.find({"userId": user_id}).to_list(None)
        
        # Remover campos sensíveis
        user.pop("password", None)
        user["_id"] = str(user["_id"])
        
        # Converter ObjectIds das transações
        for t in transactions:
            t["_id"] = str(t["_id"])
            t["userId"] = str(t["userId"])
            if isinstance(t.get("date"), datetime):
                t["date"] = t["date"].isoformat()
            if isinstance(t.get("createdAt"), datetime):
                t["createdAt"] = t["createdAt"].isoformat()
            if isinstance(t.get("updatedAt"), datetime):
                t["updatedAt"] = t["updatedAt"].isoformat()
        
        # Preparar resposta
        export_data = {
            "user": user,
            "transactions": transactions,
            "exportDate": datetime.utcnow().isoformat(),
            "totalTransactions": len(transactions)
        }
        
        return export_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error exporting user data"
        )