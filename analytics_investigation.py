#!/usr/bin/env python3
"""
Analytics and Transactions Investigation - REVIEW REQUEST
INVESTIGAÇÃO APENAS (NÃO ALTERAR NADA) - Analytics e Transações Duplicadas
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing API at: {API_URL}")

# Test credentials from the review request
VALID_EMAIL = "rodrigo@risetravel.com.br"
VALID_PASSWORD = "Emily2030*"

# Global token storage
auth_token = None

def print_test_header(title):
    """Print a formatted test header"""
    print("\n" + "="*80)
    print(f"🧪 {title}")
    print("="*80)

def print_result(success, test_name, details=""):
    """Print a formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {test_name}")
    if details:
        print(f"     └─ {details}")

def test_analytics_and_transactions_investigation():
    """INVESTIGAÇÃO APENAS (NÃO ALTERAR NADA) - Analytics e Transações Duplicadas - REVIEW REQUEST"""
    print_test_header("INVESTIGAÇÃO ANALYTICS E TRANSAÇÕES DUPLICADAS - REVIEW REQUEST")
    
    # Test credentials from review request
    test_email = "rodrigo@risetravel.com.br"
    test_password = "Emily2030*"
    
    # Test 1: Authenticate first
    global auth_token
    try:
        login_data = {
            "email": test_email,
            "password": test_password
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print_result(True, "🔐 Authentication for analytics investigation", 
                       f"Successfully logged in as {test_email}")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "Authentication for analytics investigation failed", str(e))
        return
    
    # ANALYTICS CONSISTENCY CHECK
    print("\n" + "="*60)
    print("📊 1. ANALYTICS - VERIFICAR CONSISTÊNCIA")
    print("="*60)
    
    analytics_results = {}
    
    # Test sales-analysis endpoint
    try:
        response = requests.get(f"{API_URL}/reports/sales-analysis?start_date=2025-09-01&end_date=2025-09-16", timeout=15)
        if response.status_code == 200:
            data = response.json()
            analytics_results['sales_analysis'] = data
            print_result(True, "GET /api/reports/sales-analysis", 
                       f"✅ Endpoint accessible - Period: 2025-09-01 to 2025-09-16")
            
            # Extract key metrics
            sales_data = data.get('sales', {})
            print(f"     📈 Total Sales: R$ {sales_data.get('total_sales', 0):,.2f}")
            print(f"     💰 Total Supplier Costs: R$ {sales_data.get('total_supplier_costs', 0):,.2f}")
            print(f"     💵 Total Commissions: R$ {sales_data.get('total_commissions', 0):,.2f}")
            print(f"     📊 Net Profit: R$ {sales_data.get('net_profit', 0):,.2f}")
            print(f"     🔢 Sales Count: {sales_data.get('sales_count', 0)}")
            print(f"     📋 Average Sale: R$ {sales_data.get('average_sale', 0):,.2f}")
        else:
            print_result(False, f"GET /api/reports/sales-analysis - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/reports/sales-analysis failed", str(e))
    
    # Test sales-performance endpoint
    try:
        response = requests.get(f"{API_URL}/reports/sales-performance?start_date=2025-09-01&end_date=2025-09-16", timeout=15)
        if response.status_code == 200:
            data = response.json()
            analytics_results['sales_performance'] = data
            print_result(True, "GET /api/reports/sales-performance", 
                       f"✅ Endpoint accessible - Period: 2025-09-01 to 2025-09-16")
            
            # Extract key metrics
            sales_data = data.get('sales', {})
            print(f"     📈 Total Sales: R$ {sales_data.get('total_sales', 0):,.2f}")
            print(f"     🔢 Total Quantity: {sales_data.get('total_quantity', 0)}")
            print(f"     💰 Total Supplier Payments: R$ {sales_data.get('total_supplier_payments', 0):,.2f}")
            print(f"     💵 Total Commissions: R$ {sales_data.get('total_commissions', 0):,.2f}")
            print(f"     📊 Net Sales Profit: R$ {sales_data.get('net_sales_profit', 0):,.2f}")
            print(f"     📋 Average Ticket: R$ {sales_data.get('average_ticket', 0):,.2f}")
            print(f"     📈 Sales Margin: {sales_data.get('sales_margin', 0):.2f}%")
        else:
            print_result(False, f"GET /api/reports/sales-performance - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/reports/sales-performance failed", str(e))
    
    # Test complete-analysis endpoint
    try:
        response = requests.get(f"{API_URL}/reports/complete-analysis?start_date=2025-09-01&end_date=2025-09-16", timeout=15)
        if response.status_code == 200:
            data = response.json()
            analytics_results['complete_analysis'] = data
            print_result(True, "GET /api/reports/complete-analysis", 
                       f"✅ Endpoint accessible - Period: 2025-09-01 to 2025-09-16")
            
            # Extract key metrics
            summary = data.get('summary', {})
            print(f"     📈 Total Entradas: R$ {summary.get('total_entradas', 0):,.2f}")
            print(f"     📈 Total Entradas Vendas: R$ {summary.get('total_entradas_vendas', 0):,.2f}")
            print(f"     📈 Total Entradas Outras: R$ {summary.get('total_entradas_outras', 0):,.2f}")
            print(f"     📉 Total Saídas: R$ {summary.get('total_saidas', 0):,.2f}")
            print(f"     📉 Total Saídas Vendas: R$ {summary.get('total_saidas_vendas', 0):,.2f}")
            print(f"     📉 Total Saídas Outras: R$ {summary.get('total_saidas_outras', 0):,.2f}")
            print(f"     💰 Balance: R$ {summary.get('balance', 0):,.2f}")
        else:
            print_result(False, f"GET /api/reports/complete-analysis - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/reports/complete-analysis failed", str(e))
    
    # COMPARE VALUES BETWEEN ENDPOINTS
    print("\n🔍 COMPARAÇÃO DE VALORES ENTRE ENDPOINTS:")
    if 'sales_analysis' in analytics_results and 'sales_performance' in analytics_results:
        sa_sales = analytics_results['sales_analysis'].get('sales', {})
        sp_sales = analytics_results['sales_performance'].get('sales', {})
        
        # Compare total sales
        sa_total = sa_sales.get('total_sales', 0)
        sp_total = sp_sales.get('total_sales', 0)
        if abs(sa_total - sp_total) < 0.01:
            print_result(True, "Consistency Check - Total Sales", 
                       f"✅ Consistent: R$ {sa_total:,.2f} (both endpoints)")
        else:
            print_result(False, "Consistency Check - Total Sales", 
                       f"❌ INCONSISTENT: sales-analysis=R$ {sa_total:,.2f}, sales-performance=R$ {sp_total:,.2f}")
        
        # Compare supplier costs
        sa_costs = sa_sales.get('total_supplier_costs', 0)
        sp_costs = sp_sales.get('total_supplier_payments', 0)
        if abs(sa_costs - sp_costs) < 0.01:
            print_result(True, "Consistency Check - Supplier Costs", 
                       f"✅ Consistent: R$ {sa_costs:,.2f} (both endpoints)")
        else:
            print_result(False, "Consistency Check - Supplier Costs", 
                       f"❌ INCONSISTENT: sales-analysis=R$ {sa_costs:,.2f}, sales-performance=R$ {sp_costs:,.2f}")
        
        # Compare commissions
        sa_comm = sa_sales.get('total_commissions', 0)
        sp_comm = sp_sales.get('total_commissions', 0)
        if abs(sa_comm - sp_comm) < 0.01:
            print_result(True, "Consistency Check - Commissions", 
                       f"✅ Consistent: R$ {sa_comm:,.2f} (both endpoints)")
        else:
            print_result(False, "Consistency Check - Commissions", 
                       f"❌ INCONSISTENT: sales-analysis=R$ {sa_comm:,.2f}, sales-performance=R$ {sp_comm:,.2f}")
    
    # TRANSACTIONS ANALYSIS
    print("\n" + "="*60)
    print("🔍 2. TRANSAÇÕES - IDENTIFICAR DUPLICATAS/PROBLEMAS")
    print("="*60)
    
    all_transactions = []
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=15)
        if response.status_code == 200:
            all_transactions = response.json()
            print_result(True, "GET /api/transactions", 
                       f"✅ Retrieved {len(all_transactions)} total transactions")
        else:
            print_result(False, f"GET /api/transactions - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "GET /api/transactions failed", str(e))
        return
    
    # Count by internalReservationCode duplicates
    print("\n🔍 ANÁLISE DE CÓDIGOS DE RESERVA INTERNOS:")
    internal_codes = {}
    transactions_with_internal_codes = 0
    
    for transaction in all_transactions:
        internal_code = transaction.get('internalReservationCode')
        if internal_code:
            transactions_with_internal_codes += 1
            if internal_code in internal_codes:
                internal_codes[internal_code].append(transaction.get('id', 'No ID'))
            else:
                internal_codes[internal_code] = [transaction.get('id', 'No ID')]
    
    print(f"     📊 Transações com código interno: {transactions_with_internal_codes}")
    print(f"     📊 Códigos internos únicos: {len(internal_codes)}")
    
    # Find duplicates
    duplicates = {code: ids for code, ids in internal_codes.items() if len(ids) > 1}
    if duplicates:
        print_result(False, "Internal Reservation Code Duplicates Found", 
                   f"❌ {len(duplicates)} códigos duplicados encontrados")
        for code, ids in duplicates.items():
            print(f"     🚨 Código '{code}': {len(ids)} transações - IDs: {ids}")
    else:
        print_result(True, "Internal Reservation Code Duplicates Check", 
                   f"✅ Nenhum código interno duplicado encontrado")
    
    # Identify transactions with empty fields
    print("\n🔍 ANÁLISE DE CAMPOS VAZIOS:")
    empty_field_analysis = {
        'description': 0,
        'client': 0,
        'supplier': 0,
        'category': 0,
        'paymentMethod': 0,
        'amount': 0
    }
    
    for transaction in all_transactions:
        for field in empty_field_analysis.keys():
            value = transaction.get(field)
            if not value or (isinstance(value, str) and value.strip() == ''):
                empty_field_analysis[field] += 1
    
    for field, count in empty_field_analysis.items():
        if count > 0:
            print_result(False, f"Empty Field Analysis - {field}", 
                       f"❌ {count} transações com campo '{field}' vazio")
        else:
            print_result(True, f"Empty Field Analysis - {field}", 
                       f"✅ Todas as transações têm campo '{field}' preenchido")
    
    # Check suspicious timestamp patterns
    print("\n🔍 ANÁLISE DE PADRÕES DE TIMESTAMP SUSPEITOS:")
    date_patterns = {}
    time_patterns = {}
    
    for transaction in all_transactions:
        date = transaction.get('date') or transaction.get('transactionDate')
        time = transaction.get('time')
        
        if date:
            if date in date_patterns:
                date_patterns[date] += 1
            else:
                date_patterns[date] = 1
        
        if time:
            if time in time_patterns:
                time_patterns[time] += 1
            else:
                time_patterns[time] = 1
    
    # Find dates with many transactions (suspicious)
    suspicious_dates = {date: count for date, count in date_patterns.items() if count > 10}
    if suspicious_dates:
        print_result(False, "Suspicious Date Patterns", 
                   f"❌ {len(suspicious_dates)} datas com muitas transações")
        for date, count in sorted(suspicious_dates.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"     🚨 Data {date}: {count} transações")
    else:
        print_result(True, "Suspicious Date Patterns", 
                   f"✅ Nenhum padrão suspeito de datas encontrado")
    
    # Find times with many transactions (suspicious)
    suspicious_times = {time: count for time, count in time_patterns.items() if count > 5}
    if suspicious_times:
        print_result(False, "Suspicious Time Patterns", 
                   f"❌ {len(suspicious_times)} horários com muitas transações")
        for time, count in sorted(suspicious_times.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"     🚨 Horário {time}: {count} transações")
    else:
        print_result(True, "Suspicious Time Patterns", 
                   f"✅ Nenhum padrão suspeito de horários encontrado")
    
    # Count total by type
    print("\n🔍 CONTAGEM TOTAL POR TIPO:")
    type_counts = {
        'entrada': 0,
        'entrada_vendas': 0,
        'saida': 0,
        'saida_vendas': 0,
        'outros': 0
    }
    
    for transaction in all_transactions:
        transaction_type = transaction.get('type', '').lower()
        if transaction_type in type_counts:
            type_counts[transaction_type] += 1
        else:
            type_counts['outros'] += 1
    
    for type_name, count in type_counts.items():
        print_result(True, f"Transaction Type Count - {type_name}", 
                   f"📊 {count} transações do tipo '{type_name}'")
    
    # FINAL ANALYSIS SUMMARY
    print("\n" + "="*60)
    print("📋 3. ANÁLISE DE DADOS - RESUMO DOS ACHADOS")
    print("="*60)
    
    issues_found = []
    
    # Check for analytics inconsistencies
    if 'sales_analysis' in analytics_results and 'sales_performance' in analytics_results:
        sa_sales = analytics_results['sales_analysis'].get('sales', {})
        sp_sales = analytics_results['sales_performance'].get('sales', {})
        
        if abs(sa_sales.get('total_sales', 0) - sp_sales.get('total_sales', 0)) > 0.01:
            issues_found.append("❌ INCONSISTÊNCIA: Valores de vendas diferentes entre endpoints de analytics")
        
        if abs(sa_sales.get('total_supplier_costs', 0) - sp_sales.get('total_supplier_payments', 0)) > 0.01:
            issues_found.append("❌ INCONSISTÊNCIA: Custos de fornecedores diferentes entre endpoints de analytics")
    
    # Check for transaction issues
    if duplicates:
        issues_found.append(f"❌ DUPLICATAS: {len(duplicates)} códigos de reserva interna duplicados")
    
    empty_fields = [field for field, count in empty_field_analysis.items() if count > 0]
    if empty_fields:
        issues_found.append(f"❌ CAMPOS VAZIOS: Campos vazios encontrados em: {', '.join(empty_fields)}")
    
    if suspicious_dates:
        issues_found.append(f"❌ TIMESTAMPS SUSPEITOS: {len(suspicious_dates)} datas com muitas transações")
    
    if suspicious_times:
        issues_found.append(f"❌ TIMESTAMPS SUSPEITOS: {len(suspicious_times)} horários com muitas transações")
    
    # Final report
    if issues_found:
        print_result(False, "🚨 PROBLEMAS IDENTIFICADOS", 
                   f"Encontrados {len(issues_found)} problemas:")
        for i, issue in enumerate(issues_found, 1):
            print(f"     {i}. {issue}")
    else:
        print_result(True, "✅ SISTEMA ÍNTEGRO", 
                   "Nenhum problema crítico identificado na análise")
    
    # Detailed statistics
    print(f"\n📊 ESTATÍSTICAS DETALHADAS:")
    print(f"     📈 Total de transações analisadas: {len(all_transactions)}")
    print(f"     📊 Transações por tipo: entrada={type_counts['entrada']}, entrada_vendas={type_counts['entrada_vendas']}, saida={type_counts['saida']}, saida_vendas={type_counts['saida_vendas']}")
    print(f"     🔍 Códigos internos únicos: {len(internal_codes)}")
    print(f"     📅 Datas únicas: {len(date_patterns)}")
    print(f"     ⏰ Horários únicos: {len(time_patterns)}")
    
    print_result(True, "🎯 INVESTIGAÇÃO COMPLETA", 
               "Análise detalhada de analytics e transações concluída - NENHUMA ALTERAÇÃO REALIZADA")

def main():
    """Run the analytics investigation"""
    print("🚀 Starting Analytics and Transactions Investigation")
    print(f"📍 Backend URL: {BASE_URL}")
    print(f"🔗 API URL: {API_URL}")
    print(f"📧 Test Email: {VALID_EMAIL}")
    print("="*80)
    
    # Run the specific investigation test requested
    test_analytics_and_transactions_investigation()
    
    print("\n" + "="*80)
    print("🏁 Analytics Investigation Complete")
    print("="*80)

if __name__ == "__main__":
    main()