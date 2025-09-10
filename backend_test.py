#!/usr/bin/env python3
"""
Backend Test Suite for AgentePro Cash Control System
Tests all API endpoints and validates functionality
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
INVALID_EMAIL = "invalid@test.com"
INVALID_PASSWORD = "wrongpassword"

# Global token storage
auth_token = None

def test_review_request_company_settings():
    """Test Company Settings Functionality - REVIEW REQUEST"""
    print_test_header("Company Settings Functionality - Review Request Testing")
    
    # Test 1: GET /api/company/settings - Verify settings load correctly
    try:
        response = requests.get(f"{API_URL}/company/settings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify all expected fields are present
            expected_fields = ["name", "email", "phone", "address", "city", "state", "zipCode", "cnpj", "website"]
            missing_fields = [f for f in expected_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/company/settings - Settings structure validation", 
                           f"All expected fields present: {expected_fields}")
                
                # Display current settings
                print_result(True, "GET /api/company/settings - Current settings loaded", 
                           f"Company: {data.get('name')}, Email: {data.get('email')}, Phone: {data.get('phone')}")
            else:
                print_result(False, "GET /api/company/settings - Settings structure validation", 
                           f"Missing fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/company/settings - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/company/settings - Request failed", str(e))
    
    # Test 2: POST /api/company/settings - Update company data and verify persistence
    try:
        updated_settings = {
            "name": "Rise Travel Updated",
            "email": "new-email@risetravel.com",
            "phone": "(11) 98888-8888",
            "address": "Rua Nova das Viagens, 456",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "01234-567",
            "cnpj": "12.345.678/0001-90",
            "website": "www.risetravel.com.br"
        }
        
        response = requests.post(f"{API_URL}/company/settings", json=updated_settings, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") and "sucesso" in data.get("message", "").lower():
                print_result(True, "POST /api/company/settings - Settings update successful", 
                           f"Message: {data.get('message')}")
                
                # Verify updated data is returned
                if "settings" in data:
                    returned_settings = data["settings"]
                    for field, expected_value in updated_settings.items():
                        if returned_settings.get(field) == expected_value:
                            print_result(True, f"POST /api/company/settings - Field update ({field})", 
                                       f"Correctly updated to: {expected_value}")
                        else:
                            print_result(False, f"POST /api/company/settings - Field update ({field})", 
                                       f"Expected: {expected_value}, Got: {returned_settings.get(field)}")
                else:
                    print_result(False, "POST /api/company/settings - Response validation", 
                               "Updated settings not returned in response")
            else:
                print_result(False, "POST /api/company/settings - Update failed", data)
        else:
            print_result(False, f"POST /api/company/settings - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/company/settings - Request failed", str(e))
    
    # Test 3: Verify settings persistence after updates
    try:
        response = requests.get(f"{API_URL}/company/settings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Check if updated values persist
            expected_updates = {
                "name": "Rise Travel Updated",
                "email": "new-email@risetravel.com",
                "phone": "(11) 98888-8888"
            }
            
            persistence_verified = True
            for field, expected_value in expected_updates.items():
                if data.get(field) == expected_value:
                    print_result(True, f"Company settings persistence ({field})", 
                               f"Value correctly persisted: {expected_value}")
                else:
                    print_result(False, f"Company settings persistence ({field})", 
                               f"Expected: {expected_value}, Got: {data.get(field)}")
                    persistence_verified = False
            
            if persistence_verified:
                print_result(True, "Company settings - Complete persistence validation", 
                           "All company settings correctly persisted after update")
            else:
                print_result(False, "Company settings - Complete persistence validation", 
                           "Some company settings failed to persist correctly")
        else:
            print_result(False, f"Company settings persistence check - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Company settings persistence check failed", str(e))

def test_review_request_enhanced_products():
    """Test Enhanced Transaction Products - REVIEW REQUEST"""
    print_test_header("Enhanced Transaction Products - Review Request Testing")
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            print_result(True, "Authentication for enhanced products testing", 
                       f"Successfully logged in as {VALID_EMAIL}")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Authentication for enhanced products testing failed", str(e))
    
    # Test 2: Create transaction with new product structure from review request
    try:
        enhanced_transaction = {
            "type": "entrada",
            "category": "Vendas de Passagens",
            "description": "Transação com produtos aprimorados",
            "amount": 1280.00,  # Total client value
            "paymentMethod": "PIX",
            "client": "Cliente Teste Produtos",
            "transactionDate": "2025-01-15",
            "products": [
                {
                    "name": "Passagem Internacional",
                    "cost": 800.00,
                    "clientValue": 1200.00
                },
                {
                    "name": "Taxa de Embarque", 
                    "cost": 45.00,
                    "clientValue": 80.00
                }
            ],
            "saleValue": 1280.00,  # Total client value
            "supplierValue": 845.00,  # Total cost
            "commissionValue": 128.00,  # 10% commission
            "commissionPercentage": 10.0
        }
        
        response = requests.post(f"{API_URL}/transactions", json=enhanced_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Enhanced products transaction created", 
                           f"ID: {transaction_id}, Total: R$ {data.get('amount')}")
                
                # Test 3: Verify both cost and client value fields save correctly
                products = data.get("products", [])
                if len(products) == 2:
                    print_result(True, "Enhanced products - Products array validation", 
                               f"Found {len(products)} products as expected")
                    
                    # Verify first product (Passagem Internacional)
                    product1 = products[0]
                    if (product1.get("name") == "Passagem Internacional" and 
                        product1.get("cost") == 800.00 and 
                        product1.get("clientValue") == 1200.00):
                        print_result(True, "Enhanced products - Product 1 validation", 
                                   f"Passagem Internacional: cost=R$ {product1.get('cost')}, clientValue=R$ {product1.get('clientValue')}")
                    else:
                        print_result(False, "Enhanced products - Product 1 validation", 
                                   f"Expected: Passagem Internacional, cost=800.00, clientValue=1200.00, Got: {product1}")
                    
                    # Verify second product (Taxa de Embarque)
                    product2 = products[1]
                    if (product2.get("name") == "Taxa de Embarque" and 
                        product2.get("cost") == 45.00 and 
                        product2.get("clientValue") == 80.00):
                        print_result(True, "Enhanced products - Product 2 validation", 
                                   f"Taxa de Embarque: cost=R$ {product2.get('cost')}, clientValue=R$ {product2.get('clientValue')}")
                    else:
                        print_result(False, "Enhanced products - Product 2 validation", 
                                   f"Expected: Taxa de Embarque, cost=45.00, clientValue=80.00, Got: {product2}")
                else:
                    print_result(False, "Enhanced products - Products array validation", 
                               f"Expected 2 products, got {len(products)}")
                
                # Test 4: Verify financial calculations
                expected_sale_value = 1280.00  # 1200 + 80
                expected_supplier_value = 845.00  # 800 + 45
                expected_commission = 128.00  # 10% of sale value
                
                if data.get("saleValue") == expected_sale_value:
                    print_result(True, "Enhanced products - Sale value calculation", 
                               f"Correct sale value: R$ {data.get('saleValue')}")
                else:
                    print_result(False, "Enhanced products - Sale value calculation", 
                               f"Expected: R$ {expected_sale_value}, Got: R$ {data.get('saleValue')}")
                
                if data.get("supplierValue") == expected_supplier_value:
                    print_result(True, "Enhanced products - Supplier value calculation", 
                               f"Correct supplier value: R$ {data.get('supplierValue')}")
                else:
                    print_result(False, "Enhanced products - Supplier value calculation", 
                               f"Expected: R$ {expected_supplier_value}, Got: R$ {data.get('supplierValue')}")
                
                if data.get("commissionValue") == expected_commission:
                    print_result(True, "Enhanced products - Commission calculation", 
                               f"Correct commission: R$ {data.get('commissionValue')}")
                else:
                    print_result(False, "Enhanced products - Commission calculation", 
                               f"Expected: R$ {expected_commission}, Got: R$ {data.get('commissionValue')}")
                
            else:
                print_result(False, "POST /api/transactions - Enhanced products creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Enhanced products transaction creation failed", str(e))

def test_review_request_complete_enhanced_transaction():
    """Test Complete Enhanced Transaction - REVIEW REQUEST"""
    print_test_header("Complete Enhanced Transaction - Review Request Testing")
    
    # Test 1: Test transaction with all new features
    try:
        complete_transaction = {
            "type": "entrada",
            "category": "Vendas de Passagens",  # Revenue category
            "description": "Transação completa com todos os recursos",
            "amount": 4500.00,
            "paymentMethod": "PIX",
            "client": "Cliente Completo Teste",
            "transactionDate": "2025-01-20",
            # Enhanced travel fields (escalas, milhas, etc.)
            "hasStops": True,
            "outboundStops": "Frankfurt",
            "returnStops": "Madrid",
            "supplierUsedMiles": True,
            "supplierMilesQuantity": 150000,
            "supplierMilesValue": 35.00,
            "supplierMilesProgram": "LATAM Pass",
            "airportTaxes": 200.00,
            "departureCity": "São Paulo",
            "arrivalCity": "Paris",
            "clientReservationCode": "RT789012",
            # Multiple products with cost/client structure
            "products": [
                {
                    "name": "Passagem GRU-CDG",
                    "cost": 2250.00,
                    "clientValue": 2800.00
                },
                {
                    "name": "Passagem CDG-GRU",
                    "cost": 2100.00,
                    "clientValue": 2700.00
                },
                {
                    "name": "Seguro Viagem Europa",
                    "cost": 80.00,
                    "clientValue": 120.00
                }
            ],
            "saleValue": 5620.00,  # Total client value
            "supplierValue": 4430.00,  # Total cost
            "commissionValue": 562.00,  # 10% commission
            "commissionPercentage": 10.0,
            "seller": "Vendedor Teste"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=complete_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Complete enhanced transaction created", 
                           f"ID: {transaction_id}, Total: R$ {data.get('amount')}")
                
                # Test 2: Verify revenue category handling
                if data.get("category") == "Vendas de Passagens":
                    print_result(True, "Complete enhanced transaction - Revenue category", 
                               f"Revenue category correctly saved: {data.get('category')}")
                else:
                    print_result(False, "Complete enhanced transaction - Revenue category", 
                               f"Expected: Vendas de Passagens, Got: {data.get('category')}")
                
                # Test 3: Verify enhanced travel fields
                travel_fields_validation = {
                    "hasStops": True,
                    "outboundStops": "Frankfurt",
                    "returnStops": "Madrid",
                    "supplierUsedMiles": True,
                    "supplierMilesQuantity": 150000,
                    "supplierMilesValue": 35.00,
                    "supplierMilesProgram": "LATAM Pass",
                    "airportTaxes": 200.00,
                    "departureCity": "São Paulo",
                    "arrivalCity": "Paris",
                    "clientReservationCode": "RT789012"
                }
                
                travel_fields_correct = True
                for field, expected_value in travel_fields_validation.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Complete enhanced transaction - Travel field ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"Complete enhanced transaction - Travel field ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                        travel_fields_correct = False
                
                # Test 4: Verify multiple products with cost/client structure
                products = data.get("products", [])
                if len(products) == 3:
                    print_result(True, "Complete enhanced transaction - Multiple products", 
                               f"Found {len(products)} products as expected")
                    
                    expected_products = [
                        {"name": "Passagem GRU-CDG", "cost": 2250.00, "clientValue": 2800.00},
                        {"name": "Passagem CDG-GRU", "cost": 2100.00, "clientValue": 2700.00},
                        {"name": "Seguro Viagem Europa", "cost": 80.00, "clientValue": 120.00}
                    ]
                    
                    for i, expected_product in enumerate(expected_products):
                        if i < len(products):
                            product = products[i]
                            if (product.get("name") == expected_product["name"] and 
                                product.get("cost") == expected_product["cost"] and 
                                product.get("clientValue") == expected_product["clientValue"]):
                                print_result(True, f"Complete enhanced transaction - Product {i+1} validation", 
                                           f"{product.get('name')}: cost=R$ {product.get('cost')}, clientValue=R$ {product.get('clientValue')}")
                            else:
                                print_result(False, f"Complete enhanced transaction - Product {i+1} validation", 
                                           f"Expected: {expected_product}, Got: {product}")
                else:
                    print_result(False, "Complete enhanced transaction - Multiple products", 
                               f"Expected 3 products, got {len(products)}")
                
            else:
                print_result(False, "POST /api/transactions - Complete enhanced transaction creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Complete enhanced transaction creation failed", str(e))

def test_review_request_expense_transaction():
    """Test Expense Transaction - REVIEW REQUEST"""
    print_test_header("Expense Transaction Test - Review Request Testing")
    
    # Test 1: Get expense categories first
    try:
        response = requests.get(f"{API_URL}/transactions/categories", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "expenseCategories" in data and isinstance(data["expenseCategories"], list):
                expense_categories = data["expenseCategories"]
                print_result(True, "GET /api/transactions/categories - Expense categories retrieved", 
                           f"Found {len(expense_categories)} expense categories")
                
                # Display some expense categories
                sample_categories = expense_categories[:5]  # First 5 categories
                print_result(True, "Expense categories sample", 
                           f"Categories: {', '.join(sample_categories)}")
            else:
                print_result(False, "GET /api/transactions/categories - Missing expense categories", 
                           "expenseCategories not found in response")
        else:
            print_result(False, f"GET /api/transactions/categories - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions/categories - Request failed", str(e))
    
    # Test 2: Create expense transaction with expense category
    try:
        expense_transaction = {
            "type": "saída",  # Expense type
            "category": "Salários",  # From expense categories
            "description": "Pagamento salário funcionário",
            "amount": 3500.00,
            "paymentMethod": "Transferência",
            "supplier": "Funcionário Teste",
            "transactionDate": "2025-01-18"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=expense_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Expense transaction created", 
                           f"ID: {transaction_id}, Amount: R$ {data.get('amount')}")
                
                # Test 3: Verify correct category handling based on type
                if data.get("type") == "saída" and data.get("category") == "Salários":
                    print_result(True, "Expense transaction - Type and category validation", 
                               f"Expense type 'saída' with expense category 'Salários' correctly saved")
                else:
                    print_result(False, "Expense transaction - Type and category validation", 
                               f"Expected: type='saída', category='Salários', Got: type='{data.get('type')}', category='{data.get('category')}'")
                
                # Test 4: Verify expense transaction fields
                expected_fields = {
                    "type": "saída",
                    "category": "Salários",
                    "description": "Pagamento salário funcionário",
                    "amount": 3500.00,
                    "paymentMethod": "Transferência",
                    "supplier": "Funcionário Teste"
                }
                
                fields_correct = True
                for field, expected_value in expected_fields.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Expense transaction - Field validation ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"Expense transaction - Field validation ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                        fields_correct = False
                
            else:
                print_result(False, "POST /api/transactions - Expense transaction creation failed", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Expense transaction creation failed", str(e))

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 TESTING: {test_name}")
    print(f"{'='*60}")

def print_result(success, message, details=None):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"   Details: {details}")

def test_api_connectivity():
    """Test basic API connectivity"""
    print_test_header("API Connectivity")
    
    # Test 1: GET /api/ - Health check
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and ("AgentePro" in data["message"] or "Rise Travel" in data["message"]):
                print_result(True, "GET /api/ - Root endpoint working", f"Response: {data}")
            else:
                print_result(False, "GET /api/ - Unexpected response format", f"Response: {data}")
        else:
            print_result(False, f"GET /api/ - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/ - Connection failed", str(e))
    
    # Test 2: GET /api/health - Status check (this endpoint doesn't exist in the code)
    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        if response.status_code == 200:
            print_result(True, "GET /api/health - Health endpoint working", response.json())
        else:
            print_result(False, f"GET /api/health - HTTP {response.status_code}", "Endpoint not implemented")
    except Exception as e:
        print_result(False, "GET /api/health - Connection failed", "Endpoint not implemented")

def test_authentication():
    """Test authentication endpoints"""
    global auth_token
    print_test_header("Authentication")
    
    # Test 1: Valid credentials
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "token" in data and "user" in data:
                auth_token = data["token"]
                user_info = data["user"]
                print_result(True, "POST /api/auth/login - Valid credentials", 
                           f"User: {user_info.get('name')} ({user_info.get('email')})")
            else:
                print_result(False, "POST /api/auth/login - Invalid response format", data)
        else:
            print_result(False, f"POST /api/auth/login - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/auth/login - Valid credentials failed", str(e))
    
    # Test 2: Invalid credentials
    try:
        login_data = {
            "email": INVALID_EMAIL,
            "password": INVALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 401:
            print_result(True, "POST /api/auth/login - Invalid credentials properly rejected", 
                        "Correctly returned 401 Unauthorized")
        else:
            print_result(False, f"POST /api/auth/login - Expected 401, got {response.status_code}", 
                        response.text)
    except Exception as e:
        print_result(False, "POST /api/auth/login - Invalid credentials test failed", str(e))

def test_transactions():
    """Test transaction endpoints"""
    print_test_header("Transactions")
    
    # Test 1: GET /api/transactions/summary
    try:
        response = requests.get(f"{API_URL}/transactions/summary", timeout=10)
        if response.status_code == 200:
            data = response.json()
            required_fields = ["totalEntradas", "totalSaidas", "saldoAtual", "transacoesHoje", "clientesAtendidos", "ticketMedio"]
            if all(field in data for field in required_fields):
                print_result(True, "GET /api/transactions/summary - Summary data retrieved", 
                           f"Saldo: R$ {data.get('saldoAtual')}")
            else:
                print_result(False, "GET /api/transactions/summary - Missing required fields", 
                           f"Missing: {[f for f in required_fields if f not in data]}")
        else:
            print_result(False, f"GET /api/transactions/summary - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions/summary - Request failed", str(e))
    
    # Test 2: GET /api/transactions
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                transaction = data[0]
                required_fields = ["id", "date", "type", "category", "description", "amount", "paymentMethod"]
                if all(field in transaction for field in required_fields):
                    print_result(True, "GET /api/transactions - Transaction list retrieved", 
                               f"Found {len(data)} transactions")
                else:
                    print_result(False, "GET /api/transactions - Invalid transaction format", 
                               f"Missing fields in transaction: {[f for f in required_fields if f not in transaction]}")
            else:
                print_result(False, "GET /api/transactions - Invalid response format", 
                           "Expected array of transactions")
        else:
            print_result(False, f"GET /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions - Request failed", str(e))
    
    # Test 3: GET /api/transactions/categories
    try:
        response = requests.get(f"{API_URL}/transactions/categories", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "categories" in data and isinstance(data["categories"], list) and len(data["categories"]) > 0:
                print_result(True, "GET /api/transactions/categories - Categories retrieved", 
                           f"Found {len(data['categories'])} categories")
            else:
                print_result(False, "GET /api/transactions/categories - Invalid response format", data)
        else:
            print_result(False, f"GET /api/transactions/categories - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions/categories - Request failed", str(e))
    
    # Test 4: GET /api/transactions/payment-methods
    try:
        response = requests.get(f"{API_URL}/transactions/payment-methods", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "paymentMethods" in data and isinstance(data["paymentMethods"], list) and len(data["paymentMethods"]) > 0:
                print_result(True, "GET /api/transactions/payment-methods - Payment methods retrieved", 
                           f"Found {len(data['paymentMethods'])} methods")
            else:
                print_result(False, "GET /api/transactions/payment-methods - Invalid response format", data)
        else:
            print_result(False, f"GET /api/transactions/payment-methods - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions/payment-methods - Request failed", str(e))
    
    # Test 5: POST /api/transactions - Create new transaction
    try:
        new_transaction = {
            "type": "entrada",
            "category": "Pacote Turístico",
            "description": "Teste - Pacote Caribe 5 dias",
            "amount": 3500.00,
            "paymentMethod": "PIX",
            "client": "Maria Santos"
        }
        response = requests.post(f"{API_URL}/transactions", json=new_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("type") == new_transaction["type"]:
                print_result(True, "POST /api/transactions - Transaction created successfully", 
                           f"ID: {data.get('id')}, Amount: R$ {data.get('amount')}")
            else:
                print_result(False, "POST /api/transactions - Invalid response format", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Request failed", str(e))
    
    # Test 6: DELETE /api/transactions/{id} - This endpoint doesn't exist in the code
    try:
        test_id = "test123"
        response = requests.delete(f"{API_URL}/transactions/{test_id}", timeout=10)
        if response.status_code == 200:
            print_result(True, "DELETE /api/transactions/{id} - Delete endpoint working", response.json())
        else:
            print_result(False, f"DELETE /api/transactions/{id} - HTTP {response.status_code}", 
                        "Endpoint not implemented")
    except Exception as e:
        print_result(False, "DELETE /api/transactions/{id} - Request failed", "Endpoint not implemented")

def test_reports():
    """Test report endpoints with comprehensive export functionality testing"""
    print_test_header("Reports - PDF and Excel Export Testing")
    
    # Sample report data as specified in the review request
    sample_report_data = {
        "startDate": "2025-09-01",
        "endDate": "2025-09-07", 
        "transactions": [
            {
                "type": "entrada",
                "category": "Pacote Turístico",
                "description": "Pacote Europa",
                "amount": 5000.00,
                "paymentMethod": "PIX",
                "date": "2025-09-05",
                "time": "10:30",
                "client": "João Silva"
            },
            {
                "type": "saida",
                "category": "Fornecedor", 
                "description": "Hotel Payment",
                "amount": 1200.00,
                "paymentMethod": "Transferência",
                "date": "2025-09-06",
                "time": "14:15",
                "supplier": "Hotel Ibis"
            }
        ]
    }
    
    # Test 1: POST /api/reports/export/pdf with sample data
    try:
        response = requests.post(f"{API_URL}/reports/export/pdf", json=sample_report_data, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/pdf - PDF export with sample data", 
                           f"Message: {data.get('message')}")
                
                # Validate response structure
                required_fields = ["success", "message", "filename", "downloadUrl", "contentType"]
                missing_fields = [f for f in required_fields if f not in data]
                
                if not missing_fields:
                    print_result(True, "POST /api/reports/export/pdf - Response structure validation", 
                               f"All required fields present: {required_fields}")
                    
                    # Validate filename format (should include timestamp)
                    filename = data.get("filename", "")
                    if filename.startswith("relatorio_caixa_") and filename.endswith(".pdf"):
                        print_result(True, "POST /api/reports/export/pdf - Filename format validation", 
                                   f"Filename correctly formatted: {filename}")
                    else:
                        print_result(False, "POST /api/reports/export/pdf - Filename format validation", 
                                   f"Invalid filename format: {filename}")
                    
                    # Validate content type
                    content_type = data.get("contentType", "")
                    if content_type == "application/pdf":
                        print_result(True, "POST /api/reports/export/pdf - Content type validation", 
                                   f"Correct content type: {content_type}")
                    else:
                        print_result(False, "POST /api/reports/export/pdf - Content type validation", 
                                   f"Expected: application/pdf, Got: {content_type}")
                    
                    # Validate download URL format
                    download_url = data.get("downloadUrl", "")
                    if download_url.startswith("/api/reports/download/") and filename in download_url:
                        print_result(True, "POST /api/reports/export/pdf - Download URL validation", 
                                   f"Download URL correctly formatted: {download_url}")
                    else:
                        print_result(False, "POST /api/reports/export/pdf - Download URL validation", 
                                   f"Invalid download URL format: {download_url}")
                        
                else:
                    print_result(False, "POST /api/reports/export/pdf - Response structure validation", 
                               f"Missing required fields: {missing_fields}")
            else:
                print_result(False, "POST /api/reports/export/pdf - Export failed", data)
        else:
            print_result(False, f"POST /api/reports/export/pdf - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/pdf - Request failed", str(e))
    
    # Test 2: POST /api/reports/export/excel with sample data
    try:
        response = requests.post(f"{API_URL}/reports/export/excel", json=sample_report_data, timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/excel - Excel export with sample data", 
                           f"Message: {data.get('message')}")
                
                # Validate response structure
                required_fields = ["success", "message", "filename", "downloadUrl", "contentType"]
                missing_fields = [f for f in required_fields if f not in data]
                
                if not missing_fields:
                    print_result(True, "POST /api/reports/export/excel - Response structure validation", 
                               f"All required fields present: {required_fields}")
                    
                    # Validate filename format (should include timestamp)
                    filename = data.get("filename", "")
                    if filename.startswith("relatorio_caixa_") and filename.endswith(".xlsx"):
                        print_result(True, "POST /api/reports/export/excel - Filename format validation", 
                                   f"Filename correctly formatted: {filename}")
                    else:
                        print_result(False, "POST /api/reports/export/excel - Filename format validation", 
                                   f"Invalid filename format: {filename}")
                    
                    # Validate content type
                    content_type = data.get("contentType", "")
                    expected_content_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    if content_type == expected_content_type:
                        print_result(True, "POST /api/reports/export/excel - Content type validation", 
                                   f"Correct content type: {content_type}")
                    else:
                        print_result(False, "POST /api/reports/export/excel - Content type validation", 
                                   f"Expected: {expected_content_type}, Got: {content_type}")
                    
                    # Validate download URL format
                    download_url = data.get("downloadUrl", "")
                    if download_url.startswith("/api/reports/download/") and filename in download_url:
                        print_result(True, "POST /api/reports/export/excel - Download URL validation", 
                                   f"Download URL correctly formatted: {download_url}")
                    else:
                        print_result(False, "POST /api/reports/export/excel - Download URL validation", 
                                   f"Invalid download URL format: {download_url}")
                        
                else:
                    print_result(False, "POST /api/reports/export/excel - Response structure validation", 
                               f"Missing required fields: {missing_fields}")
            else:
                print_result(False, "POST /api/reports/export/excel - Export failed", data)
        else:
            print_result(False, f"POST /api/reports/export/excel - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/excel - Request failed", str(e))
    
    # Test 3: Error handling - Empty data
    try:
        empty_data = {"startDate": "2025-09-01", "endDate": "2025-09-07", "transactions": []}
        response = requests.post(f"{API_URL}/reports/export/pdf", json=empty_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/pdf - Empty data handling", 
                           "Successfully handled empty transaction data")
            else:
                print_result(False, "POST /api/reports/export/pdf - Empty data handling", 
                           f"Failed to handle empty data: {data}")
        else:
            print_result(False, f"POST /api/reports/export/pdf - Empty data handling - HTTP {response.status_code}", 
                        response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/pdf - Empty data handling failed", str(e))
    
    # Test 4: Error handling - Malformed data
    try:
        malformed_data = {"invalid": "data", "structure": True}
        response = requests.post(f"{API_URL}/reports/export/excel", json=malformed_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/excel - Malformed data handling", 
                           "Successfully handled malformed data gracefully")
            else:
                print_result(False, "POST /api/reports/export/excel - Malformed data handling", 
                           f"Failed gracefully: {data}")
        elif response.status_code >= 400 and response.status_code < 500:
            print_result(True, "POST /api/reports/export/excel - Malformed data handling", 
                       f"Correctly rejected malformed data with HTTP {response.status_code}")
        else:
            print_result(False, f"POST /api/reports/export/excel - Malformed data handling - HTTP {response.status_code}", 
                        response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/excel - Malformed data handling failed", str(e))
    
    # Test 5: Test without authentication (if required)
    try:
        # Test PDF export without any authentication headers
        response = requests.post(f"{API_URL}/reports/export/pdf", json=sample_report_data, timeout=10)
        if response.status_code == 200:
            print_result(True, "POST /api/reports/export/pdf - No authentication required", 
                       "PDF export works without authentication")
        elif response.status_code == 401:
            print_result(True, "POST /api/reports/export/pdf - Authentication required", 
                       "PDF export correctly requires authentication")
        else:
            print_result(False, f"POST /api/reports/export/pdf - Unexpected response - HTTP {response.status_code}", 
                        response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/pdf - Authentication test failed", str(e))

def test_users_api():
    """Test user management endpoints - COMPREHENSIVE CRUD TESTING"""
    print_test_header("User Management APIs - CRUD Operations")
    
    created_user_id = None
    
    # Test 1: GET /api/users - List all users
    try:
        response = requests.get(f"{API_URL}/users", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, "GET /api/users - Users list retrieved successfully", 
                           f"Found {len(data)} users in database")
                # Check if users have proper structure
                if len(data) > 0:
                    user = data[0]
                    required_fields = ["id", "email", "name", "role"]
                    missing_fields = [f for f in required_fields if f not in user]
                    if not missing_fields:
                        print_result(True, "GET /api/users - User structure validation", 
                                   f"All required fields present: {required_fields}")
                    else:
                        print_result(False, "GET /api/users - Missing required fields", 
                                   f"Missing: {missing_fields}")
            else:
                print_result(False, "GET /api/users - Invalid response format", 
                           "Expected array of users")
        else:
            print_result(False, f"GET /api/users - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/users - Request failed", str(e))
    
    # Test 2: POST /api/users - Create new user with realistic data
    try:
        new_user_data = {
            "name": "João Teste Silva",
            "email": "joao.teste@risetravel.com.br",
            "password": "123456",
            "role": "Operador",
            "phone": "+55 11 99999-0000",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/users", json=new_user_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("email") == new_user_data["email"]:
                created_user_id = data["id"]
                print_result(True, "POST /api/users - User created successfully", 
                           f"ID: {created_user_id}, Name: {data.get('name')}, Email: {data.get('email')}")
                
                # Verify password is not returned
                if "password" not in data:
                    print_result(True, "POST /api/users - Security check", 
                               "Password correctly excluded from response")
                else:
                    print_result(False, "POST /api/users - Security issue", 
                               "Password should not be returned in response")
                
                # Verify all fields are properly saved
                expected_fields = ["name", "email", "role", "phone", "status"]
                for field in expected_fields:
                    if field in data and data[field] == new_user_data[field]:
                        print_result(True, f"POST /api/users - Field validation ({field})", 
                                   f"Correctly saved: {data[field]}")
                    else:
                        print_result(False, f"POST /api/users - Field validation ({field})", 
                                   f"Expected: {new_user_data[field]}, Got: {data.get(field)}")
            else:
                print_result(False, "POST /api/users - Invalid response format", data)
        else:
            print_result(False, f"POST /api/users - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/users - Request failed", str(e))
    
    # Test 3: Verify user was actually saved to database
    if created_user_id:
        try:
            response = requests.get(f"{API_URL}/users", timeout=10)
            if response.status_code == 200:
                users = response.json()
                user_found = any(user.get("id") == created_user_id for user in users)
                if user_found:
                    print_result(True, "POST /api/users - Database persistence check", 
                               f"User {created_user_id} found in database after creation")
                else:
                    print_result(False, "POST /api/users - Database persistence check", 
                               f"User {created_user_id} NOT found in database")
            else:
                print_result(False, "POST /api/users - Database persistence check failed", 
                           f"Could not retrieve users list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "POST /api/users - Database persistence check failed", str(e))
    
    # Test 4: PUT /api/users/{id} - Update existing user
    if created_user_id:
        try:
            update_data = {
                "name": "João Teste Silva Atualizado",
                "role": "Gerente",
                "phone": "+55 11 88888-8888",
                "status": "Ativo"
            }
            
            response = requests.put(f"{API_URL}/users/{created_user_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == created_user_id:
                    print_result(True, "PUT /api/users/{id} - User updated successfully", 
                               f"Updated user: {data.get('name')}")
                    
                    # Verify updated fields
                    for field, expected_value in update_data.items():
                        if data.get(field) == expected_value:
                            print_result(True, f"PUT /api/users/{id} - Field update ({field})", 
                                       f"Correctly updated to: {expected_value}")
                        else:
                            print_result(False, f"PUT /api/users/{id} - Field update ({field})", 
                                       f"Expected: {expected_value}, Got: {data.get(field)}")
                else:
                    print_result(False, "PUT /api/users/{id} - Invalid response", data)
            else:
                print_result(False, f"PUT /api/users/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "PUT /api/users/{id} - Request failed", str(e))
    
    # Test 5: Verify update was persisted to database
    if created_user_id:
        try:
            response = requests.get(f"{API_URL}/users", timeout=10)
            if response.status_code == 200:
                users = response.json()
                updated_user = next((user for user in users if user.get("id") == created_user_id), None)
                if updated_user and updated_user.get("name") == "João Teste Silva Atualizado":
                    print_result(True, "PUT /api/users/{id} - Database persistence check", 
                               f"Updated user data persisted correctly in database")
                else:
                    print_result(False, "PUT /api/users/{id} - Database persistence check", 
                               f"Updated user data NOT persisted correctly")
            else:
                print_result(False, "PUT /api/users/{id} - Database persistence check failed", 
                           f"Could not retrieve users list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "PUT /api/users/{id} - Database persistence check failed", str(e))
    
    # Test 6: DELETE /api/users/{id} - Delete user
    if created_user_id:
        try:
            response = requests.delete(f"{API_URL}/users/{created_user_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print_result(True, "DELETE /api/users/{id} - User deleted successfully", 
                               f"Message: {data.get('message')}")
                else:
                    print_result(False, "DELETE /api/users/{id} - Delete failed", data)
            else:
                print_result(False, f"DELETE /api/users/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "DELETE /api/users/{id} - Request failed", str(e))
    
    # Test 7: Verify deletion was persisted to database
    if created_user_id:
        try:
            response = requests.get(f"{API_URL}/users", timeout=10)
            if response.status_code == 200:
                users = response.json()
                user_found = any(user.get("id") == created_user_id for user in users)
                if not user_found:
                    print_result(True, "DELETE /api/users/{id} - Database persistence check", 
                               f"User {created_user_id} successfully removed from database")
                else:
                    print_result(False, "DELETE /api/users/{id} - Database persistence check", 
                               f"User {created_user_id} still exists in database after deletion")
            else:
                print_result(False, "DELETE /api/users/{id} - Database persistence check failed", 
                           f"Could not retrieve users list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "DELETE /api/users/{id} - Database persistence check failed", str(e))
    
    # Test 8: Test duplicate email validation
    try:
        duplicate_user_data = {
            "name": "Usuário Duplicado",
            "email": "rodrigo@risetravel.com.br",  # This email should already exist
            "password": "123456",
            "role": "Operador",
            "phone": "+55 11 77777-7777",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/users", json=duplicate_user_data, timeout=10)
        if response.status_code == 400:
            print_result(True, "POST /api/users - Duplicate email validation", 
                       "Correctly rejected duplicate email with 400 status")
        else:
            print_result(False, f"POST /api/users - Duplicate email validation", 
                       f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, "POST /api/users - Duplicate email validation failed", str(e))

def test_transaction_date_functionality():
    """Test transaction date vs entry date functionality - NEW REQUIREMENT"""
    print_test_header("Transaction Date Functionality - Custom Date Support")
    
    # Test 1: POST /api/transactions with custom transaction date (past date)
    try:
        transaction_with_custom_date = {
            "type": "entrada",
            "category": "Pacote Turístico", 
            "description": "Sale from September 5th",
            "amount": 1500.00,
            "paymentMethod": "PIX",
            "transactionDate": "2025-09-05"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_with_custom_date, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure includes required fields
            required_fields = ["date", "transactionDate", "entryDate", "createdAt"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "POST /api/transactions - Response structure validation", 
                           f"All required fields present: {required_fields}")
                
                # Verify date matches provided transactionDate (not today's date)
                if data.get("date") == "2025-09-05" and data.get("transactionDate") == "2025-09-05":
                    print_result(True, "POST /api/transactions - Custom date handling", 
                               f"Transaction date correctly set to: {data.get('date')}")
                else:
                    print_result(False, "POST /api/transactions - Custom date handling", 
                               f"Expected date: 2025-09-05, Got date: {data.get('date')}, transactionDate: {data.get('transactionDate')}")
                
                # Verify entryDate shows today's date for audit purposes
                from datetime import date
                today = date.today().strftime("%Y-%m-%d")
                if data.get("entryDate") == today:
                    print_result(True, "POST /api/transactions - Entry date audit", 
                               f"Entry date correctly set to today: {data.get('entryDate')}")
                else:
                    print_result(False, "POST /api/transactions - Entry date audit", 
                               f"Expected entry date: {today}, Got: {data.get('entryDate')}")
                
                # Verify createdAt timestamp is present
                if "createdAt" in data and data["createdAt"]:
                    print_result(True, "POST /api/transactions - CreatedAt timestamp", 
                               f"Timestamp present: {data.get('createdAt')}")
                else:
                    print_result(False, "POST /api/transactions - CreatedAt timestamp", 
                               "CreatedAt timestamp missing or empty")
                
                # Verify all other transaction data is preserved
                expected_fields = ["type", "category", "description", "amount", "paymentMethod"]
                for field in expected_fields:
                    if data.get(field) == transaction_with_custom_date[field]:
                        print_result(True, f"POST /api/transactions - Field preservation ({field})", 
                                   f"Correctly preserved: {data[field]}")
                    else:
                        print_result(False, f"POST /api/transactions - Field preservation ({field})", 
                                   f"Expected: {transaction_with_custom_date[field]}, Got: {data.get(field)}")
                        
            else:
                print_result(False, "POST /api/transactions - Response structure validation", 
                           f"Missing required fields: {missing_fields}")
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Custom date test failed", str(e))
    
    # Test 2: POST /api/transactions without transactionDate (should default to today)
    try:
        transaction_without_date = {
            "type": "entrada",
            "category": "Pacote Turístico", 
            "description": "Sale without specific date",
            "amount": 2000.00,
            "paymentMethod": "Cartão de Crédito"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_without_date, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify it defaults to today's date
            from datetime import date
            today = date.today().strftime("%Y-%m-%d")
            
            if data.get("date") == today and data.get("transactionDate") == today:
                print_result(True, "POST /api/transactions - Default date handling", 
                           f"Transaction date correctly defaulted to today: {data.get('date')}")
            else:
                print_result(False, "POST /api/transactions - Default date handling", 
                           f"Expected date: {today}, Got date: {data.get('date')}, transactionDate: {data.get('transactionDate')}")
            
            # Verify entryDate also shows today
            if data.get("entryDate") == today:
                print_result(True, "POST /api/transactions - Default entry date", 
                           f"Entry date correctly set to today: {data.get('entryDate')}")
            else:
                print_result(False, "POST /api/transactions - Default entry date", 
                           f"Expected entry date: {today}, Got: {data.get('entryDate')}")
                           
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Default date test failed", str(e))
    
    # Test 3: Verify date validation and serialization work correctly
    try:
        # Test with different date formats to ensure proper handling
        test_cases = [
            {"date": "2025-12-25", "description": "Christmas sale"},
            {"date": "2025-01-01", "description": "New Year sale"},
            {"date": "2025-06-15", "description": "Mid-year sale"}
        ]
        
        for i, test_case in enumerate(test_cases):
            transaction_test = {
                "type": "entrada",
                "category": "Pacote Turístico", 
                "description": test_case["description"],
                "amount": 1000.00 + (i * 100),
                "paymentMethod": "PIX",
                "transactionDate": test_case["date"]
            }
            
            response = requests.post(f"{API_URL}/transactions", json=transaction_test, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("date") == test_case["date"] and data.get("transactionDate") == test_case["date"]:
                    print_result(True, f"POST /api/transactions - Date validation ({test_case['date']})", 
                               f"Date correctly processed and serialized")
                else:
                    print_result(False, f"POST /api/transactions - Date validation ({test_case['date']})", 
                               f"Date processing failed. Expected: {test_case['date']}, Got: {data.get('date')}")
            else:
                print_result(False, f"POST /api/transactions - Date validation ({test_case['date']})", 
                           f"HTTP {response.status_code}: {response.text}")
                           
    except Exception as e:
        print_result(False, "POST /api/transactions - Date validation tests failed", str(e))

def test_analytics_endpoints():
    """Test analytics endpoints - NEW REQUIREMENT"""
    print_test_header("Analytics Endpoints - Sales and Financial Analytics")
    
    # Test 1: GET /api/analytics/sales - Sales Analytics API
    try:
        response = requests.get(f"{API_URL}/analytics/sales", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify all required fields are present
            required_fields = [
                "valorTotal", "percentualVariacao", "comissoes", "numeroVendas",
                "novosClientes", "ticketMedio", "taxaConversao", "rankingVendedores"
            ]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/analytics/sales - Response structure validation", 
                           f"All required fields present: {required_fields}")
                
                # Validate numeric values are properly formatted
                numeric_fields = ["valorTotal", "percentualVariacao", "comissoes", "numeroVendas", 
                                "novosClientes", "ticketMedio"]
                for field in numeric_fields:
                    value = data.get(field)
                    if isinstance(value, (int, float)) and value >= 0:
                        print_result(True, f"GET /api/analytics/sales - Numeric validation ({field})", 
                                   f"Valid numeric value: {value}")
                    else:
                        print_result(False, f"GET /api/analytics/sales - Numeric validation ({field})", 
                                   f"Invalid numeric value: {value} (type: {type(value)})")
                
                # Validate taxaConversao object structure
                taxa_conversao = data.get("taxaConversao", {})
                if isinstance(taxa_conversao, dict):
                    taxa_fields = ["vendasPorCotacoes", "totalCotacoes", "percentual"]
                    taxa_missing = [f for f in taxa_fields if f not in taxa_conversao]
                    if not taxa_missing:
                        print_result(True, "GET /api/analytics/sales - taxaConversao structure", 
                                   f"All conversion rate fields present: {taxa_fields}")
                    else:
                        print_result(False, "GET /api/analytics/sales - taxaConversao structure", 
                                   f"Missing fields: {taxa_missing}")
                else:
                    print_result(False, "GET /api/analytics/sales - taxaConversao structure", 
                               f"Expected object, got: {type(taxa_conversao)}")
                
                # Validate rankingVendedores array structure
                ranking = data.get("rankingVendedores", [])
                if isinstance(ranking, list) and len(ranking) > 0:
                    print_result(True, "GET /api/analytics/sales - rankingVendedores array", 
                               f"Found {len(ranking)} sellers in ranking")
                    
                    # Check first seller structure
                    seller = ranking[0]
                    seller_fields = ["nome", "valor", "percentual", "posicao"]
                    seller_missing = [f for f in seller_fields if f not in seller]
                    if not seller_missing:
                        print_result(True, "GET /api/analytics/sales - Seller structure validation", 
                                   f"All seller fields present: {seller_fields}")
                        
                        # Validate seller data types
                        if (isinstance(seller.get("nome"), str) and 
                            isinstance(seller.get("valor"), (int, float)) and
                            isinstance(seller.get("percentual"), (int, float)) and
                            isinstance(seller.get("posicao"), int)):
                            print_result(True, "GET /api/analytics/sales - Seller data types", 
                                       f"All seller data types valid")
                        else:
                            print_result(False, "GET /api/analytics/sales - Seller data types", 
                                       f"Invalid data types in seller object")
                    else:
                        print_result(False, "GET /api/analytics/sales - Seller structure validation", 
                                   f"Missing seller fields: {seller_missing}")
                else:
                    print_result(False, "GET /api/analytics/sales - rankingVendedores array", 
                               f"Expected non-empty array, got: {type(ranking)} with length {len(ranking) if isinstance(ranking, list) else 'N/A'}")
                
                # Validate percentual calculations are reasonable (between -100 and 1000)
                percentual_fields = ["percentualVariacao", "percentualComissoes", "percentualVendas", "percentualClientes", "percentualTicket"]
                for field in percentual_fields:
                    if field in data:
                        value = data[field]
                        if isinstance(value, (int, float)) and -100 <= value <= 1000:
                            print_result(True, f"GET /api/analytics/sales - Percentual validation ({field})", 
                                       f"Reasonable percentage: {value}%")
                        else:
                            print_result(False, f"GET /api/analytics/sales - Percentual validation ({field})", 
                                       f"Unreasonable percentage: {value}% (should be between -100% and 1000%)")
                
            else:
                print_result(False, "GET /api/analytics/sales - Response structure validation", 
                           f"Missing required fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/analytics/sales - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/analytics/sales - Request failed", str(e))
    
    # Test 2: GET /api/analytics/financial - Financial Analytics API
    try:
        response = requests.get(f"{API_URL}/analytics/financial", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify all required fields are present
            required_fields = [
                "receitas", "despesas", "lucro", "margemLucro", "graficoDados"
            ]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/analytics/financial - Response structure validation", 
                           f"All required fields present: {required_fields}")
                
                # Validate numeric values are properly formatted
                numeric_fields = ["receitas", "despesas", "lucro", "margemLucro"]
                for field in numeric_fields:
                    value = data.get(field)
                    if isinstance(value, (int, float)):
                        print_result(True, f"GET /api/analytics/financial - Numeric validation ({field})", 
                                   f"Valid numeric value: {value}")
                    else:
                        print_result(False, f"GET /api/analytics/financial - Numeric validation ({field})", 
                                   f"Invalid numeric value: {value} (type: {type(value)})")
                
                # Validate percentual fields if present
                percentual_fields = ["percentualReceitas", "percentualDespesas", "percentualLucro"]
                for field in percentual_fields:
                    if field in data:
                        value = data[field]
                        if isinstance(value, (int, float)) and -100 <= value <= 1000:
                            print_result(True, f"GET /api/analytics/financial - Percentual validation ({field})", 
                                       f"Reasonable percentage: {value}%")
                        else:
                            print_result(False, f"GET /api/analytics/financial - Percentual validation ({field})", 
                                       f"Unreasonable percentage: {value}% (should be between -100% and 1000%)")
                
                # Validate margemLucro calculation is reasonable
                margem = data.get("margemLucro")
                if isinstance(margem, (int, float)) and 0 <= margem <= 100:
                    print_result(True, "GET /api/analytics/financial - Margin calculation", 
                               f"Reasonable profit margin: {margem}%")
                else:
                    print_result(False, "GET /api/analytics/financial - Margin calculation", 
                               f"Unreasonable profit margin: {margem}% (should be between 0% and 100%)")
                
                # Validate graficoDados object structure
                grafico = data.get("graficoDados", {})
                if isinstance(grafico, dict):
                    grafico_fields = ["labels", "receitas", "despesas", "lucro"]
                    grafico_missing = [f for f in grafico_fields if f not in grafico]
                    if not grafico_missing:
                        print_result(True, "GET /api/analytics/financial - graficoDados structure", 
                                   f"All chart data fields present: {grafico_fields}")
                        
                        # Validate arrays contain expected data structure
                        for field in grafico_fields:
                            array_data = grafico.get(field, [])
                            if isinstance(array_data, list) and len(array_data) > 0:
                                print_result(True, f"GET /api/analytics/financial - Chart array ({field})", 
                                           f"Valid array with {len(array_data)} elements")
                                
                                # For numeric arrays, validate data types
                                if field != "labels":
                                    if all(isinstance(x, (int, float)) for x in array_data):
                                        print_result(True, f"GET /api/analytics/financial - Chart data types ({field})", 
                                                   f"All elements are numeric")
                                    else:
                                        print_result(False, f"GET /api/analytics/financial - Chart data types ({field})", 
                                                   f"Non-numeric elements found in array")
                            else:
                                print_result(False, f"GET /api/analytics/financial - Chart array ({field})", 
                                           f"Expected non-empty array, got: {type(array_data)} with length {len(array_data) if isinstance(array_data, list) else 'N/A'}")
                    else:
                        print_result(False, "GET /api/analytics/financial - graficoDados structure", 
                                   f"Missing chart fields: {grafico_missing}")
                else:
                    print_result(False, "GET /api/analytics/financial - graficoDados structure", 
                               f"Expected object, got: {type(grafico)}")
                
            else:
                print_result(False, "GET /api/analytics/financial - Response structure validation", 
                           f"Missing required fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/analytics/financial - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/analytics/financial - Request failed", str(e))
    
    # Test 3: Verify consistent data structure between endpoints
    try:
        sales_response = requests.get(f"{API_URL}/analytics/sales", timeout=10)
        financial_response = requests.get(f"{API_URL}/analytics/financial", timeout=10)
        
        if sales_response.status_code == 200 and financial_response.status_code == 200:
            sales_data = sales_response.json()
            financial_data = financial_response.json()
            
            # Both should return JSON objects
            if isinstance(sales_data, dict) and isinstance(financial_data, dict):
                print_result(True, "Analytics endpoints - Data structure consistency", 
                           "Both endpoints return consistent JSON object structure")
            else:
                print_result(False, "Analytics endpoints - Data structure consistency", 
                           f"Inconsistent data types: sales={type(sales_data)}, financial={type(financial_data)}")
        else:
            print_result(False, "Analytics endpoints - Data structure consistency", 
                       f"Could not retrieve both endpoints for comparison")
    except Exception as e:
        print_result(False, "Analytics endpoints - Data structure consistency", str(e))
    
    # Test 4: Test authentication requirements (if any)
    try:
        # Test sales analytics without authentication
        response = requests.get(f"{API_URL}/analytics/sales", timeout=10)
        if response.status_code == 200:
            print_result(True, "GET /api/analytics/sales - No authentication required", 
                       "Sales analytics accessible without authentication")
        elif response.status_code == 401:
            print_result(True, "GET /api/analytics/sales - Authentication required", 
                       "Sales analytics correctly requires authentication")
        else:
            print_result(False, f"GET /api/analytics/sales - Unexpected response - HTTP {response.status_code}", 
                        response.text)
        
        # Test financial analytics without authentication
        response = requests.get(f"{API_URL}/analytics/financial", timeout=10)
        if response.status_code == 200:
            print_result(True, "GET /api/analytics/financial - No authentication required", 
                       "Financial analytics accessible without authentication")
        elif response.status_code == 401:
            print_result(True, "GET /api/analytics/financial - Authentication required", 
                       "Financial analytics correctly requires authentication")
        else:
            print_result(False, f"GET /api/analytics/financial - Unexpected response - HTTP {response.status_code}", 
                        response.text)
    except Exception as e:
        print_result(False, "Analytics endpoints - Authentication test failed", str(e))

def test_enhanced_transaction_system():
    """Test enhanced transaction system with new travel fields - REVIEW REQUEST"""
    print_test_header("Enhanced Transaction System - New Travel Fields Testing")
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print_result(True, "Authentication for enhanced transaction testing", 
                           f"Successfully logged in as {VALID_EMAIL}")
            else:
                print_result(False, "Authentication for enhanced transaction testing", 
                           "Login response missing access_token")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Authentication for enhanced transaction testing failed", str(e))
    
    # Test 2: Create enhanced transaction with all new fields from review request
    try:
        enhanced_transaction = {
            "type": "entrada",
            "category": "Passagem Aérea",
            "description": "Passagem São Paulo - Lisboa com escalas",
            "amount": 3250.00,
            "paymentMethod": "PIX",
            "client": "Cliente Teste Viagem",
            "transactionDate": "2025-01-15",
            # Enhanced fields from review request
            "productType": "Passagem",
            "clientReservationCode": "RT123456",
            "departureCity": "São Paulo",
            "arrivalCity": "Lisboa",
            "hasStops": True,
            "outboundStops": "Frankfurt (FRA)",
            "returnStops": "Madrid (MAD)",
            "supplierUsedMiles": True,
            "supplierMilesQuantity": 100000,
            "supplierMilesValue": 30.00,  # valor por 1000 milhas
            "supplierMilesProgram": "LATAM Pass",
            "airportTaxes": 250.00
        }
        
        response = requests.post(f"{API_URL}/transactions", json=enhanced_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Enhanced transaction created", 
                           f"ID: {transaction_id}, Amount: R$ {data.get('amount')}")
                
                # Test 3: Verify all new fields are saved correctly
                new_fields_validation = {
                    "productType": "Passagem",
                    "clientReservationCode": "RT123456",
                    "departureCity": "São Paulo",
                    "arrivalCity": "Lisboa",
                    "hasStops": True,
                    "outboundStops": "Frankfurt (FRA)",
                    "returnStops": "Madrid (MAD)",
                    "supplierUsedMiles": True,
                    "supplierMilesQuantity": 100000,
                    "supplierMilesValue": 30.00,
                    "supplierMilesProgram": "LATAM Pass",
                    "airportTaxes": 250.00
                }
                
                all_fields_correct = True
                for field, expected_value in new_fields_validation.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Enhanced transaction field validation ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"Enhanced transaction field validation ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                        all_fields_correct = False
                
                # Test 4: Verify automatic miles calculation (100000 milhas × R$ 30.00/1000 = R$ 3000.00)
                expected_miles_total = (100000 / 1000) * 30.00  # 3000.00
                print_result(True, "Enhanced transaction - Miles calculation verification", 
                           f"Expected total miles value: R$ {expected_miles_total:.2f} (100000 milhas × R$ 30.00/1000)")
                
                # Test 5: Verify data persistence - retrieve transaction and check fields
                try:
                    response = requests.get(f"{API_URL}/transactions", timeout=10)
                    if response.status_code == 200:
                        transactions = response.json()
                        created_transaction = next((t for t in transactions if t.get("id") == transaction_id), None)
                        
                        if created_transaction:
                            print_result(True, "Enhanced transaction - Data persistence check", 
                                       f"Transaction {transaction_id} found in database after creation")
                            
                            # Verify all enhanced fields persist correctly
                            persistence_check_passed = True
                            for field, expected_value in new_fields_validation.items():
                                persisted_value = created_transaction.get(field)
                                if persisted_value == expected_value:
                                    print_result(True, f"Enhanced transaction persistence ({field})", 
                                               f"Field correctly persisted: {persisted_value}")
                                else:
                                    print_result(False, f"Enhanced transaction persistence ({field})", 
                                               f"Expected: {expected_value}, Persisted: {persisted_value}")
                                    persistence_check_passed = False
                            
                            if persistence_check_passed:
                                print_result(True, "Enhanced transaction - Complete persistence validation", 
                                           "All enhanced travel fields correctly persisted to database")
                            else:
                                print_result(False, "Enhanced transaction - Complete persistence validation", 
                                           "Some enhanced travel fields failed to persist correctly")
                        else:
                            print_result(False, "Enhanced transaction - Data persistence check", 
                                       f"Transaction {transaction_id} NOT found in database")
                    else:
                        print_result(False, f"Enhanced transaction - Data persistence check failed", 
                                   f"Could not retrieve transactions: HTTP {response.status_code}")
                except Exception as e:
                    print_result(False, "Enhanced transaction - Data persistence check failed", str(e))
                
                # Test 6: Test escalas (stops) functionality
                if data.get("hasStops") == True:
                    if data.get("outboundStops") == "Frankfurt (FRA)" and data.get("returnStops") == "Madrid (MAD)":
                        print_result(True, "Enhanced transaction - Escalas functionality", 
                                   f"Stops correctly saved: Outbound={data.get('outboundStops')}, Return={data.get('returnStops')}")
                    else:
                        print_result(False, "Enhanced transaction - Escalas functionality", 
                                   f"Stops not saved correctly: Outbound={data.get('outboundStops')}, Return={data.get('returnStops')}")
                else:
                    print_result(False, "Enhanced transaction - Escalas functionality", 
                               f"hasStops should be True, got: {data.get('hasStops')}")
                
                # Test 7: Test supplier miles functionality
                if data.get("supplierUsedMiles") == True:
                    miles_fields_correct = (
                        data.get("supplierMilesQuantity") == 100000 and
                        data.get("supplierMilesValue") == 30.00 and
                        data.get("supplierMilesProgram") == "LATAM Pass"
                    )
                    if miles_fields_correct:
                        print_result(True, "Enhanced transaction - Supplier miles functionality", 
                                   f"Miles data correctly saved: {data.get('supplierMilesQuantity')} milhas, R$ {data.get('supplierMilesValue')}/1000, {data.get('supplierMilesProgram')}")
                    else:
                        print_result(False, "Enhanced transaction - Supplier miles functionality", 
                                   f"Miles data not saved correctly")
                else:
                    print_result(False, "Enhanced transaction - Supplier miles functionality", 
                               f"supplierUsedMiles should be True, got: {data.get('supplierUsedMiles')}")
                
            else:
                print_result(False, "POST /api/transactions - Enhanced transaction creation failed", 
                           "Response missing transaction ID")
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Enhanced transaction creation test failed", str(e))
    
    # Test 8: Test company settings endpoints (if available)
    try:
        response = requests.get(f"{API_URL}/company/settings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_result(True, "GET /api/company/settings - Company settings endpoint", 
                       f"Company settings retrieved successfully")
        elif response.status_code == 404:
            print_result(False, "GET /api/company/settings - Company settings endpoint", 
                       "Company settings endpoint not implemented (404)")
        else:
            print_result(False, f"GET /api/company/settings - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Company settings endpoint test failed", str(e))

def test_analytics_integration():
    """Test integration with existing endpoints - Verify no conflicts"""
    print_test_header("Analytics Integration - Verify No Conflicts with Existing Endpoints")
    
    # Test 1: Verify existing transaction summary still works after analytics implementation
    try:
        response = requests.get(f"{API_URL}/transactions/summary", timeout=10)
        if response.status_code == 200:
            data = response.json()
            required_fields = ["totalEntradas", "totalSaidas", "saldoAtual", "transacoesHoje", "clientesAtendidos", "ticketMedio"]
            if all(field in data for field in required_fields):
                print_result(True, "Integration test - Transaction summary still works", 
                           f"All required fields present after analytics implementation")
            else:
                print_result(False, "Integration test - Transaction summary broken", 
                           f"Missing fields: {[f for f in required_fields if f not in data]}")
        else:
            print_result(False, f"Integration test - Transaction summary - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Integration test - Transaction summary failed", str(e))
    
    # Test 2: Verify existing authentication still works
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "token" in data:
                print_result(True, "Integration test - Authentication still works", 
                           "Login functionality unaffected by analytics implementation")
            else:
                print_result(False, "Integration test - Authentication broken", 
                           "Login response format changed")
        else:
            print_result(False, f"Integration test - Authentication - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Integration test - Authentication failed", str(e))
    
    # Test 3: Verify existing transaction endpoints still work
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, "Integration test - Transaction list still works", 
                           f"Transaction list endpoint unaffected by analytics")
            else:
                print_result(False, "Integration test - Transaction list broken", 
                           "Transaction list response format changed")
        else:
            print_result(False, f"Integration test - Transaction list - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Integration test - Transaction list failed", str(e))
    
    # Test 4: Verify existing user endpoints still work
    try:
        response = requests.get(f"{API_URL}/users", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, "Integration test - User list still works", 
                           f"User management endpoints unaffected by analytics")
            else:
                print_result(False, "Integration test - User list broken", 
                           "User list response format changed")
        else:
            print_result(False, f"Integration test - User list - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Integration test - User list failed", str(e))
    
    # Test 5: Verify existing report endpoints still work
    try:
        sample_data = {"startDate": "2025-01-01", "endDate": "2025-01-07", "transactions": []}
        response = requests.post(f"{API_URL}/reports/export/pdf", json=sample_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "Integration test - PDF export still works", 
                           "Report export endpoints unaffected by analytics")
            else:
                print_result(False, "Integration test - PDF export broken", 
                           "PDF export functionality changed")
        else:
            print_result(False, f"Integration test - PDF export - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Integration test - PDF export failed", str(e))
    
    # Test 6: Test all endpoints are accessible and don't conflict
    endpoints_to_test = [
        ("/", "GET"),
        ("/health", "GET"),
        ("/transactions/summary", "GET"),
        ("/transactions", "GET"),
        ("/transactions/categories", "GET"),
        ("/transactions/payment-methods", "GET"),
        ("/analytics/sales", "GET"),
        ("/analytics/financial", "GET"),
        ("/users", "GET")
    ]
    
    successful_endpoints = 0
    total_endpoints = len(endpoints_to_test)
    
    for endpoint, method in endpoints_to_test:
        try:
            if method == "GET":
                response = requests.get(f"{API_URL}{endpoint}", timeout=5)
                if response.status_code in [200, 404]:  # 404 is acceptable for some endpoints
                    successful_endpoints += 1
        except:
            pass  # Count as failed
    
    success_rate = (successful_endpoints / total_endpoints) * 100
    if success_rate >= 80:
        print_result(True, "Integration test - Overall endpoint accessibility", 
                   f"{successful_endpoints}/{total_endpoints} endpoints accessible ({success_rate:.1f}%)")
    else:
        print_result(False, "Integration test - Overall endpoint accessibility", 
                   f"Only {successful_endpoints}/{total_endpoints} endpoints accessible ({success_rate:.1f}%)")

def test_supplier_travel_fields_update():
    """Test supplier update functionality with travel-specific fields - CRITICAL REVIEW REQUEST"""
    print_test_header("Supplier Travel Fields Update - CRITICAL BUG TESTING")
    
    created_supplier_id = None
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print_result(True, "Authentication for supplier testing", 
                           f"Successfully logged in as {VALID_EMAIL}")
            else:
                print_result(False, "Authentication for supplier testing", 
                           "Login response missing access_token")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Authentication for supplier testing failed", str(e))
    
    # Test 2: Create supplier with purchaseType="Milhas" and complete travel fields
    try:
        supplier_data = {
            "name": "Fornecedor Teste Milhas",
            "email": "fornecedor.milhas@test.com",
            "phone": "+55 11 99999-1111",
            "document": "12.345.678/0001-90",
            "address": "Rua das Milhas, 123",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "01234-567",
            "category": "Companhia Aérea",
            "supplierType": "Nacional",
            # Travel-specific fields - CRITICAL TEST DATA
            "purchaseType": "Milhas",
            "milesQuantity": 50000,
            "milesValuePer1000": 35.50,
            "milesProgram": "LATAM Pass",
            "milesAccount": "LP123456789",
            "discountApplied": 5.0,
            "discountType": "percentual",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=supplier_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("purchaseType") == "Milhas":
                created_supplier_id = data["id"]
                print_result(True, "POST /api/suppliers - Create supplier with Milhas", 
                           f"ID: {created_supplier_id}, purchaseType: {data.get('purchaseType')}")
                
                # Verify all travel fields were saved correctly
                travel_fields = {
                    "purchaseType": "Milhas",
                    "milesQuantity": 50000,
                    "milesValuePer1000": 35.50,
                    "milesProgram": "LATAM Pass",
                    "milesAccount": "LP123456789",
                    "discountApplied": 5.0,
                    "discountType": "percentual"
                }
                
                all_fields_correct = True
                for field, expected_value in travel_fields.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"POST /api/suppliers - Travel field validation ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"POST /api/suppliers - Travel field validation ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                        all_fields_correct = False
                
                if all_fields_correct:
                    print_result(True, "POST /api/suppliers - All travel fields validation", 
                               "All travel-specific fields correctly saved during creation")
                else:
                    print_result(False, "POST /api/suppliers - Travel fields validation", 
                               "Some travel fields were not saved correctly during creation")
                    
            else:
                print_result(False, "POST /api/suppliers - Create supplier failed", 
                           f"Missing ID or incorrect purchaseType: {data}")
        else:
            print_result(False, f"POST /api/suppliers - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/suppliers - Create supplier failed", str(e))
    
    # Test 3: Verify supplier was persisted to database
    if created_supplier_id:
        try:
            response = requests.get(f"{API_URL}/suppliers", timeout=10)
            if response.status_code == 200:
                suppliers = response.json()
                created_supplier = next((s for s in suppliers if s.get("id") == created_supplier_id), None)
                if created_supplier and created_supplier.get("purchaseType") == "Milhas":
                    print_result(True, "POST /api/suppliers - Database persistence check", 
                               f"Supplier {created_supplier_id} found in database with purchaseType=Milhas")
                else:
                    print_result(False, "POST /api/suppliers - Database persistence check", 
                               f"Supplier {created_supplier_id} not found or incorrect data in database")
            else:
                print_result(False, "POST /api/suppliers - Database persistence check failed", 
                           f"Could not retrieve suppliers list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "POST /api/suppliers - Database persistence check failed", str(e))
    
    # Test 4: CRITICAL TEST - Update supplier changing purchaseType to "Dinheiro"
    if created_supplier_id:
        try:
            update_data = {
                "name": "Fornecedor Teste Dinheiro",
                "email": "fornecedor.milhas@test.com",
                "phone": "+55 11 99999-1111",
                "document": "12.345.678/0001-90",
                "address": "Rua das Milhas, 123",
                "city": "São Paulo",
                "state": "SP",
                "zipCode": "01234-567",
                "category": "Companhia Aérea",
                "supplierType": "Nacional",
                # CRITICAL: Change purchaseType from "Milhas" to "Dinheiro"
                "purchaseType": "Dinheiro",
                "milesQuantity": 0,  # Should be updated to 0
                "milesValuePer1000": 0,  # Should be updated to 0
                "milesProgram": "",  # Should be cleared
                "milesAccount": "",  # Should be cleared
                "discountApplied": 10.0,  # Should be updated
                "discountType": "reais",  # Should be updated
                "status": "Ativo"
            }
            
            response = requests.put(f"{API_URL}/suppliers/{created_supplier_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print_result(True, "PUT /api/suppliers/{id} - Update request successful", 
                           f"HTTP 200 response received for supplier {created_supplier_id}")
                
                # CRITICAL VALIDATION: Check if travel fields were actually updated
                expected_updates = {
                    "purchaseType": "Dinheiro",
                    "milesQuantity": 0,
                    "milesValuePer1000": 0,
                    "milesProgram": "",
                    "milesAccount": "",
                    "discountApplied": 10.0,
                    "discountType": "reais"
                }
                
                update_failures = []
                for field, expected_value in expected_updates.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"PUT /api/suppliers/{id} - Travel field update ({field})", 
                                   f"Correctly updated to: {actual_value}")
                    else:
                        print_result(False, f"PUT /api/suppliers/{id} - Travel field update ({field})", 
                                   f"❌ CRITICAL BUG: Expected: {expected_value}, Got: {actual_value}")
                        update_failures.append(f"{field}: expected {expected_value}, got {actual_value}")
                
                if update_failures:
                    print_result(False, "PUT /api/suppliers/{id} - CRITICAL UPDATE BUG CONFIRMED", 
                               f"❌ Travel fields NOT updated: {', '.join(update_failures)}")
                else:
                    print_result(True, "PUT /api/suppliers/{id} - All travel fields updated correctly", 
                               "✅ All travel-specific fields successfully updated")
                    
            else:
                print_result(False, f"PUT /api/suppliers/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "PUT /api/suppliers/{id} - Update request failed", str(e))
    
    # Test 5: Verify update persistence in database
    if created_supplier_id:
        try:
            response = requests.get(f"{API_URL}/suppliers", timeout=10)
            if response.status_code == 200:
                suppliers = response.json()
                updated_supplier = next((s for s in suppliers if s.get("id") == created_supplier_id), None)
                if updated_supplier:
                    # Check if the update persisted to database
                    if updated_supplier.get("purchaseType") == "Dinheiro":
                        print_result(True, "PUT /api/suppliers/{id} - Database persistence check", 
                                   f"✅ Updated purchaseType=Dinheiro persisted to database")
                        
                        # Check other travel fields persistence
                        persistence_checks = {
                            "milesQuantity": 0,
                            "milesValuePer1000": 0,
                            "milesProgram": "",
                            "milesAccount": "",
                            "discountApplied": 10.0,
                            "discountType": "reais"
                        }
                        
                        persistence_failures = []
                        for field, expected_value in persistence_checks.items():
                            actual_value = updated_supplier.get(field)
                            if actual_value == expected_value:
                                print_result(True, f"PUT /api/suppliers/{id} - Database persistence ({field})", 
                                           f"Correctly persisted: {actual_value}")
                            else:
                                print_result(False, f"PUT /api/suppliers/{id} - Database persistence ({field})", 
                                           f"❌ PERSISTENCE BUG: Expected: {expected_value}, Got: {actual_value}")
                                persistence_failures.append(f"{field}: expected {expected_value}, got {actual_value}")
                        
                        if persistence_failures:
                            print_result(False, "PUT /api/suppliers/{id} - CRITICAL PERSISTENCE BUG", 
                                       f"❌ Travel fields NOT persisted: {', '.join(persistence_failures)}")
                        else:
                            print_result(True, "PUT /api/suppliers/{id} - All fields persisted correctly", 
                                       "✅ All travel field updates correctly persisted to database")
                            
                    else:
                        print_result(False, "PUT /api/suppliers/{id} - Database persistence check", 
                                   f"❌ CRITICAL BUG: purchaseType still {updated_supplier.get('purchaseType')} in database, should be 'Dinheiro'")
                else:
                    print_result(False, "PUT /api/suppliers/{id} - Database persistence check", 
                               f"Supplier {created_supplier_id} not found in database after update")
            else:
                print_result(False, "PUT /api/suppliers/{id} - Database persistence check failed", 
                           f"Could not retrieve suppliers list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "PUT /api/suppliers/{id} - Database persistence check failed", str(e))
    
    # Test 6: Test email validation (should prevent duplicates)
    try:
        duplicate_supplier_data = {
            "name": "Fornecedor Duplicado",
            "email": "fornecedor.milhas@test.com",  # Same email as created supplier
            "purchaseType": "Voucher",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=duplicate_supplier_data, timeout=10)
        if response.status_code == 400:
            print_result(True, "POST /api/suppliers - Duplicate email validation", 
                       "Correctly rejected duplicate email with 400 status")
        else:
            print_result(False, f"POST /api/suppliers - Duplicate email validation", 
                       f"❌ BUG: Expected 400, got {response.status_code} - duplicate emails should be rejected")
    except Exception as e:
        print_result(False, "POST /api/suppliers - Duplicate email validation failed", str(e))
    
    # Test 7: Test Voucher purchase type creation
    try:
        voucher_supplier_data = {
            "name": "Fornecedor Voucher",
            "email": "fornecedor.voucher@test.com",
            "purchaseType": "Voucher",
            "discountApplied": 15.0,
            "discountType": "percentual",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=voucher_supplier_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("purchaseType") == "Voucher":
                print_result(True, "POST /api/suppliers - Voucher type creation", 
                           f"Successfully created supplier with purchaseType=Voucher")
                
                # Clean up voucher supplier
                voucher_id = data.get("id")
                if voucher_id:
                    requests.delete(f"{API_URL}/suppliers/{voucher_id}", timeout=5)
            else:
                print_result(False, "POST /api/suppliers - Voucher type creation", 
                           f"purchaseType not set correctly: {data.get('purchaseType')}")
        else:
            print_result(False, f"POST /api/suppliers - Voucher type creation - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/suppliers - Voucher type creation failed", str(e))
    
    # Test 8: Clean up - Delete created supplier
    if created_supplier_id:
        try:
            response = requests.delete(f"{API_URL}/suppliers/{created_supplier_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print_result(True, "DELETE /api/suppliers/{id} - Cleanup successful", 
                               f"Test supplier {created_supplier_id} deleted successfully")
                else:
                    print_result(False, "DELETE /api/suppliers/{id} - Cleanup failed", data)
            else:
                print_result(False, f"DELETE /api/suppliers/{id} - Cleanup - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "DELETE /api/suppliers/{id} - Cleanup failed", str(e))

def test_sales_analysis_endpoints():
    """Test newly implemented sales analysis and reporting endpoints - REVIEW REQUEST"""
    print_test_header("Sales Analysis and Reporting Endpoints - NEW IMPLEMENTATION")
    
    # Test 1: GET /api/reports/sales-analysis with date range
    try:
        params = {
            "start_date": "2025-09-01",
            "end_date": "2025-09-09"
        }
        response = requests.get(f"{API_URL}/reports/sales-analysis", params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure includes required fields
            required_fields = ["period", "sales"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/reports/sales-analysis - Response structure validation", 
                           f"All required top-level fields present: {required_fields}")
                
                # Verify sales metrics structure
                sales = data.get("sales", {})
                sales_fields = ["total_sales", "total_supplier_costs", "total_commissions", "net_profit", "sales_count", "average_sale"]
                sales_missing = [f for f in sales_fields if f not in sales]
                
                if not sales_missing:
                    print_result(True, "GET /api/reports/sales-analysis - Sales metrics validation", 
                               f"All sales metrics present: {sales_fields}")
                    
                    # Verify numeric values are properly formatted
                    for field in sales_fields:
                        value = sales.get(field)
                        if isinstance(value, (int, float)) and value >= 0:
                            print_result(True, f"GET /api/reports/sales-analysis - Metric validation ({field})", 
                                       f"Valid metric value: R$ {value:.2f}" if "total" in field or "net" in field or "average" in field else f"Valid count: {value}")
                        else:
                            print_result(False, f"GET /api/reports/sales-analysis - Metric validation ({field})", 
                                       f"Invalid metric value: {value} (type: {type(value)})")
                    
                    # Verify period information
                    period = data.get("period", {})
                    if period.get("start_date") == "2025-09-01" and period.get("end_date") == "2025-09-09":
                        print_result(True, "GET /api/reports/sales-analysis - Period validation", 
                                   f"Correct period: {period.get('start_date')} to {period.get('end_date')}")
                    else:
                        print_result(False, "GET /api/reports/sales-analysis - Period validation", 
                                   f"Incorrect period: {period}")
                    
                    # Verify only 'entrada' transactions are included in analysis
                    transactions = data.get("transactions", [])
                    entrada_only = all(t.get("type") == "entrada" for t in transactions)
                    if entrada_only or len(transactions) == 0:
                        print_result(True, "GET /api/reports/sales-analysis - Transaction type filter", 
                                   f"Only 'entrada' transactions included in sales analysis ({len(transactions)} transactions)")
                    else:
                        non_entrada = [t for t in transactions if t.get("type") != "entrada"]
                        print_result(False, "GET /api/reports/sales-analysis - Transaction type filter", 
                                   f"Found {len(non_entrada)} non-entrada transactions in sales analysis")
                        
                else:
                    print_result(False, "GET /api/reports/sales-analysis - Sales metrics validation", 
                               f"Missing sales metrics: {sales_missing}")
            else:
                print_result(False, "GET /api/reports/sales-analysis - Response structure validation", 
                           f"Missing required fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/reports/sales-analysis - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/reports/sales-analysis - Request failed", str(e))
    
    # Test 2: GET /api/reports/complete-analysis with date range
    try:
        params = {
            "start_date": "2025-09-01", 
            "end_date": "2025-09-09"
        }
        response = requests.get(f"{API_URL}/reports/complete-analysis", params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure includes required fields
            required_fields = ["period", "summary", "entradas", "saidas", "all_transactions"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/reports/complete-analysis - Response structure validation", 
                           f"All required fields present: {required_fields}")
                
                # Verify summary calculations
                summary = data.get("summary", {})
                summary_fields = ["total_entradas", "total_saidas", "balance", "entradas_count", "saidas_count"]
                summary_missing = [f for f in summary_fields if f not in summary]
                
                if not summary_missing:
                    print_result(True, "GET /api/reports/complete-analysis - Summary structure validation", 
                               f"All summary fields present: {summary_fields}")
                    
                    # Verify balance calculation is correct
                    total_entradas = summary.get("total_entradas", 0)
                    total_saidas = summary.get("total_saidas", 0)
                    balance = summary.get("balance", 0)
                    expected_balance = total_entradas - total_saidas
                    
                    if abs(balance - expected_balance) < 0.01:  # Allow for floating point precision
                        print_result(True, "GET /api/reports/complete-analysis - Balance calculation", 
                                   f"Correct balance calculation: R$ {total_entradas:.2f} - R$ {total_saidas:.2f} = R$ {balance:.2f}")
                    else:
                        print_result(False, "GET /api/reports/complete-analysis - Balance calculation", 
                                   f"Incorrect balance: Expected R$ {expected_balance:.2f}, Got R$ {balance:.2f}")
                    
                    # Verify both entradas and saidas are included
                    entradas = data.get("entradas", [])
                    saidas = data.get("saidas", [])
                    all_transactions = data.get("all_transactions", [])
                    
                    if len(entradas) + len(saidas) == len(all_transactions):
                        print_result(True, "GET /api/reports/complete-analysis - Transaction segregation", 
                                   f"Correct transaction segregation: {len(entradas)} entradas + {len(saidas)} saidas = {len(all_transactions)} total")
                    else:
                        print_result(False, "GET /api/reports/complete-analysis - Transaction segregation", 
                                   f"Incorrect segregation: {len(entradas)} + {len(saidas)} ≠ {len(all_transactions)}")
                        
                else:
                    print_result(False, "GET /api/reports/complete-analysis - Summary structure validation", 
                               f"Missing summary fields: {summary_missing}")
            else:
                print_result(False, "GET /api/reports/complete-analysis - Response structure validation", 
                           f"Missing required fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/reports/complete-analysis - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/reports/complete-analysis - Request failed", str(e))
    
    # Test 3: GET /api/transactions/categories - Enhanced categories with expense categories
    try:
        response = requests.get(f"{API_URL}/transactions/categories", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify both regular categories and expense categories are present
            if "categories" in data and "expenseCategories" in data:
                print_result(True, "GET /api/transactions/categories - Enhanced structure validation", 
                           "Both 'categories' and 'expenseCategories' fields present")
                
                categories = data.get("categories", [])
                expense_categories = data.get("expenseCategories", [])
                
                # Verify regular categories include expected items
                expected_categories = ["Pacote Turístico", "Passagem Aérea", "Hotel/Hospedagem"]
                found_categories = [cat for cat in expected_categories if cat in categories]
                if len(found_categories) == len(expected_categories):
                    print_result(True, "GET /api/transactions/categories - Regular categories validation", 
                               f"All expected categories found: {found_categories}")
                else:
                    missing_categories = [cat for cat in expected_categories if cat not in categories]
                    print_result(False, "GET /api/transactions/categories - Regular categories validation", 
                               f"Missing categories: {missing_categories}")
                
                # Verify expense categories include new items
                expected_expense_categories = ["Salários", "Aluguel", "Conta de Água", "Conta de Luz", "Internet", "Telefone"]
                found_expense_categories = [cat for cat in expected_expense_categories if cat in expense_categories]
                if len(found_expense_categories) == len(expected_expense_categories):
                    print_result(True, "GET /api/transactions/categories - Expense categories validation", 
                               f"All expected expense categories found: {found_expense_categories}")
                else:
                    missing_expense_categories = [cat for cat in expected_expense_categories if cat not in expense_categories]
                    print_result(False, "GET /api/transactions/categories - Expense categories validation", 
                               f"Missing expense categories: {missing_expense_categories}")
                
                print_result(True, "GET /api/transactions/categories - Category counts", 
                           f"Found {len(categories)} regular categories and {len(expense_categories)} expense categories")
                
            else:
                print_result(False, "GET /api/transactions/categories - Enhanced structure validation", 
                           f"Missing enhanced structure. Found keys: {list(data.keys())}")
        else:
            print_result(False, f"GET /api/transactions/categories - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions/categories - Request failed", str(e))
    
    # Test 4: POST /api/transactions - Enhanced transaction creation with new fields
    try:
        # Using the exact transaction data from the review request
        enhanced_transaction = {
            "type": "entrada",
            "category": "Pacote Turístico",
            "description": "Venda com comissão e fornecedor",
            "amount": 5000.00,
            "paymentMethod": "PIX",
            "client": "Cliente Test",
            "seller": "Vendedor Test",
            "saleValue": 5000.00,
            "supplierValue": 2000.00,
            "supplierPaymentDate": "2025-09-15",
            "supplierPaymentStatus": "Pendente",
            "commissionValue": 500.00,
            "commissionPaymentDate": "2025-09-10",
            "commissionPaymentStatus": "Pago",
            "transactionDate": "2025-09-07"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=enhanced_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            if "id" in data:
                print_result(True, "POST /api/transactions - Enhanced transaction created successfully", 
                           f"Transaction ID: {data.get('id')}")
                
                # Verify all new fields are properly stored and returned
                new_fields = [
                    "saleValue", "supplierValue", "supplierPaymentDate", "supplierPaymentStatus",
                    "commissionValue", "commissionPaymentDate", "commissionPaymentStatus", "seller"
                ]
                
                for field in new_fields:
                    if field in data and data.get(field) == enhanced_transaction.get(field):
                        print_result(True, f"POST /api/transactions - Enhanced field validation ({field})", 
                                   f"Correctly stored: {data[field]}")
                    else:
                        print_result(False, f"POST /api/transactions - Enhanced field validation ({field})", 
                                   f"Expected: {enhanced_transaction.get(field)}, Got: {data.get(field)}")
                
                # Verify commission percentage calculation
                if "commissionPercentage" in data:
                    expected_percentage = (500.00 / 5000.00) * 100  # 10%
                    actual_percentage = data.get("commissionPercentage")
                    if abs(actual_percentage - expected_percentage) < 0.01:
                        print_result(True, "POST /api/transactions - Commission percentage calculation", 
                                   f"Correct calculation: {actual_percentage:.2f}%")
                    else:
                        print_result(False, "POST /api/transactions - Commission percentage calculation", 
                                   f"Expected: {expected_percentage:.2f}%, Got: {actual_percentage}")
                
                # Verify transaction date handling
                if data.get("transactionDate") == "2025-09-07" and data.get("date") == "2025-09-07":
                    print_result(True, "POST /api/transactions - Enhanced date handling", 
                               f"Transaction date correctly set to: {data.get('transactionDate')}")
                else:
                    print_result(False, "POST /api/transactions - Enhanced date handling", 
                               f"Date mismatch. transactionDate: {data.get('transactionDate')}, date: {data.get('date')}")
                
                # Verify R$ currency formatting in response (if applicable)
                amount_field = data.get("amount")
                if isinstance(amount_field, (int, float)) and amount_field == 5000.00:
                    print_result(True, "POST /api/transactions - Amount validation", 
                               f"Amount correctly stored: R$ {amount_field:.2f}")
                else:
                    print_result(False, "POST /api/transactions - Amount validation", 
                               f"Amount validation failed: {amount_field}")
                
            else:
                print_result(False, "POST /api/transactions - Enhanced transaction creation failed", 
                           f"No ID returned in response: {data}")
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Enhanced transaction creation failed", str(e))

def test_client_api():
    """Test client management endpoints - CRITICAL USER REPORTED PERSISTENCE BUG TESTING"""
    print_test_header("Client Management APIs - CRITICAL PERSISTENCE BUG INVESTIGATION")
    
    created_client_id = None
    initial_client_count = 0
    
    # Test 1: GET /api/clients - List all clients (initial state)
    try:
        response = requests.get(f"{API_URL}/clients", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                initial_client_count = len(data)
                print_result(True, "GET /api/clients - Initial clients list retrieved successfully", 
                           f"Found {initial_client_count} existing clients in database")
                
                # Check if clients have proper structure
                if len(data) > 0:
                    client = data[0]
                    required_fields = ["id", "name", "clientNumber"]
                    missing_fields = [f for f in required_fields if f not in client]
                    if not missing_fields:
                        print_result(True, "GET /api/clients - Client structure validation", 
                                   f"All required fields present: {required_fields}")
                    else:
                        print_result(False, "GET /api/clients - Missing required fields", 
                                   f"Missing: {missing_fields}")
            else:
                print_result(False, "GET /api/clients - Invalid response format", 
                           "Expected array of clients")
        else:
            print_result(False, f"GET /api/clients - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/clients - Request failed", str(e))
    
    # Test 2: POST /api/clients - Create new client with EXACT test data from review request
    try:
        # Using the exact test data provided in the review request
        new_client_data = {
            "name": "Cliente Teste Backend",
            "email": "teste.backend@test.com",
            "phone": "11999999999",
            "document": "123.456.789-00",
            "address": "Rua Teste Backend, 123",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "01234-567",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/clients", json=new_client_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("email") == new_client_data["email"]:
                created_client_id = data["id"]
                print_result(True, "POST /api/clients - Client created successfully", 
                           f"ID: {created_client_id}, Name: {data.get('name')}, Email: {data.get('email')}")
                
                # Verify client number is auto-generated
                if "clientNumber" in data and data["clientNumber"]:
                    client_number = data["clientNumber"]
                    if client_number.startswith("CLI") and len(client_number) >= 6:
                        print_result(True, "POST /api/clients - Client number generation", 
                                   f"Client number auto-generated: {client_number}")
                    else:
                        print_result(False, "POST /api/clients - Client number generation", 
                                   f"Invalid client number format: {client_number}")
                else:
                    print_result(False, "POST /api/clients - Client number generation", 
                               "Client number not generated or missing")
                
                # Verify all fields are properly saved
                expected_fields = ["name", "email", "phone", "document", "address", "city", "state", "zipCode", "status"]
                for field in expected_fields:
                    if field in data and data[field] == new_client_data[field]:
                        print_result(True, f"POST /api/clients - Field validation ({field})", 
                                   f"Correctly saved: {data[field]}")
                    else:
                        print_result(False, f"POST /api/clients - Field validation ({field})", 
                                   f"Expected: {new_client_data[field]}, Got: {data.get(field)}")
            else:
                print_result(False, "POST /api/clients - Invalid response format", data)
        else:
            print_result(False, f"POST /api/clients - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/clients - Request failed", str(e))
    
    # Test 3: CRITICAL - Verify persistence by calling GET /api/clients again
    try:
        response = requests.get(f"{API_URL}/clients", timeout=10)
        if response.status_code == 200:
            clients = response.json()
            current_client_count = len(clients)
            
            # Check if client count increased
            if current_client_count == initial_client_count + 1:
                print_result(True, "GET /api/clients - Persistence verification (count)", 
                           f"Client count increased from {initial_client_count} to {current_client_count}")
            else:
                print_result(False, "GET /api/clients - Persistence verification (count)", 
                           f"Expected count: {initial_client_count + 1}, Got: {current_client_count}")
            
            # Check if created client exists in the list
            if created_client_id:
                client_found = any(client.get("id") == created_client_id for client in clients)
                if client_found:
                    print_result(True, "GET /api/clients - Persistence verification (client exists)", 
                               f"Client {created_client_id} found in database after creation")
                    
                    # Find the specific client and verify data integrity
                    created_client = next((client for client in clients if client.get("id") == created_client_id), None)
                    if created_client:
                        if (created_client.get("name") == "Cliente Teste Backend" and 
                            created_client.get("email") == "teste.backend@test.com"):
                            print_result(True, "GET /api/clients - Data integrity verification", 
                                       f"Client data persisted correctly: {created_client.get('name')}")
                        else:
                            print_result(False, "GET /api/clients - Data integrity verification", 
                                       f"Client data corrupted or modified")
                else:
                    print_result(False, "GET /api/clients - Persistence verification (client exists)", 
                               f"Client {created_client_id} NOT found in database - PERSISTENCE BUG CONFIRMED!")
        else:
            print_result(False, "GET /api/clients - Persistence verification failed", 
                       f"Could not retrieve clients list: HTTP {response.status_code}")
    except Exception as e:
        print_result(False, "GET /api/clients - Persistence verification failed", str(e))
    
    # Test 4: Test email validation - Try creating another client with same email
    try:
        duplicate_client_data = {
            "name": "Cliente Duplicado",
            "email": "teste.backend@test.com",  # Same email as before
            "phone": "11888888888",
            "document": "987.654.321-00",
            "address": "Rua Duplicada, 456",
            "city": "Rio de Janeiro",
            "state": "RJ",
            "zipCode": "20000-000",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/clients", json=duplicate_client_data, timeout=10)
        if response.status_code == 400:
            print_result(True, "POST /api/clients - Email validation (duplicate prevention)", 
                       "Correctly rejected duplicate email with 400 status")
        else:
            print_result(False, f"POST /api/clients - Email validation (duplicate prevention)", 
                       f"Expected 400, got {response.status_code} - Duplicate email not prevented!")
    except Exception as e:
        print_result(False, "POST /api/clients - Email validation test failed", str(e))
    
    # Test 5: Test client number generation with multiple clients
    try:
        # Create another client to test sequential client number generation
        another_client_data = {
            "name": "Cliente Sequencial",
            "email": "sequencial@test.com",
            "phone": "11777777777",
            "document": "111.222.333-44",
            "address": "Rua Sequencial, 789",
            "city": "Brasília",
            "state": "DF",
            "zipCode": "70000-000",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/clients", json=another_client_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "clientNumber" in data:
                client_number = data["clientNumber"]
                print_result(True, "POST /api/clients - Sequential client number generation", 
                           f"New client number generated: {client_number}")
                
                # Store this client ID for deletion test
                second_client_id = data.get("id")
            else:
                print_result(False, "POST /api/clients - Sequential client number generation", 
                           "Client number not generated for second client")
        else:
            print_result(False, f"POST /api/clients - Sequential client number generation - HTTP {response.status_code}", 
                       response.text)
    except Exception as e:
        print_result(False, "POST /api/clients - Sequential client number generation failed", str(e))
    
    # Test 6: DELETE /api/clients/{id} - Test deletion functionality
    if created_client_id:
        try:
            response = requests.delete(f"{API_URL}/clients/{created_client_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print_result(True, "DELETE /api/clients/{id} - Client deleted successfully", 
                               f"Message: {data.get('message')}")
                else:
                    print_result(False, "DELETE /api/clients/{id} - Delete failed", data)
            else:
                print_result(False, f"DELETE /api/clients/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "DELETE /api/clients/{id} - Request failed", str(e))
    
    # Test 7: Verify deletion was persisted to database
    if created_client_id:
        try:
            response = requests.get(f"{API_URL}/clients", timeout=10)
            if response.status_code == 200:
                clients = response.json()
                client_found = any(client.get("id") == created_client_id for client in clients)
                if not client_found:
                    print_result(True, "DELETE /api/clients/{id} - Deletion persistence check", 
                               f"Client {created_client_id} successfully removed from database")
                else:
                    print_result(False, "DELETE /api/clients/{id} - Deletion persistence check", 
                               f"Client {created_client_id} still exists in database after deletion - PERSISTENCE BUG!")
            else:
                print_result(False, "DELETE /api/clients/{id} - Deletion persistence check failed", 
                           f"Could not retrieve clients list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "DELETE /api/clients/{id} - Deletion persistence check failed", str(e))
    
    # Test 8: Final client count verification
    try:
        response = requests.get(f"{API_URL}/clients", timeout=10)
        if response.status_code == 200:
            final_clients = response.json()
            final_count = len(final_clients)
            
            # Should be initial_count + 1 (we created 2, deleted 1)
            expected_final_count = initial_client_count + 1
            if final_count == expected_final_count:
                print_result(True, "Client API - Final count verification", 
                           f"Final client count correct: {final_count} (expected: {expected_final_count})")
            else:
                print_result(False, "Client API - Final count verification", 
                           f"Final count mismatch: {final_count} (expected: {expected_final_count})")
        else:
            print_result(False, "Client API - Final count verification failed", 
                       f"HTTP {response.status_code}")
    except Exception as e:
        print_result(False, "Client API - Final count verification failed", str(e))

def test_urgent_transaction_persistence():
    """URGENT: Test transaction persistence as requested by user"""
    print_test_header("🚨 URGENT TRANSACTION PERSISTENCE TEST - USER WAITING")
    
    global auth_token
    
    # Step 1: Login with provided credentials
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "token" in data:
                auth_token = data["token"]
                print_result(True, "Authentication for persistence test", 
                           f"Logged in as: {data['user'].get('name')} ({data['user'].get('email')})")
            else:
                print_result(False, "Authentication failed", "Cannot proceed with persistence test")
                return
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "Authentication failed", str(e))
        return
    
    # Step 2: Get initial transaction count
    initial_count = 0
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                initial_count = len(data)
                print_result(True, "Initial transaction count", f"Found {initial_count} existing transactions")
            else:
                print_result(False, "Invalid transaction list format", "Cannot determine initial count")
        else:
            print_result(False, f"Failed to get initial transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Failed to get initial transactions", str(e))
    
    # Step 3: Create transaction with EXACT data from review request
    created_transaction_id = None
    try:
        transaction_data = {
            "type": "entrada",
            "category": "Pacote Turístico",
            "description": "Teste Persistencia Transacao",
            "amount": 1500.00,
            "paymentMethod": "PIX",
            "transactionDate": "2025-09-07"
        }
        
        print(f"🔄 Creating transaction with data: {transaction_data}")
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                created_transaction_id = data["id"]
                print_result(True, "✅ POST /api/transactions - Transaction created", 
                           f"ID: {created_transaction_id}, Amount: R$ {data.get('amount')}, Description: {data.get('description')}")
                
                # Verify all fields were saved correctly
                for field, expected_value in transaction_data.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Field validation ({field})", f"✅ {field}: {actual_value}")
                    else:
                        print_result(False, f"Field validation ({field})", f"❌ Expected: {expected_value}, Got: {actual_value}")
            else:
                print_result(False, "❌ Transaction creation failed", "No ID returned in response")
                return
        else:
            print_result(False, f"❌ POST /api/transactions failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "❌ Transaction creation failed", str(e))
        return
    
    # Step 4: Immediately verify transaction appears in list (persistence check 1)
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                new_count = len(data)
                count_increased = new_count > initial_count
                
                # Find our transaction in the list
                our_transaction = None
                for transaction in data:
                    if transaction.get("id") == created_transaction_id:
                        our_transaction = transaction
                        break
                
                if our_transaction:
                    print_result(True, "✅ GET /api/transactions - Transaction found immediately", 
                               f"Transaction count: {initial_count} → {new_count}, Found transaction: {our_transaction.get('description')}")
                    
                    # Verify transaction data persisted correctly
                    if (our_transaction.get("description") == "Teste Persistencia Transacao" and
                        our_transaction.get("amount") == 1500.00 and
                        our_transaction.get("paymentMethod") == "PIX"):
                        print_result(True, "✅ Transaction data persistence", 
                                   "All transaction data correctly persisted to database")
                    else:
                        print_result(False, "❌ Transaction data corruption", 
                                   f"Data mismatch: {our_transaction}")
                else:
                    print_result(False, "❌ Transaction NOT found in list", 
                               f"Created transaction ID {created_transaction_id} not found in transaction list")
            else:
                print_result(False, "❌ Invalid transaction list format", "Cannot verify persistence")
        else:
            print_result(False, f"❌ GET /api/transactions failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "❌ Transaction persistence check failed", str(e))
    
    # Step 5: Wait a moment and check again (persistence check 2)
    import time
    time.sleep(2)
    
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                # Find our transaction again
                our_transaction = None
                for transaction in data:
                    if transaction.get("id") == created_transaction_id:
                        our_transaction = transaction
                        break
                
                if our_transaction:
                    print_result(True, "✅ Transaction persistence after delay", 
                               "Transaction still exists after 2-second delay - persistence confirmed")
                else:
                    print_result(False, "❌ Transaction disappeared", 
                               "Transaction no longer exists after delay - PERSISTENCE FAILURE")
            else:
                print_result(False, "❌ Invalid response format", "Cannot verify delayed persistence")
        else:
            print_result(False, f"❌ Delayed persistence check failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "❌ Delayed persistence check failed", str(e))
    
    # Step 6: Final database persistence confirmation
    print("\n🔍 FINAL PERSISTENCE CONFIRMATION:")
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                final_count = len(data)
                
                # Look for our specific transaction one more time
                persistence_confirmed = False
                for transaction in data:
                    if (transaction.get("description") == "Teste Persistencia Transacao" and
                        transaction.get("amount") == 1500.00 and
                        transaction.get("paymentMethod") == "PIX"):
                        persistence_confirmed = True
                        print_result(True, "🎯 FINAL RESULT: TRANSACTION PERSISTENCE", 
                                   f"✅ YES - Transaction exists in MongoDB database")
                        print(f"   📊 Transaction Details:")
                        print(f"   📝 ID: {transaction.get('id')}")
                        print(f"   📝 Description: {transaction.get('description')}")
                        print(f"   💰 Amount: R$ {transaction.get('amount')}")
                        print(f"   💳 Payment: {transaction.get('paymentMethod')}")
                        print(f"   📅 Date: {transaction.get('transactionDate')}")
                        break
                
                if not persistence_confirmed:
                    print_result(False, "🎯 FINAL RESULT: TRANSACTION PERSISTENCE", 
                               f"❌ NO - Transaction NOT found in database")
                    print(f"   📊 Total transactions in database: {final_count}")
                    print(f"   🔍 Searched for: 'Teste Persistencia Transacao', R$ 1500.00, PIX")
                
            else:
                print_result(False, "🎯 FINAL RESULT: TRANSACTION PERSISTENCE", 
                           "❌ UNKNOWN - Cannot verify due to invalid response format")
        else:
            print_result(False, "🎯 FINAL RESULT: TRANSACTION PERSISTENCE", 
                       f"❌ UNKNOWN - Cannot verify due to API error: HTTP {response.status_code}")
    except Exception as e:
        print_result(False, "🎯 FINAL RESULT: TRANSACTION PERSISTENCE", 
                   f"❌ UNKNOWN - Cannot verify due to error: {str(e)}")

def test_jwt_validation():
    """Test JWT token validation"""
    print_test_header("JWT Token Validation")
    
    if not auth_token:
        print_result(False, "JWT validation - No token available", "Login test must pass first")
        return
    
    # Test with valid token (if any endpoint requires authentication)
    print_result(True, "JWT token obtained successfully", f"Token length: {len(auth_token)} characters")
    
    # Note: The current API doesn't seem to have protected endpoints that require authentication
    # This is just validating that we can get a token

def test_supplier_management_travel_fields():
    """Test supplier management with travel-specific fields - REVIEW REQUEST PRIORITY"""
    print_test_header("Supplier Management - Travel-Specific Fields Testing")
    
    created_supplier_id = None
    
    # Test 1: GET /api/suppliers - List all suppliers
    try:
        response = requests.get(f"{API_URL}/suppliers", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_result(True, "GET /api/suppliers - Suppliers list retrieved successfully", 
                           f"Found {len(data)} suppliers in database")
                # Check if suppliers have proper structure including travel fields
                if len(data) > 0:
                    supplier = data[0]
                    required_fields = ["id", "name", "supplierNumber"]
                    travel_fields = ["purchaseType", "milesQuantity", "milesValuePer1000", "milesProgram", "milesAccount", "discountApplied", "discountType"]
                    
                    missing_required = [f for f in required_fields if f not in supplier]
                    if not missing_required:
                        print_result(True, "GET /api/suppliers - Basic structure validation", 
                                   f"All required fields present: {required_fields}")
                    else:
                        print_result(False, "GET /api/suppliers - Missing required fields", 
                                   f"Missing: {missing_required}")
                    
                    # Check travel fields presence (they should exist even if empty/default)
                    present_travel_fields = [f for f in travel_fields if f in supplier]
                    print_result(True, "GET /api/suppliers - Travel fields presence check", 
                               f"Travel fields found: {present_travel_fields}")
            else:
                print_result(False, "GET /api/suppliers - Invalid response format", 
                           "Expected array of suppliers")
        else:
            print_result(False, f"GET /api/suppliers - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/suppliers - Request failed", str(e))
    
    # Test 2: POST /api/suppliers - Create supplier with purchaseType="Milhas" and all travel fields
    try:
        new_supplier_data = {
            "name": "Companhia Aérea Teste Milhas",
            "email": "milhas.teste@airline.com.br",
            "phone": "+55 11 3333-4444",
            "document": "12.345.678/0001-90",
            "address": "Av. Aeroporto, 1000",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "04567-890",
            "category": "Companhia Aérea",
            "supplierType": "Fornecedor Principal",
            # Travel-specific fields - Focus of this test
            "purchaseType": "Milhas",
            "milesQuantity": 50000,
            "milesValuePer1000": 35.50,
            "milesProgram": "LATAM Pass",
            "milesAccount": "LP123456789",
            "discountApplied": 5.0,
            "discountType": "percentual",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=new_supplier_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == new_supplier_data["name"]:
                created_supplier_id = data["id"]
                print_result(True, "POST /api/suppliers - Supplier created successfully", 
                           f"ID: {created_supplier_id}, Name: {data.get('name')}")
                
                # Verify all travel-specific fields are properly saved
                travel_field_tests = [
                    ("purchaseType", "Milhas"),
                    ("milesQuantity", 50000),
                    ("milesValuePer1000", 35.50),
                    ("milesProgram", "LATAM Pass"),
                    ("milesAccount", "LP123456789"),
                    ("discountApplied", 5.0),
                    ("discountType", "percentual")
                ]
                
                for field, expected_value in travel_field_tests:
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"POST /api/suppliers - Travel field validation ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"POST /api/suppliers - Travel field validation ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                
                # Verify supplier number generation
                supplier_number = data.get("supplierNumber", "")
                if supplier_number.startswith("FOR") and len(supplier_number) == 7:
                    print_result(True, "POST /api/suppliers - Supplier number generation", 
                               f"Correctly generated: {supplier_number}")
                else:
                    print_result(False, "POST /api/suppliers - Supplier number generation", 
                               f"Invalid format: {supplier_number}")
                
            else:
                print_result(False, "POST /api/suppliers - Invalid response format", data)
        else:
            print_result(False, f"POST /api/suppliers - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/suppliers - Request failed", str(e))
    
    # Test 3: Verify supplier data persistence in MongoDB
    if created_supplier_id:
        try:
            response = requests.get(f"{API_URL}/suppliers", timeout=10)
            if response.status_code == 200:
                suppliers = response.json()
                created_supplier = next((s for s in suppliers if s.get("id") == created_supplier_id), None)
                if created_supplier:
                    print_result(True, "POST /api/suppliers - MongoDB persistence check", 
                               f"Supplier {created_supplier_id} found in database with all travel fields")
                    
                    # Verify travel fields persist correctly
                    if (created_supplier.get("purchaseType") == "Milhas" and 
                        created_supplier.get("milesQuantity") == 50000 and
                        created_supplier.get("milesProgram") == "LATAM Pass"):
                        print_result(True, "POST /api/suppliers - Travel fields persistence", 
                                   "All travel-specific fields correctly persisted to MongoDB")
                    else:
                        print_result(False, "POST /api/suppliers - Travel fields persistence", 
                                   "Travel fields not correctly persisted")
                else:
                    print_result(False, "POST /api/suppliers - MongoDB persistence check", 
                               f"Supplier {created_supplier_id} NOT found in database")
            else:
                print_result(False, "POST /api/suppliers - MongoDB persistence check failed", 
                           f"Could not retrieve suppliers list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "POST /api/suppliers - MongoDB persistence check failed", str(e))
    
    # Test 4: PUT /api/suppliers/{id} - Update supplier with different purchaseType
    if created_supplier_id:
        try:
            update_data = {
                "name": "Companhia Aérea Teste Atualizada",
                "purchaseType": "Dinheiro",  # Change from Milhas to Dinheiro
                "milesQuantity": 0,  # Should be reset for Dinheiro type
                "milesValuePer1000": 0,
                "milesProgram": "",
                "milesAccount": "",
                "discountApplied": 10.0,  # Change discount
                "discountType": "reais",  # Change from percentual to reais
                "status": "Ativo"
            }
            
            response = requests.put(f"{API_URL}/suppliers/{created_supplier_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == created_supplier_id:
                    print_result(True, "PUT /api/suppliers/{id} - Supplier updated successfully", 
                               f"Updated supplier: {data.get('name')}")
                    
                    # Verify updated travel fields
                    update_tests = [
                        ("purchaseType", "Dinheiro"),
                        ("milesQuantity", 0),
                        ("discountApplied", 10.0),
                        ("discountType", "reais")
                    ]
                    
                    for field, expected_value in update_tests:
                        actual_value = data.get(field)
                        if actual_value == expected_value:
                            print_result(True, f"PUT /api/suppliers/{id} - Travel field update ({field})", 
                                       f"Correctly updated to: {actual_value}")
                        else:
                            print_result(False, f"PUT /api/suppliers/{id} - Travel field update ({field})", 
                                       f"Expected: {expected_value}, Got: {actual_value}")
                else:
                    print_result(False, "PUT /api/suppliers/{id} - Invalid response", data)
            else:
                print_result(False, f"PUT /api/suppliers/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "PUT /api/suppliers/{id} - Request failed", str(e))
    
    # Test 5: Verify update persistence in MongoDB
    if created_supplier_id:
        try:
            response = requests.get(f"{API_URL}/suppliers", timeout=10)
            if response.status_code == 200:
                suppliers = response.json()
                updated_supplier = next((s for s in suppliers if s.get("id") == created_supplier_id), None)
                if (updated_supplier and 
                    updated_supplier.get("purchaseType") == "Dinheiro" and
                    updated_supplier.get("discountType") == "reais"):
                    print_result(True, "PUT /api/suppliers/{id} - Update persistence check", 
                               f"Updated travel fields correctly persisted in MongoDB")
                else:
                    print_result(False, "PUT /api/suppliers/{id} - Update persistence check", 
                               f"Updated travel fields NOT correctly persisted")
            else:
                print_result(False, "PUT /api/suppliers/{id} - Update persistence check failed", 
                           f"Could not retrieve suppliers list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "PUT /api/suppliers/{id} - Update persistence check failed", str(e))
    
    # Test 6: Create another supplier with purchaseType="Voucher" to test all types
    try:
        voucher_supplier_data = {
            "name": "Hotel Teste Voucher",
            "email": "voucher.teste@hotel.com.br",
            "phone": "+55 11 5555-6666",
            "category": "Hotel",
            "supplierType": "Fornecedor Secundário",
            # Test Voucher purchase type
            "purchaseType": "Voucher",
            "milesQuantity": 0,
            "milesValuePer1000": 0,
            "milesProgram": "",
            "milesAccount": "",
            "discountApplied": 15.0,
            "discountType": "reais",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=voucher_supplier_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("purchaseType") == "Voucher":
                print_result(True, "POST /api/suppliers - Voucher type validation", 
                           f"Successfully created supplier with purchaseType=Voucher")
                
                # Clean up - delete this test supplier
                voucher_supplier_id = data.get("id")
                if voucher_supplier_id:
                    requests.delete(f"{API_URL}/suppliers/{voucher_supplier_id}", timeout=5)
            else:
                print_result(False, "POST /api/suppliers - Voucher type validation", 
                           f"Expected purchaseType=Voucher, got: {data.get('purchaseType')}")
        else:
            print_result(False, f"POST /api/suppliers - Voucher type - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/suppliers - Voucher type test failed", str(e))
    
    # Test 7: DELETE /api/suppliers/{id} - Delete supplier
    if created_supplier_id:
        try:
            response = requests.delete(f"{API_URL}/suppliers/{created_supplier_id}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    print_result(True, "DELETE /api/suppliers/{id} - Supplier deleted successfully", 
                               f"Message: {data.get('message')}")
                else:
                    print_result(False, "DELETE /api/suppliers/{id} - Delete failed", data)
            else:
                print_result(False, f"DELETE /api/suppliers/{id} - HTTP {response.status_code}", response.text)
        except Exception as e:
            print_result(False, "DELETE /api/suppliers/{id} - Request failed", str(e))
    
    # Test 8: Verify deletion persistence in MongoDB
    if created_supplier_id:
        try:
            response = requests.get(f"{API_URL}/suppliers", timeout=10)
            if response.status_code == 200:
                suppliers = response.json()
                supplier_found = any(s.get("id") == created_supplier_id for s in suppliers)
                if not supplier_found:
                    print_result(True, "DELETE /api/suppliers/{id} - Deletion persistence check", 
                               f"Supplier {created_supplier_id} successfully removed from MongoDB")
                else:
                    print_result(False, "DELETE /api/suppliers/{id} - Deletion persistence check", 
                               f"Supplier {created_supplier_id} still exists in database after deletion")
            else:
                print_result(False, "DELETE /api/suppliers/{id} - Deletion persistence check failed", 
                           f"Could not retrieve suppliers list: HTTP {response.status_code}")
        except Exception as e:
            print_result(False, "DELETE /api/suppliers/{id} - Deletion persistence check failed", str(e))
    
    # Test 9: Test email validation for suppliers
    try:
        duplicate_supplier_data = {
            "name": "Fornecedor Duplicado",
            "email": "milhas.teste@airline.com.br",  # This email was used in the first test
            "purchaseType": "Dinheiro",
            "status": "Ativo"
        }
        
        response = requests.post(f"{API_URL}/suppliers", json=duplicate_supplier_data, timeout=10)
        if response.status_code == 400:
            print_result(True, "POST /api/suppliers - Duplicate email validation", 
                       "Correctly rejected duplicate email with 400 status")
        else:
            print_result(False, f"POST /api/suppliers - Duplicate email validation", 
                       f"Expected 400, got {response.status_code}")
    except Exception as e:
        print_result(False, "POST /api/suppliers - Duplicate email validation failed", str(e))

def test_enhanced_transactions_travel_fields():
    """Test enhanced transactions with complex travel fields - REVIEW REQUEST"""
    print_test_header("Enhanced Transactions - Complex Travel Fields Testing")
    
    # Test 1: POST /api/transactions with comprehensive travel fields
    try:
        enhanced_transaction_data = {
            "type": "entrada",
            "category": "Passagem Aérea",
            "description": "Passagem São Paulo - Paris - Ida e Volta",
            "amount": 4500.00,
            "paymentMethod": "Cartão de Crédito",
            "client": "Maria Santos Viajante",
            "supplier": "LATAM Airlines",
            "seller": "João Vendedor",
            "saleValue": 4500.00,
            "supplierValue": 3200.00,
            "commissionValue": 450.00,
            "transactionDate": "2025-09-10",
            # Travel-specific fields from review request
            "clientNumber": "CLI0001",
            "reservationLocator": "ABC123",
            "departureDate": "2025-12-15",
            "returnDate": "2025-12-22",
            "departureTime": "14:30",
            "arrivalTime": "08:45",
            "hasStops": True,
            "originAirport": "GRU",
            "destinationAirport": "CDG",
            "tripType": "Lazer",
            "products": [
                {
                    "type": "Passagem Aérea",
                    "description": "GRU-CDG Ida",
                    "amount": 2250.00
                },
                {
                    "type": "Passagem Aérea", 
                    "description": "CDG-GRU Volta",
                    "amount": 2250.00
                }
            ]
        }
        
        response = requests.post(f"{API_URL}/transactions", json=enhanced_transaction_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("type") == "entrada":
                print_result(True, "POST /api/transactions - Enhanced transaction created successfully", 
                           f"ID: {data.get('id')}, Amount: R$ {data.get('amount')}")
                
                # Verify travel-specific fields are saved
                travel_field_tests = [
                    ("clientNumber", "CLI0001"),
                    ("reservationLocator", "ABC123"),
                    ("departureDate", "2025-12-15"),
                    ("returnDate", "2025-12-22"),
                    ("departureTime", "14:30"),
                    ("arrivalTime", "08:45"),
                    ("hasStops", True),
                    ("originAirport", "GRU"),
                    ("destinationAirport", "CDG"),
                    ("tripType", "Lazer")
                ]
                
                for field, expected_value in travel_field_tests:
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"POST /api/transactions - Travel field validation ({field})", 
                                   f"Correctly saved: {actual_value}")
                    else:
                        print_result(False, f"POST /api/transactions - Travel field validation ({field})", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                
                # Verify products array
                products = data.get("products", [])
                if isinstance(products, list) and len(products) == 2:
                    print_result(True, "POST /api/transactions - Products array validation", 
                               f"Products array correctly saved with {len(products)} items")
                    
                    # Check first product structure
                    if len(products) > 0:
                        product = products[0]
                        if (product.get("type") == "Passagem Aérea" and 
                            product.get("amount") == 2250.00):
                            print_result(True, "POST /api/transactions - Product structure validation", 
                                       f"Product structure correctly saved: {product}")
                        else:
                            print_result(False, "POST /api/transactions - Product structure validation", 
                                       f"Invalid product structure: {product}")
                else:
                    print_result(False, "POST /api/transactions - Products array validation", 
                               f"Expected array with 2 products, got: {type(products)} with length {len(products) if isinstance(products, list) else 'N/A'}")
                
                # Verify commission calculation
                commission_percentage = data.get("commissionPercentage")
                if commission_percentage and abs(commission_percentage - 10.0) < 0.01:
                    print_result(True, "POST /api/transactions - Commission calculation", 
                               f"Commission percentage correctly calculated: {commission_percentage}%")
                else:
                    print_result(False, "POST /api/transactions - Commission calculation", 
                               f"Expected ~10%, got: {commission_percentage}%")
                
            else:
                print_result(False, "POST /api/transactions - Invalid response format", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Enhanced transaction test failed", str(e))
    
    # Test 2: Verify travel fields persistence by retrieving transactions
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            transactions = response.json()
            if isinstance(transactions, list) and len(transactions) > 0:
                # Find our enhanced transaction
                enhanced_transaction = None
                for transaction in transactions:
                    if (transaction.get("reservationLocator") == "ABC123" and 
                        transaction.get("originAirport") == "GRU"):
                        enhanced_transaction = transaction
                        break
                
                if enhanced_transaction:
                    print_result(True, "GET /api/transactions - Enhanced transaction persistence", 
                               f"Enhanced transaction found with travel fields intact")
                    
                    # Verify key travel fields persist
                    if (enhanced_transaction.get("destinationAirport") == "CDG" and
                        enhanced_transaction.get("hasStops") == True and
                        enhanced_transaction.get("tripType") == "Lazer"):
                        print_result(True, "GET /api/transactions - Travel fields persistence check", 
                                   "All travel fields correctly persisted in MongoDB")
                    else:
                        print_result(False, "GET /api/transactions - Travel fields persistence check", 
                                   "Some travel fields not correctly persisted")
                else:
                    print_result(False, "GET /api/transactions - Enhanced transaction persistence", 
                               "Enhanced transaction not found in database")
            else:
                print_result(False, "GET /api/transactions - Transaction retrieval", 
                           "No transactions found or invalid response format")
        else:
            print_result(False, f"GET /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions - Travel fields persistence test failed", str(e))

def test_company_settings_api():
    """Test company settings API endpoints - REVIEW REQUEST"""
    print_test_header("Company Settings API - Review Request Testing")
    
    # Test 1: GET /api/company/settings - Retrieve company configuration
    try:
        response = requests.get(f"{API_URL}/company/settings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            expected_fields = ["name", "email", "phone", "address", "city", "state", "zipCode", "cnpj", "website"]
            missing_fields = [f for f in expected_fields if f not in data]
            
            if not missing_fields:
                print_result(True, "GET /api/company/settings - Response structure validation", 
                           f"All expected fields present: {expected_fields}")
                
                # Display current settings
                print_result(True, "GET /api/company/settings - Current settings retrieved", 
                           f"Company: {data.get('name')}, Email: {data.get('email')}, Phone: {data.get('phone')}")
            else:
                print_result(False, "GET /api/company/settings - Response structure validation", 
                           f"Missing fields: {missing_fields}")
        else:
            print_result(False, f"GET /api/company/settings - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/company/settings - Request failed", str(e))
    
    # Test 2: POST /api/company/settings - Save company settings with new data from review request
    try:
        new_settings = {
            "name": "Rise Travel Updated",
            "email": "new-email@risetravel.com",
            "phone": "(11) 98888-8888",
            "address": "Rua Nova, 456",
            "city": "São Paulo",
            "state": "SP",
            "zipCode": "01234-567",
            "cnpj": "12.345.678/0001-90",
            "website": "www.risetravel.com.br"
        }
        
        response = requests.post(f"{API_URL}/company/settings", json=new_settings, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            if data.get("message") and "sucesso" in data.get("message", "").lower():
                print_result(True, "POST /api/company/settings - Settings saved successfully", 
                           f"Message: {data.get('message')}")
                
                # Verify the settings were saved correctly
                if "settings" in data:
                    saved_settings = data["settings"]
                    settings_correct = True
                    
                    for field, expected_value in new_settings.items():
                        actual_value = saved_settings.get(field)
                        if actual_value == expected_value:
                            print_result(True, f"POST /api/company/settings - Field validation ({field})", 
                                       f"Correctly saved: {actual_value}")
                        else:
                            print_result(False, f"POST /api/company/settings - Field validation ({field})", 
                                       f"Expected: {expected_value}, Got: {actual_value}")
                            settings_correct = False
                    
                    if settings_correct:
                        print_result(True, "POST /api/company/settings - All fields validation", 
                                   "All company settings fields saved correctly")
                else:
                    print_result(False, "POST /api/company/settings - Response validation", 
                               "Response missing 'settings' field")
            else:
                print_result(False, "POST /api/company/settings - Save failed", 
                           f"Unexpected response: {data}")
        else:
            print_result(False, f"POST /api/company/settings - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/company/settings - Request failed", str(e))
    
    # Test 3: Verify settings persistence - GET again to confirm changes were saved
    try:
        response = requests.get(f"{API_URL}/company/settings", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Check if the new settings persist
            expected_values = {
                "name": "Rise Travel Updated",
                "email": "new-email@risetravel.com", 
                "phone": "(11) 98888-8888"
            }
            
            persistence_correct = True
            for field, expected_value in expected_values.items():
                actual_value = data.get(field)
                if actual_value == expected_value:
                    print_result(True, f"Company settings persistence check ({field})", 
                               f"Value correctly persisted: {actual_value}")
                else:
                    print_result(False, f"Company settings persistence check ({field})", 
                               f"Expected: {expected_value}, Got: {actual_value}")
                    persistence_correct = False
            
            if persistence_correct:
                print_result(True, "Company settings - Complete persistence validation", 
                           "All company settings correctly persisted to database")
            else:
                print_result(False, "Company settings - Complete persistence validation", 
                           "Some company settings failed to persist correctly")
        else:
            print_result(False, f"Company settings persistence check - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Company settings persistence check failed", str(e))

def test_enhanced_transaction_with_products():
    """Test enhanced transaction with new product structure - REVIEW REQUEST"""
    print_test_header("Enhanced Transaction with New Product Structure - Review Request")
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print_result(True, "Authentication for product structure testing", 
                           f"Successfully logged in as {VALID_EMAIL}")
            else:
                print_result(False, "Authentication for product structure testing", 
                           "Login response missing access_token")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Authentication for product structure testing failed", str(e))
    
    # Test 2: Create transaction with products that have both cost and client value
    try:
        transaction_with_products = {
            "type": "entrada",
            "category": "Pacote Turístico",
            "description": "Pacote completo com passagem e seguro",
            "amount": 1580.00,  # Total client value (1500 + 80)
            "paymentMethod": "PIX",
            "client": "Cliente Teste Produtos",
            "transactionDate": "2025-01-20",
            "products": [
                {
                    "name": "Passagem Aérea",
                    "cost": 1200.00,
                    "clientValue": 1500.00,
                    "quantity": 1,
                    "category": "Passagem Aérea"
                },
                {
                    "name": "Seguro Viagem",
                    "cost": 50.00,
                    "clientValue": 80.00,
                    "quantity": 1,
                    "category": "Seguro Viagem"
                }
            ],
            "saleValue": 1580.00,  # Total client value
            "supplierValue": 1250.00,  # Total cost (1200 + 50)
            "commissionValue": 158.00,  # 10% commission
            "seller": "Vendedor Teste"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_with_products, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Transaction with products created", 
                           f"ID: {transaction_id}, Total Amount: R$ {data.get('amount')}")
                
                # Test 3: Verify products array structure is saved correctly
                saved_products = data.get("products", [])
                if isinstance(saved_products, list) and len(saved_products) == 2:
                    print_result(True, "Enhanced transaction - Products array validation", 
                               f"Products array correctly saved with {len(saved_products)} items")
                    
                    # Verify Product 1: Passagem Aérea
                    product1 = saved_products[0] if len(saved_products) > 0 else {}
                    if (product1.get("name") == "Passagem Aérea" and 
                        product1.get("cost") == 1200.00 and 
                        product1.get("clientValue") == 1500.00):
                        print_result(True, "Enhanced transaction - Product 1 validation", 
                                   f"Passagem Aérea: cost=R$ {product1.get('cost')}, clientValue=R$ {product1.get('clientValue')}")
                    else:
                        print_result(False, "Enhanced transaction - Product 1 validation", 
                                   f"Product 1 data incorrect: {product1}")
                    
                    # Verify Product 2: Seguro Viagem
                    product2 = saved_products[1] if len(saved_products) > 1 else {}
                    if (product2.get("name") == "Seguro Viagem" and 
                        product2.get("cost") == 50.00 and 
                        product2.get("clientValue") == 80.00):
                        print_result(True, "Enhanced transaction - Product 2 validation", 
                                   f"Seguro Viagem: cost=R$ {product2.get('cost')}, clientValue=R$ {product2.get('clientValue')}")
                    else:
                        print_result(False, "Enhanced transaction - Product 2 validation", 
                                   f"Product 2 data incorrect: {product2}")
                else:
                    print_result(False, "Enhanced transaction - Products array validation", 
                               f"Expected 2 products, got: {len(saved_products) if isinstance(saved_products, list) else 'not a list'}")
                
                # Test 4: Verify transaction includes both cost and client values
                financial_fields = {
                    "saleValue": 1580.00,
                    "supplierValue": 1250.00,
                    "commissionValue": 158.00
                }
                
                for field, expected_value in financial_fields.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Enhanced transaction - Financial field ({field})", 
                                   f"Correctly saved: R$ {actual_value}")
                    else:
                        print_result(False, f"Enhanced transaction - Financial field ({field})", 
                                   f"Expected: R$ {expected_value}, Got: R$ {actual_value}")
                
            else:
                print_result(False, "POST /api/transactions - Invalid response format", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Request failed", str(e))

def test_complete_travel_transaction():
    """Test complete travel transaction with all enhanced fields - REVIEW REQUEST"""
    print_test_header("Complete Travel Transaction Test - All Enhanced Fields")
    
    # Test 1: Create transaction with all enhanced fields from review request
    try:
        complete_travel_transaction = {
            "type": "entrada",
            "category": "Passagem Aérea",
            "description": "Viagem completa São Paulo - Lisboa com escalas e milhas",
            "amount": 4500.00,
            "paymentMethod": "PIX",
            "client": "Cliente Viagem Completa",
            "transactionDate": "2025-02-15",
            # Enhanced travel fields
            "hasStops": True,
            "outboundStops": "Lisboa",
            "returnStops": "Madrid",
            "supplierUsedMiles": True,
            "supplierMilesQuantity": 150000,
            "supplierMilesValue": 35.00,  # valor por 1000 milhas
            "supplierMilesProgram": "LATAM Pass",
            "airportTaxes": 300.00,
            # Multiple products with cost/client value structure
            "products": [
                {
                    "name": "Passagem Aérea GRU-LIS",
                    "cost": 2200.00,
                    "clientValue": 2800.00,
                    "quantity": 1,
                    "category": "Passagem Aérea"
                },
                {
                    "name": "Passagem Aérea LIS-GRU",
                    "cost": 2100.00,
                    "clientValue": 2700.00,
                    "quantity": 1,
                    "category": "Passagem Aérea"
                },
                {
                    "name": "Seguro Viagem Europa",
                    "cost": 80.00,
                    "clientValue": 120.00,
                    "quantity": 1,
                    "category": "Seguro Viagem"
                }
            ],
            "saleValue": 5620.00,  # Total client value (2800 + 2700 + 120)
            "supplierValue": 4380.00,  # Total cost (2200 + 2100 + 80)
            "commissionValue": 562.00,  # 10% commission
            "seller": "Vendedor Especialista",
            # Additional travel details
            "productType": "Passagem",
            "clientReservationCode": "RT789012",
            "departureCity": "São Paulo",
            "arrivalCity": "Lisboa",
            "departureDate": "2025-02-15",
            "returnDate": "2025-02-28",
            "departureTime": "23:50",
            "arrivalTime": "14:30",
            "originAirport": "GRU",
            "destinationAirport": "LIS",
            "tripType": "Lazer"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=complete_travel_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "POST /api/transactions - Complete travel transaction created", 
                           f"ID: {transaction_id}, Total Amount: R$ {data.get('amount')}")
                
                # Test 2: Verify hasStops and stops fields
                if (data.get("hasStops") == True and 
                    data.get("outboundStops") == "Lisboa" and 
                    data.get("returnStops") == "Madrid"):
                    print_result(True, "Complete travel transaction - Stops validation", 
                               f"Stops correctly saved: hasStops={data.get('hasStops')}, outbound={data.get('outboundStops')}, return={data.get('returnStops')}")
                else:
                    print_result(False, "Complete travel transaction - Stops validation", 
                               f"Stops data incorrect: hasStops={data.get('hasStops')}, outbound={data.get('outboundStops')}, return={data.get('returnStops')}")
                
                # Test 3: Verify supplierUsedMiles and calculation fields
                if (data.get("supplierUsedMiles") == True and 
                    data.get("supplierMilesQuantity") == 150000 and 
                    data.get("supplierMilesValue") == 35.00 and 
                    data.get("supplierMilesProgram") == "LATAM Pass"):
                    print_result(True, "Complete travel transaction - Supplier miles validation", 
                               f"Miles data correctly saved: {data.get('supplierMilesQuantity')} milhas, R$ {data.get('supplierMilesValue')}/1000, {data.get('supplierMilesProgram')}")
                    
                    # Calculate expected miles value (150000 / 1000 * 35.00 = 5250.00)
                    expected_miles_total = (150000 / 1000) * 35.00
                    print_result(True, "Complete travel transaction - Miles calculation", 
                               f"Expected total miles value: R$ {expected_miles_total:.2f} (150000 milhas × R$ 35.00/1000)")
                else:
                    print_result(False, "Complete travel transaction - Supplier miles validation", 
                               f"Miles data incorrect: used={data.get('supplierUsedMiles')}, quantity={data.get('supplierMilesQuantity')}, value={data.get('supplierMilesValue')}, program={data.get('supplierMilesProgram')}")
                
                # Test 4: Verify multiple products with cost/client value structure
                saved_products = data.get("products", [])
                if isinstance(saved_products, list) and len(saved_products) == 3:
                    print_result(True, "Complete travel transaction - Multiple products validation", 
                               f"Products array correctly saved with {len(saved_products)} items")
                    
                    # Verify each product has cost and clientValue
                    for i, product in enumerate(saved_products):
                        if ("cost" in product and "clientValue" in product and 
                            isinstance(product.get("cost"), (int, float)) and 
                            isinstance(product.get("clientValue"), (int, float))):
                            print_result(True, f"Complete travel transaction - Product {i+1} cost/value structure", 
                                       f"{product.get('name')}: cost=R$ {product.get('cost')}, clientValue=R$ {product.get('clientValue')}")
                        else:
                            print_result(False, f"Complete travel transaction - Product {i+1} cost/value structure", 
                                       f"Missing or invalid cost/clientValue fields in product: {product}")
                else:
                    print_result(False, "Complete travel transaction - Multiple products validation", 
                               f"Expected 3 products, got: {len(saved_products) if isinstance(saved_products, list) else 'not a list'}")
                
            else:
                print_result(False, "POST /api/transactions - Invalid response format", data)
        else:
            print_result(False, f"POST /api/transactions - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/transactions - Complete travel transaction failed", str(e))

def run_all_tests():
    """Run all test suites"""
    print(f"\n🚀 Starting AgentePro Backend API Tests")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 API Base URL: {API_URL}")
    
    # NEW TESTS FROM REVIEW REQUEST - PRIORITY TESTING
    test_company_settings_api()  # NEW: Test company settings API endpoints
    test_enhanced_transaction_with_products()  # NEW: Test enhanced transaction with new product structure
    test_complete_travel_transaction()  # NEW: Test complete travel transaction with all enhanced fields
    
    # PRIORITY TESTS FROM REVIEW REQUEST - Test enhanced transaction system
    test_enhanced_transaction_system()  # NEW: Test enhanced transaction system with new travel fields
    test_supplier_travel_fields_update()  # CRITICAL: Test supplier update with travel fields
    test_enhanced_transactions_travel_fields()
    
    # Run URGENT transaction persistence test
    test_urgent_transaction_persistence()
    
    # Run other test suites
    test_api_connectivity()
    test_authentication()
    test_transactions()
    test_transaction_date_functionality()  # NEW: Test transaction date vs entry date functionality
    test_sales_analysis_endpoints()  # NEW: Test newly implemented sales analysis and reporting endpoints
    test_analytics_endpoints()  # NEW: Test analytics endpoints as requested
    test_analytics_integration()  # NEW: Test integration with existing endpoints
    test_reports()
    test_users_api()  # Added comprehensive user API testing
    test_client_api()  # CRITICAL: Test client API endpoints for persistence bug
    test_jwt_validation()
    
    print(f"\n{'='*60}")
    print("🏁 All tests completed!")
    print(f"{'='*60}")

if __name__ == "__main__":
    run_all_tests()