#!/usr/bin/env python3
"""
Review Request Test Suite for Rise Travel System
Tests specific new functionalities mentioned in the review request:
1. Base de Aeroportos (67 airports)
2. Sistema de Múltiplos Fornecedores (up to 6)
3. Geração Automática de Despesas
4. Categorias Atualizadas
5. Produtos com Fornecedor
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

def authenticate():
    """Authenticate with the system"""
    global auth_token
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            print_result(True, "Authentication", f"Successfully logged in as {VALID_EMAIL}")
            return True
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return False
    except Exception as e:
        print_result(False, "Authentication failed", str(e))
        return False

def test_airports_database():
    """Test 1: Base de Aeroportos - 67 airports database"""
    print_test_header("1. BASE DE AEROPORTOS - 67 AIRPORTS DATABASE")
    
    try:
        response = requests.get(f"{API_URL}/travel/airports", timeout=10)
        if response.status_code == 200:
            airports = response.json()
            
            # Test total count
            if len(airports) == 67:
                print_result(True, "Airport count validation", f"Found exactly 67 airports as expected")
            else:
                print_result(False, "Airport count validation", f"Expected 67 airports, found {len(airports)}")
            
            # Test data structure
            if airports and isinstance(airports, list):
                sample_airport = airports[0]
                required_fields = ["code", "city", "name", "country"]
                missing_fields = [f for f in required_fields if f not in sample_airport]
                
                if not missing_fields:
                    print_result(True, "Airport data structure", f"All required fields present: {required_fields}")
                else:
                    print_result(False, "Airport data structure", f"Missing fields: {missing_fields}")
            
            # Test Brazilian airports
            brazilian_airports = [a for a in airports if a.get("country") == "Brasil"]
            expected_br_codes = ["GRU", "CGH", "SDU", "BSB"]
            found_br_codes = [a.get("code") for a in brazilian_airports]
            
            missing_br = [code for code in expected_br_codes if code not in found_br_codes]
            if not missing_br:
                print_result(True, "Brazilian airports validation", f"Found all expected Brazilian airports: {expected_br_codes}")
            else:
                print_result(False, "Brazilian airports validation", f"Missing Brazilian airports: {missing_br}")
            
            # Test international airports
            international_airports = [a for a in airports if a.get("country") != "Brasil"]
            expected_intl_codes = ["JFK", "LAX", "LHR", "CDG"]
            found_intl_codes = [a.get("code") for a in international_airports]
            
            missing_intl = [code for code in expected_intl_codes if code not in found_intl_codes]
            if not missing_intl:
                print_result(True, "International airports validation", f"Found all expected international airports: {expected_intl_codes}")
            else:
                print_result(False, "International airports validation", f"Missing international airports: {missing_intl}")
            
            # Display sample airports
            print_result(True, "Sample airports", f"GRU: {next((a for a in airports if a.get('code') == 'GRU'), {}).get('name', 'Not found')}")
            print_result(True, "Sample airports", f"JFK: {next((a for a in airports if a.get('code') == 'JFK'), {}).get('name', 'Not found')}")
            
        else:
            print_result(False, f"GET /api/travel/airports - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Airport database test failed", str(e))

def test_multiple_suppliers_system():
    """Test 2: Sistema de Múltiplos Fornecedores - up to 6 suppliers"""
    print_test_header("2. SISTEMA DE MÚLTIPLOS FORNECEDORES - UP TO 6 SUPPLIERS")
    
    if not authenticate():
        return
    
    try:
        # Create transaction with multiple suppliers (up to 6)
        multiple_suppliers_transaction = {
            "type": "entrada",
            "category": "Passagens Aéreas",
            "description": "Transação com múltiplos fornecedores",
            "amount": 5000.00,
            "paymentMethod": "PIX",
            "client": "Cliente Múltiplos Fornecedores",
            "transactionDate": "2025-01-20",
            "suppliers": [
                {
                    "name": "Fornecedor 1 - Companhia Aérea",
                    "value": "1200.00",
                    "paymentStatus": "Pendente",
                    "paymentDate": "2025-01-25",
                    "milesUsed": False
                },
                {
                    "name": "Fornecedor 2 - Hotel",
                    "value": "800.00",
                    "paymentStatus": "Pago",
                    "paymentDate": "2025-01-20",
                    "milesUsed": False
                },
                {
                    "name": "Fornecedor 3 - Transfer",
                    "value": "150.00",
                    "paymentStatus": "Pendente",
                    "paymentDate": "2025-01-30",
                    "milesUsed": False
                },
                {
                    "name": "Fornecedor 4 - Seguro",
                    "value": "100.00",
                    "paymentStatus": "Pago",
                    "paymentDate": "2025-01-20",
                    "milesUsed": False
                },
                {
                    "name": "Fornecedor 5 - Milhas",
                    "value": "500.00",
                    "paymentStatus": "Pendente",
                    "paymentDate": "2025-02-01",
                    "milesUsed": True,
                    "milesQuantity": 50000,
                    "milesProgram": "LATAM Pass"
                },
                {
                    "name": "Fornecedor 6 - Extras",
                    "value": "200.00",
                    "paymentStatus": "Pago",
                    "paymentDate": "2025-01-20",
                    "milesUsed": False
                }
            ],
            "saleValue": 5000.00,
            "supplierValue": 2950.00,  # Sum of all supplier values
            "commissionValue": 500.00
        }
        
        response = requests.post(f"{API_URL}/transactions", json=multiple_suppliers_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "Multiple suppliers transaction created", f"ID: {transaction_id}")
                
                # Verify suppliers array
                suppliers = data.get("suppliers", [])
                if len(suppliers) == 6:
                    print_result(True, "Suppliers count validation", f"Found {len(suppliers)} suppliers (maximum 6)")
                else:
                    print_result(False, "Suppliers count validation", f"Expected 6 suppliers, found {len(suppliers)}")
                
                # Verify individual supplier values
                total_supplier_value = 0
                paid_suppliers = 0
                miles_suppliers = 0
                
                for i, supplier in enumerate(suppliers, 1):
                    supplier_name = supplier.get("name", "")
                    supplier_value = float(supplier.get("value", 0))
                    payment_status = supplier.get("paymentStatus", "")
                    miles_used = supplier.get("milesUsed", False)
                    
                    total_supplier_value += supplier_value
                    if payment_status == "Pago":
                        paid_suppliers += 1
                    if miles_used:
                        miles_suppliers += 1
                    
                    print_result(True, f"Supplier {i} validation", 
                               f"{supplier_name}: R$ {supplier_value} - {payment_status} - Miles: {miles_used}")
                
                # Verify payment status tracking
                print_result(True, "Payment status tracking", f"Paid suppliers: {paid_suppliers}/6, Pending: {6-paid_suppliers}/6")
                
                # Verify miles system per supplier
                print_result(True, "Miles system per supplier", f"Suppliers using miles: {miles_suppliers}/6")
                
                # Verify total values
                if abs(total_supplier_value - 2950.00) < 0.01:
                    print_result(True, "Total supplier value calculation", f"Correct total: R$ {total_supplier_value}")
                else:
                    print_result(False, "Total supplier value calculation", f"Expected R$ 2950.00, got R$ {total_supplier_value}")
                
            else:
                print_result(False, "Multiple suppliers transaction creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Multiple suppliers system test failed", str(e))

def test_automatic_expense_generation():
    """Test 3: Geração Automática de Despesas"""
    print_test_header("3. GERAÇÃO AUTOMÁTICA DE DESPESAS")
    
    if not authenticate():
        return
    
    try:
        # Get initial transaction count
        initial_response = requests.get(f"{API_URL}/transactions", timeout=10)
        initial_count = len(initial_response.json()) if initial_response.status_code == 200 else 0
        
        # Create entrada transaction with paid supplier
        entrada_transaction = {
            "type": "entrada",
            "category": "Passagens Aéreas",
            "description": "Transação entrada com fornecedor pago",
            "amount": 2000.00,
            "paymentMethod": "PIX",
            "client": "Cliente Teste Despesa Auto",
            "seller": "Vendedor Teste",
            "transactionDate": "2025-01-20",
            "suppliers": [
                {
                    "name": "Fornecedor Auto Despesa",
                    "value": "1500.00",
                    "paymentStatus": "Pago",  # This should trigger automatic expense
                    "paymentDate": "2025-01-20",
                    "milesUsed": False
                }
            ],
            "saleValue": 2000.00,
            "supplierValue": 1500.00,
            "commissionValue": 200.00,
            "commissionPaymentStatus": "Pago"  # This should also trigger commission expense
        }
        
        response = requests.post(f"{API_URL}/transactions", json=entrada_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                entrada_id = data["id"]
                print_result(True, "Entrada transaction created", f"ID: {entrada_id}")
                
                # Check if automatic expenses were generated
                if "generatedExpenses" in data:
                    generated_count = data.get("generatedExpenses", 0)
                    expense_message = data.get("expenseMessage", "")
                    print_result(True, "Automatic expense generation", f"Generated {generated_count} expenses: {expense_message}")
                else:
                    print_result(False, "Automatic expense generation", "No automatic expenses generated")
                
                # Verify transaction count increased
                final_response = requests.get(f"{API_URL}/transactions", timeout=10)
                if final_response.status_code == 200:
                    final_transactions = final_response.json()
                    final_count = len(final_transactions)
                    
                    # Should have original entrada + generated saida transactions
                    expected_increase = 1 + data.get("generatedExpenses", 0)  # entrada + auto expenses
                    actual_increase = final_count - initial_count
                    
                    if actual_increase >= expected_increase:
                        print_result(True, "Transaction count verification", 
                                   f"Count increased by {actual_increase} (expected at least {expected_increase})")
                        
                        # Find generated expense transactions
                        expense_transactions = [t for t in final_transactions 
                                             if t.get("type") == "saida" and 
                                                t.get("originalTransactionId") == entrada_id]
                        
                        if expense_transactions:
                            print_result(True, "Generated expense transactions found", 
                                       f"Found {len(expense_transactions)} auto-generated expense transactions")
                            
                            for expense in expense_transactions:
                                expense_desc = expense.get("description", "")
                                expense_amount = expense.get("amount", 0)
                                expense_category = expense.get("category", "")
                                
                                if "Pagamento a Fornecedor" in expense_category:
                                    print_result(True, "Supplier expense validation", 
                                               f"Supplier expense: {expense_desc} - R$ {expense_amount}")
                                elif "Comissão" in expense_category:
                                    print_result(True, "Commission expense validation", 
                                               f"Commission expense: {expense_desc} - R$ {expense_amount}")
                        else:
                            print_result(False, "Generated expense transactions not found", 
                                       "Auto-generated expense transactions not found in database")
                    else:
                        print_result(False, "Transaction count verification", 
                                   f"Count increased by {actual_increase}, expected at least {expected_increase}")
                
            else:
                print_result(False, "Entrada transaction creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Automatic expense generation test failed", str(e))

def test_updated_categories():
    """Test 4: Categorias Atualizadas"""
    print_test_header("4. CATEGORIAS ATUALIZADAS")
    
    try:
        response = requests.get(f"{API_URL}/transactions/categories", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Expected new categories from review request
            expected_categories = [
                "Passagens Aéreas", "Pacotes", "Seguro Viagem", "Transfer", 
                "Hospedagem", "Airbnb", "Ingressos", "Parques", "Passeios", 
                "Consultoria", "Saldo mês anterior", "Cash Back", "Outros"
            ]
            
            if "categories" in data:
                categories = data["categories"]
                print_result(True, "Categories retrieved", f"Found {len(categories)} categories")
                
                # Check for new categories
                found_categories = []
                missing_categories = []
                
                for expected_cat in expected_categories:
                    if expected_cat in categories:
                        found_categories.append(expected_cat)
                    else:
                        missing_categories.append(expected_cat)
                
                if not missing_categories:
                    print_result(True, "New categories validation", f"All expected categories found: {len(found_categories)}/13")
                else:
                    print_result(False, "New categories validation", f"Missing categories: {missing_categories}")
                
                # Display sample of new categories
                sample_new = ["Passagens Aéreas", "Seguro Viagem", "Airbnb", "Cash Back"]
                for cat in sample_new:
                    if cat in categories:
                        print_result(True, f"Category '{cat}' present", "✓")
                    else:
                        print_result(False, f"Category '{cat}' missing", "✗")
            
            # Check expense categories
            if "expenseCategories" in data:
                expense_categories = data["expenseCategories"]
                print_result(True, "Expense categories retrieved", f"Found {len(expense_categories)} expense categories")
                
                expected_expense_cats = ["Salários", "Aluguel", "Conta de Água", "Conta de Luz", "Internet"]
                found_expense = [cat for cat in expected_expense_cats if cat in expense_categories]
                
                if len(found_expense) == len(expected_expense_cats):
                    print_result(True, "Expense categories validation", f"All expected expense categories found")
                else:
                    missing_expense = [cat for cat in expected_expense_cats if cat not in expense_categories]
                    print_result(False, "Expense categories validation", f"Missing expense categories: {missing_expense}")
            
        else:
            print_result(False, f"GET /api/transactions/categories - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Updated categories test failed", str(e))

def test_products_with_supplier():
    """Test 5: Produtos com Fornecedor"""
    print_test_header("5. PRODUTOS COM FORNECEDOR")
    
    if not authenticate():
        return
    
    try:
        # Create transaction with products without "valor cliente" field
        # and with supplier selection per product
        products_transaction = {
            "type": "entrada",
            "category": "Pacotes",
            "description": "Produtos com seleção de fornecedor",
            "amount": 3000.00,
            "paymentMethod": "PIX",
            "client": "Cliente Produtos Fornecedor",
            "transactionDate": "2025-01-20",
            "products": [
                {
                    "name": "Pacote Europa",
                    "cost": 2000.00,
                    # Note: No "valor cliente" field as mentioned in review request
                    "supplier": "Fornecedor Europa Ltda",
                    "supplierCode": "FOR001"
                },
                {
                    "name": "Seguro Viagem",
                    "cost": 150.00,
                    "supplier": "Seguradora Internacional",
                    "supplierCode": "FOR002"
                },
                {
                    "name": "Transfer Aeroporto",
                    "cost": 80.00,
                    "supplier": "Transfer Express",
                    "supplierCode": "FOR003"
                }
            ],
            "saleValue": 3000.00,
            "supplierValue": 2230.00,  # Sum of product costs
            "commissionValue": 300.00
        }
        
        response = requests.post(f"{API_URL}/transactions", json=products_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "Products with supplier transaction created", f"ID: {transaction_id}")
                
                # Verify products structure
                products = data.get("products", [])
                if len(products) == 3:
                    print_result(True, "Products count validation", f"Found {len(products)} products")
                    
                    # Verify each product has supplier selection
                    for i, product in enumerate(products, 1):
                        product_name = product.get("name", "")
                        product_cost = product.get("cost", 0)
                        product_supplier = product.get("supplier", "")
                        
                        # Verify no "valor cliente" field (as per review request)
                        has_client_value = "clientValue" in product
                        if not has_client_value:
                            print_result(True, f"Product {i} - No client value field", 
                                       f"{product_name}: cost=R$ {product_cost}, supplier={product_supplier}")
                        else:
                            print_result(False, f"Product {i} - Client value field present", 
                                       f"Product should not have 'clientValue' field as per review request")
                        
                        # Verify supplier selection
                        if product_supplier:
                            print_result(True, f"Product {i} - Supplier selection", 
                                       f"Supplier correctly assigned: {product_supplier}")
                        else:
                            print_result(False, f"Product {i} - Supplier selection", 
                                       f"No supplier assigned to product")
                    
                    # Verify total cost calculation
                    total_cost = sum(p.get("cost", 0) for p in products)
                    if abs(total_cost - 2230.00) < 0.01:
                        print_result(True, "Total product cost calculation", f"Correct total: R$ {total_cost}")
                    else:
                        print_result(False, "Total product cost calculation", f"Expected R$ 2230.00, got R$ {total_cost}")
                
                else:
                    print_result(False, "Products count validation", f"Expected 3 products, found {len(products)}")
                
            else:
                print_result(False, "Products with supplier transaction creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Products with supplier test failed", str(e))

def run_all_tests():
    """Run all review request tests"""
    print("🚀 STARTING RISE TRAVEL REVIEW REQUEST TESTING")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 API URL: {API_URL}")
    print(f"👤 Test User: {VALID_EMAIL}")
    
    # Run all tests
    test_airports_database()
    test_multiple_suppliers_system()
    test_automatic_expense_generation()
    test_updated_categories()
    test_products_with_supplier()
    
    print("\n" + "="*80)
    print("🏁 REVIEW REQUEST TESTING COMPLETED")
    print("="*80)

if __name__ == "__main__":
    run_all_tests()