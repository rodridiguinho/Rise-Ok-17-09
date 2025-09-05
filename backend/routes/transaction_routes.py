from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId
import logging

from models.transaction_model import (
    Transaction, TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionSummary, TransactionType, DEFAULT_CATEGORIES, DEFAULT_PAYMENT_METHODS
)
from auth.auth_handler import auth_handler
from database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/categories")
async def get_categories():
    """Obter categorias disponíveis"""
    return {"categories": DEFAULT_CATEGORIES}


@router.get("/payment-methods")
async def get_payment_methods():
    """Obter métodos de pagamento disponíveis"""
    return {"paymentMethods": DEFAULT_PAYMENT_METHODS}


@router.get("/summary", response_model=TransactionSummary)
async def get_transaction_summary(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Obter resumo das transações"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Filtros de data
        date_filter = {"userId": user_id}
        if start_date or end_date:
            date_filter["date"] = {}
            if start_date:
                date_filter["date"]["$gte"] = start_date
            if end_date:
                date_filter["date"]["$lte"] = end_date
        
        # Buscar todas as transações do usuário
        transactions = await db.transactions.find(date_filter).to_list(None)
        
        # Calcular totais
        total_entradas = sum(t["amount"] for t in transactions if t["type"] == "entrada")
        total_saidas = sum(t["amount"] for t in transactions if t["type"] == "saida")
        saldo_atual = total_entradas - total_saidas
        
        # Transações de hoje
        today = date.today()
        transacoes_hoje = len([t for t in transactions if t["date"] == today])
        
        # Clientes únicos atendidos
        clientes_unicos = set()
        for t in transactions:
            if t.get("client") and t["type"] == "entrada":
                clientes_unicos.add(t["client"])
        
        clientes_atendidos = len(clientes_unicos)
        
        # Ticket médio (apenas entradas)
        entradas = [t for t in transactions if t["type"] == "entrada"]
        ticket_medio = total_entradas / len(entradas) if entradas else 0.0
        
        return TransactionSummary(
            totalEntradas=total_entradas,
            totalSaidas=total_saidas,
            saldoAtual=saldo_atual,
            transacoesHoje=transacoes_hoje,
            clientesAtendidos=clientes_atendidos,
            ticketMedio=ticket_medio
        )
        
    except Exception as e:
        logger.error(f"Error getting transaction summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting transaction summary"
        )


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    limit: int = Query(100, le=1000),
    skip: int = Query(0, ge=0),
    type_filter: Optional[TransactionType] = Query(None, alias="type"),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Obter transações com filtros"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Construir filtros
        filters = {"userId": user_id}
        
        if type_filter:
            filters["type"] = type_filter.value
            
        if category:
            filters["category"] = category
            
        if start_date or end_date:
            filters["date"] = {}
            if start_date:
                filters["date"]["$gte"] = start_date
            if end_date:
                filters["date"]["$lte"] = end_date
        
        # Filtro de busca
        if search:
            filters["$or"] = [
                {"description": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"client": {"$regex": search, "$options": "i"}},
                {"supplier": {"$regex": search, "$options": "i"}}
            ]
        
        # Buscar transações
        transactions = await db.transactions.find(filters)\
            .sort("createdAt", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        # Converter para resposta
        response = []
        for t in transactions:
            response.append(TransactionResponse(
                id=str(t["_id"]),
                date=t["date"].strftime("%Y-%m-%d"),
                time=t["time"],
                type=t["type"],
                category=t["category"],
                description=t["description"],
                amount=t["amount"],
                paymentMethod=t["paymentMethod"],
                client=t.get("client"),
                supplier=t.get("supplier"),
                status=t["status"],
                createdAt=t["createdAt"]
            ))
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting transactions"
        )


@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_data: TransactionCreate,
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Criar nova transação"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Preparar dados da transação
        transaction_dict = transaction_data.dict()
        transaction_dict["userId"] = user_id
        
        # Se não foi fornecida data/hora, usar atual
        if transaction_data.transactionDate:
            transaction_dict["date"] = transaction_data.transactionDate
        else:
            transaction_dict["date"] = date.today()
            
        if transaction_data.transactionTime:
            transaction_dict["time"] = transaction_data.transactionTime
        else:
            transaction_dict["time"] = datetime.now().strftime("%H:%M")
        
        # Remover campos auxiliares
        transaction_dict.pop("transactionDate", None)
        transaction_dict.pop("transactionTime", None)
        
        # Inserir no banco
        result = await db.transactions.insert_one(transaction_dict)
        
        # Buscar transação criada
        created_transaction = await db.transactions.find_one({"_id": result.inserted_id})
        
        return TransactionResponse(
            id=str(created_transaction["_id"]),
            date=created_transaction["date"].strftime("%Y-%m-%d"),
            time=created_transaction["time"],
            type=created_transaction["type"],
            category=created_transaction["category"],
            description=created_transaction["description"],
            amount=created_transaction["amount"],
            paymentMethod=created_transaction["paymentMethod"],
            client=created_transaction.get("client"),
            supplier=created_transaction.get("supplier"),
            status=created_transaction["status"],
            createdAt=created_transaction["createdAt"]
        )
        
    except Exception as e:
        logger.error(f"Error creating transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating transaction"
        )


@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Deletar transação"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Verificar se a transação existe e pertence ao usuário
        existing_transaction = await db.transactions.find_one({
            "_id": ObjectId(transaction_id),
            "userId": user_id
        })
        
        if not existing_transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Deletar transação
        await db.transactions.delete_one({"_id": ObjectId(transaction_id)})
        
        return {"success": True, "message": "Transaction deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting transaction"
        )