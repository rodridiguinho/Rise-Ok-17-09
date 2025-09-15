from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import FileResponse, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId
import logging
import tempfile
import os
import json

from models.transaction_model import CategorySummary
from auth.auth_handler import auth_handler
from database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary")
async def get_reports_summary(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Obter resumo para relatórios"""
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
        
        # Buscar transações
        transactions = await db.transactions.find(date_filter).to_list(None)
        
        # Calcular totais
        total_entradas = sum(t["amount"] for t in transactions if t["type"] == "entrada")
        total_saidas = sum(t["amount"] for t in transactions if t["type"] == "saida")
        resultado_liquido = total_entradas - total_saidas
        
        return {
            "totalEntradas": total_entradas,
            "totalSaidas": total_saidas,
            "resultadoLiquido": resultado_liquido,
            "periodo": {
                "inicio": start_date.strftime("%Y-%m-%d") if start_date else None,
                "fim": end_date.strftime("%Y-%m-%d") if end_date else None
            },
            "totalTransacoes": len(transactions)
        }
        
    except Exception as e:
        logger.error(f"Error getting reports summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting reports summary"
        )


@router.get("/category", response_model=List[CategorySummary])
async def get_category_analysis(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    transaction_type: Optional[str] = Query("entrada")
):
    """Análise por categoria"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Filtros
        filters = {"userId": user_id, "type": transaction_type}
        if start_date or end_date:
            filters["date"] = {}
            if start_date:
                filters["date"]["$gte"] = start_date
            if end_date:
                filters["date"]["$lte"] = end_date
        
        # Agregação por categoria
        pipeline = [
            {"$match": filters},
            {
                "$group": {
                    "_id": "$category",
                    "amount": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"amount": -1}}
        ]
        
        results = await db.transactions.aggregate(pipeline).to_list(None)
        
        # Calcular total para percentuais
        total_amount = sum(r["amount"] for r in results)
        
        # Preparar resposta
        category_analysis = []
        for result in results:
            percentage = (result["amount"] / total_amount * 100) if total_amount > 0 else 0
            category_analysis.append(CategorySummary(
                category=result["_id"],
                amount=result["amount"],
                count=result["count"],
                percentage=round(percentage, 1)
            ))
        
        return category_analysis
        
    except Exception as e:
        logger.error(f"Error getting category analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting category analysis"
        )


@router.get("/sales-analysis")
async def get_sales_analysis(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Análise de vendas incluindo valores pagos a fornecedores"""
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
        
        # Buscar todas as transações
        transactions = await db.transactions.find(date_filter).to_list(None)
        
        # Separar transações por tipo
        entrada_transactions = [t for t in transactions if t.get("type") == "entrada"]
        saida_transactions = [t for t in transactions if t.get("type") == "saida"]
        
        # Calcular totais de vendas (entradas)
        total_sales = sum(t.get("amount", 0) for t in entrada_transactions)
        total_quantity = len(entrada_transactions)
        
        # Calcular custos de fornecedores (valores pagos)
        total_supplier_costs = 0
        for transaction in entrada_transactions:
            # Somar supplierValue se existir
            supplier_value = transaction.get("supplierValue", 0)
            if supplier_value:
                total_supplier_costs += supplier_value
        
        # Calcular comissões (assumindo campo commission nas transações)
        total_commissions = sum(t.get("commission", 0) for t in entrada_transactions)
        
        # Calcular lucro líquido
        net_profit = total_sales - total_supplier_costs - total_commissions
        
        # Calcular ticket médio
        average_ticket = total_sales / total_quantity if total_quantity > 0 else 0
        
        # Calcular margem de lucro
        profit_margin = (net_profit / total_sales * 100) if total_sales > 0 else 0
        
        return {
            "sales": {
                "total_sales": total_sales,
                "total_quantity": total_quantity,
                "total_supplier_costs": total_supplier_costs,
                "total_commissions": total_commissions,
                "net_profit": net_profit,
                "average_ticket": average_ticket,
                "profit_margin": profit_margin
            },
            "period": {
                "start_date": start_date.strftime("%Y-%m-%d") if start_date else None,
                "end_date": end_date.strftime("%Y-%m-%d") if end_date else None
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting sales analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting sales analysis"
        )


@router.post("/export/pdf")
async def export_pdf_report(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Exportar relatório em PDF"""
    try:
        user_id = ObjectId(payload.get("user_id"))
        
        # Buscar dados do usuário
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Filtros de data
        date_filter = {"userId": user_id}
        if start_date or end_date:
            date_filter["date"] = {}
            if start_date:
                date_filter["date"]["$gte"] = start_date
            if end_date:
                date_filter["date"]["$lte"] = end_date
        
        # Buscar transações
        transactions = await db.transactions.find(date_filter).sort("date", -1).to_list(None)
        
        # Calcular totais
        total_entradas = sum(t["amount"] for t in transactions if t["type"] == "entrada")
        total_saidas = sum(t["amount"] for t in transactions if t["type"] == "saida")
        
        # Gerar PDF usando reportlab (simulado)
        pdf_content = generate_pdf_report(
            user_data=user,
            transactions=transactions,
            total_entradas=total_entradas,
            total_saidas=total_saidas,
            start_date=start_date,
            end_date=end_date
        )
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_content.encode('utf-8'))
            tmp_file_path = tmp_file.name
        
        # Retornar como download
        filename = f"relatorio_caixa_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        def cleanup():
            try:
                os.unlink(tmp_file_path)
            except:
                pass
        
        return FileResponse(
            tmp_file_path,
            filename=filename,
            media_type="application/pdf",
            background=cleanup
        )
        
    except Exception as e:
        logger.error(f"Error exporting PDF: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating PDF report"
        )


@router.post("/export/excel")
async def export_excel_report(
    payload: dict = Depends(auth_handler.auth_wrapper),
    db: AsyncIOMotorDatabase = Depends(get_database),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """Exportar relatório em Excel"""
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
        
        # Buscar transações
        transactions = await db.transactions.find(date_filter).sort("date", -1).to_list(None)
        
        # Gerar Excel (simulado - retorna CSV)
        csv_content = generate_csv_report(transactions)
        
        # Criar resposta
        filename = f"relatorio_caixa_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        logger.error(f"Error exporting Excel: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating Excel report"
        )


def generate_pdf_report(user_data, transactions, total_entradas, total_saidas, start_date, end_date):
    """Gerar conteúdo do PDF (simulado)"""
    report_content = f"""
RELATÓRIO DE CONTROLE DE CAIXA
{user_data.get('companyName', 'AgentePro Turismo')}

Período: {start_date or 'Início'} até {end_date or 'Hoje'}
Data de Geração: {datetime.now().strftime('%d/%m/%Y %H:%M')}

RESUMO FINANCEIRO:
Total de Entradas: R$ {total_entradas:,.2f}
Total de Saídas: R$ {total_saidas:,.2f}
Resultado Líquido: R$ {(total_entradas - total_saidas):,.2f}

DETALHAMENTO DAS TRANSAÇÕES:
{"="*80}
"""
    
    for t in transactions:
        tipo_symbol = "+" if t["type"] == "entrada" else "-"
        report_content += f"""
Data: {t['date'].strftime('%d/%m/%Y')} {t['time']}
Tipo: {t['type'].upper()}
Categoria: {t['category']}
Descrição: {t['description']}
Valor: {tipo_symbol}R$ {t['amount']:,.2f}
Pagamento: {t['paymentMethod']}
{f"Cliente: {t['client']}" if t.get('client') else ""}
{f"Fornecedor: {t['supplier']}" if t.get('supplier') else ""}
Status: {t['status']}
{"-"*40}
"""
    
    return report_content


def generate_csv_report(transactions):
    """Gerar conteúdo CSV"""
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabeçalho
    writer.writerow([
        'Data', 'Hora', 'Tipo', 'Categoria', 'Descrição', 
        'Valor', 'Forma Pagamento', 'Cliente', 'Fornecedor', 'Status'
    ])
    
    # Dados
    for t in transactions:
        writer.writerow([
            t['date'].strftime('%d/%m/%Y'),
            t['time'],
            t['type'],
            t['category'],
            t['description'],
            f"{t['amount']:.2f}",
            t['paymentMethod'],
            t.get('client', ''),
            t.get('supplier', ''),
            t['status']
        ])
    
    return output.getvalue()