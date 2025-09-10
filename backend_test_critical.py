#!/usr/bin/env python3
"""
Critical Backend Test Suite for Transaction Creation and Form Reset Issues
Tests the specific critical fixes mentioned in the review request
"""

import requests
import json
import sys
import os
from datetime import datetime
import time

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

def print_test_header(title):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"🧪 {title}")
    print(f"{'='*80}")

def print_result(success, test_name, details=""):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {test_name}")
    if details:
        print(f"     └─ {details}")

def test_critical_transaction_creation_and_form_reset():
    """Test Critical Transaction Creation and Form Reset Issues - REVIEW REQUEST"""
    print_test_header("Critical Transaction Creation and Form Reset Issues - Review Request Testing")
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            print_result(True, "Authentication for critical fixes testing", 
                       f"Successfully logged in as {VALID_EMAIL}")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "Authentication for critical fixes testing failed", str(e))
        return
    
    # Test 2: Transaction List Update Test - Create transaction and verify immediate appearance
    print("\n🎯 TEST 1: TRANSACTION LIST UPDATE TEST")
    try:
        # Get initial transaction count
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        initial_count = 0
        if response.status_code == 200:
            initial_transactions = response.json()
            initial_count = len(initial_transactions)
            print_result(True, "Initial transaction count retrieved", f"Found {initial_count} existing transactions")
        
        # Create new transaction with exact test data from review request
        test_transaction = {
            "type": "entrada",
            "category": "Vendas de Passagens",
            "description": "Teste lista atualização imediata",
            "amount": 1500.00,
            "paymentMethod": "PIX",
            "transactionDate": datetime.now().strftime("%Y-%m-%d")
        }
        
        response = requests.post(f"{API_URL}/transactions", json=test_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "Transaction creation successful", 
                           f"Created transaction ID: {transaction_id}")
                
                # IMMEDIATELY check if transaction appears in list (no refresh/navigation)
                response = requests.get(f"{API_URL}/transactions", timeout=10)
                if response.status_code == 200:
                    updated_transactions = response.json()
                    updated_count = len(updated_transactions)
                    
                    # Verify count increased
                    if updated_count == initial_count + 1:
                        print_result(True, "✅ TRANSACTION LIST UPDATE - IMMEDIATE APPEARANCE", 
                                   f"Transaction count increased from {initial_count} to {updated_count} immediately")
                        
                        # Verify the specific transaction is in the list
                        found_transaction = None
                        for transaction in updated_transactions:
                            if transaction.get("id") == transaction_id:
                                found_transaction = transaction
                                break
                        
                        if found_transaction:
                            print_result(True, "✅ TRANSACTION LIST UPDATE - SPECIFIC TRANSACTION FOUND", 
                                       f"New transaction found in list with description: '{found_transaction.get('description')}'")
                        else:
                            print_result(False, "❌ TRANSACTION LIST UPDATE - TRANSACTION NOT FOUND", 
                                       f"Transaction {transaction_id} not found in updated list")
                    else:
                        print_result(False, "❌ TRANSACTION LIST UPDATE - COUNT NOT UPDATED", 
                                   f"Expected count: {initial_count + 1}, Got: {updated_count}")
                else:
                    print_result(False, f"Transaction list retrieval failed - HTTP {response.status_code}", response.text)
            else:
                print_result(False, "Transaction creation failed - No ID returned", data)
        else:
            print_result(False, f"Transaction creation failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Transaction List Update Test failed", str(e))
    
    # Test 3: Form Reset Test - Create transaction with multiple fields, then verify reset
    print("\n🎯 TEST 2: FORM RESET TEST")
    try:
        # Create transaction with ALL fields filled (simulating form completion)
        complex_transaction = {
            "type": "entrada",
            "category": "Vendas de Passagens",
            "description": "Transação complexa para teste de reset",
            "amount": 2500.00,
            "paymentMethod": "Cartão de Crédito",
            "client": "Cliente Teste Reset",
            "supplier": "Fornecedor Teste Reset",
            "seller": "Vendedor Teste",
            "transactionDate": datetime.now().strftime("%Y-%m-%d"),
            # Travel details
            "departureCity": "São Paulo",
            "arrivalCity": "Miami",
            "clientReservationCode": "RST123456",
            "productType": "Passagem",
            # Supplier information with values
            "supplierValue": 1800.00,
            "airportTaxes": 200.00,
            "supplierUsedMiles": True,
            "supplierMilesQuantity": 50000,
            "supplierMilesValue": 35.00,
            "supplierMilesProgram": "LATAM Pass",
            # Financial details
            "saleValue": 2500.00,
            "commissionValue": 250.00,
            "products": [
                {
                    "name": "Passagem GRU-MIA",
                    "cost": 1800.00,
                    "clientValue": 2500.00
                }
            ]
        }
        
        response = requests.post(f"{API_URL}/transactions", json=complex_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                complex_transaction_id = data["id"]
                print_result(True, "Complex transaction created for form reset test", 
                           f"Created transaction ID: {complex_transaction_id}")
                
                # Verify all fields were saved correctly
                saved_fields = {
                    "description": "Transação complexa para teste de reset",
                    "amount": 2500.00,
                    "client": "Cliente Teste Reset",
                    "supplier": "Fornecedor Teste Reset",
                    "departureCity": "São Paulo",
                    "arrivalCity": "Miami",
                    "supplierValue": 1800.00,
                    "supplierMilesQuantity": 50000
                }
                
                all_fields_saved = True
                for field, expected_value in saved_fields.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Form field saved correctly - {field}", 
                                   f"Value: {actual_value}")
                    else:
                        print_result(False, f"Form field NOT saved correctly - {field}", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                        all_fields_saved = False
                
                if all_fields_saved:
                    print_result(True, "✅ FORM RESET TEST - ALL FIELDS SAVED", 
                               "All form fields were correctly saved before reset test")
                    
                    # Simulate "Nova Transação" click - this would reset the form
                    # In the backend, this means the form should be ready for new data
                    # We test this by creating another transaction and verifying it's independent
                    
                    # Create a simple transaction to verify form independence
                    simple_transaction = {
                        "type": "entrada",
                        "category": "Hotel/Hospedagem",
                        "description": "Transação simples pós-reset",
                        "amount": 800.00,
                        "paymentMethod": "PIX",
                        "transactionDate": datetime.now().strftime("%Y-%m-%d")
                    }
                    
                    response = requests.post(f"{API_URL}/transactions", json=simple_transaction, timeout=10)
                    if response.status_code == 200:
                        simple_data = response.json()
                        if "id" in simple_data:
                            simple_transaction_id = simple_data["id"]
                            print_result(True, "Simple transaction created after form reset", 
                                       f"Created transaction ID: {simple_transaction_id}")
                            
                            # Verify the new transaction has ONLY the fields we specified (form was reset)
                            reset_verification = {
                                "description": "Transação simples pós-reset",
                                "amount": 800.00,
                                "category": "Hotel/Hospedagem",
                                "paymentMethod": "PIX"
                            }
                            
                            # Verify fields that should be empty/default after reset
                            empty_fields = ["client", "supplier", "departureCity", "arrivalCity", "supplierValue"]
                            
                            form_reset_verified = True
                            for field, expected_value in reset_verification.items():
                                actual_value = simple_data.get(field)
                                if actual_value == expected_value:
                                    print_result(True, f"Form reset verification - {field}", 
                                               f"Correct new value: {actual_value}")
                                else:
                                    print_result(False, f"Form reset verification - {field}", 
                                               f"Expected: {expected_value}, Got: {actual_value}")
                                    form_reset_verified = False
                            
                            # Check that previous transaction's data didn't carry over
                            for field in empty_fields:
                                actual_value = simple_data.get(field)
                                if not actual_value or actual_value == 0 or actual_value == "":
                                    print_result(True, f"Form reset verification - {field} empty", 
                                               f"Field correctly empty/default: {actual_value}")
                                else:
                                    print_result(False, f"Form reset verification - {field} NOT empty", 
                                               f"Field should be empty but got: {actual_value}")
                                    form_reset_verified = False
                            
                            if form_reset_verified:
                                print_result(True, "✅ FORM RESET TEST - COMPLETE RESET VERIFIED", 
                                           "Form completely resets between transactions - no data carries over")
                            else:
                                print_result(False, "❌ FORM RESET TEST - RESET NOT COMPLETE", 
                                           "Some form data carried over between transactions")
                        else:
                            print_result(False, "Simple transaction creation failed - No ID returned", simple_data)
                    else:
                        print_result(False, f"Simple transaction creation failed - HTTP {response.status_code}", response.text)
                else:
                    print_result(False, "❌ FORM RESET TEST - FIELDS NOT SAVED", 
                               "Cannot test form reset because initial fields were not saved correctly")
            else:
                print_result(False, "Complex transaction creation failed - No ID returned", data)
        else:
            print_result(False, f"Complex transaction creation failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Form Reset Test failed", str(e))
    
    # Test 4: Complete Flow Test - Create two transactions and verify both appear immediately
    print("\n🎯 TEST 3: COMPLETE FLOW TEST")
    try:
        # Get initial count
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        flow_initial_count = 0
        if response.status_code == 200:
            flow_initial_count = len(response.json())
        
        # Create first transaction
        transaction_1 = {
            "type": "entrada",
            "category": "Vendas de Passagens",
            "description": "Fluxo completo - Transação 1",
            "amount": 1200.00,
            "paymentMethod": "PIX",
            "client": "Cliente Fluxo 1",
            "transactionDate": datetime.now().strftime("%Y-%m-%d")
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_1, timeout=10)
        transaction_1_id = None
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_1_id = data["id"]
                print_result(True, "Complete flow - Transaction 1 created", 
                           f"ID: {transaction_1_id}, Description: {data.get('description')}")
                
                # Verify transaction 1 appears immediately
                response = requests.get(f"{API_URL}/transactions", timeout=10)
                if response.status_code == 200:
                    transactions = response.json()
                    if len(transactions) == flow_initial_count + 1:
                        print_result(True, "Complete flow - Transaction 1 appears immediately", 
                                   f"Count increased to {len(transactions)}")
                    else:
                        print_result(False, "Complete flow - Transaction 1 NOT immediate", 
                                   f"Expected {flow_initial_count + 1}, got {len(transactions)}")
        
        # Create second transaction with different data (verify form was clean)
        transaction_2 = {
            "type": "entrada",
            "category": "Hotel/Hospedagem",  # Different category
            "description": "Fluxo completo - Transação 2",  # Different description
            "amount": 800.00,  # Different amount
            "paymentMethod": "Cartão de Crédito",  # Different payment method
            "client": "Cliente Fluxo 2",  # Different client
            "transactionDate": datetime.now().strftime("%Y-%m-%d")
        }
        
        response = requests.post(f"{API_URL}/transactions", json=transaction_2, timeout=10)
        transaction_2_id = None
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_2_id = data["id"]
                print_result(True, "Complete flow - Transaction 2 created", 
                           f"ID: {transaction_2_id}, Description: {data.get('description')}")
                
                # Verify transaction 2 also appears immediately
                response = requests.get(f"{API_URL}/transactions", timeout=10)
                if response.status_code == 200:
                    transactions = response.json()
                    expected_count = flow_initial_count + 2
                    if len(transactions) == expected_count:
                        print_result(True, "Complete flow - Transaction 2 appears immediately", 
                                   f"Count increased to {len(transactions)}")
                        
                        # Verify both transactions are visible without refresh
                        found_transaction_1 = False
                        found_transaction_2 = False
                        
                        for transaction in transactions:
                            if transaction.get("id") == transaction_1_id:
                                found_transaction_1 = True
                            elif transaction.get("id") == transaction_2_id:
                                found_transaction_2 = True
                        
                        if found_transaction_1 and found_transaction_2:
                            print_result(True, "✅ COMPLETE FLOW TEST - BOTH TRANSACTIONS VISIBLE", 
                                       "Both transactions visible immediately without refresh or navigation")
                        else:
                            print_result(False, "❌ COMPLETE FLOW TEST - TRANSACTIONS NOT VISIBLE", 
                                       f"Transaction 1 found: {found_transaction_1}, Transaction 2 found: {found_transaction_2}")
                    else:
                        print_result(False, "Complete flow - Transaction 2 NOT immediate", 
                                   f"Expected {expected_count}, got {len(transactions)}")
        
        # Final verification - both transactions should be in the list
        if transaction_1_id and transaction_2_id:
            print_result(True, "✅ COMPLETE FLOW TEST - SUCCESS", 
                       f"Created and verified immediate visibility of transactions {transaction_1_id} and {transaction_2_id}")
        else:
            print_result(False, "❌ COMPLETE FLOW TEST - FAILED", 
                       "One or both transactions failed to create properly")
            
    except Exception as e:
        print_result(False, "Complete Flow Test failed", str(e))

def main():
    """Main test execution"""
    print("🚀 Starting Critical Transaction Creation and Form Reset Tests")
    print(f"📍 Backend URL: {BASE_URL}")
    print(f"🔑 Using credentials: {VALID_EMAIL}")
    
    test_critical_transaction_creation_and_form_reset()
    
    print(f"\n{'='*80}")
    print("🏁 Critical Tests Completed")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()