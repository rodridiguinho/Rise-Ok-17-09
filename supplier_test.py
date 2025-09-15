#!/usr/bin/env python3
"""
Supplier Field Investigation Test - REVIEW REQUEST
Tests supplier field issue in passenger control system
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

# Test credentials
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

def test_supplier_field_investigation():
    """Test Supplier Field Investigation - REVIEW REQUEST"""
    print_test_header("Supplier Field Investigation - Review Request Testing")
    
    # Test 1: Authenticate first
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
            print_result(True, "Authentication for supplier field investigation", 
                       f"Successfully logged in as {VALID_EMAIL}")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "Authentication for supplier field investigation failed", str(e))
        return
    
    # Test 2: Check existing transactions for supplier data
    print("\n🎯 TEST 1: CHECK EXISTING TRANSACTIONS FOR SUPPLIER DATA")
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            transactions = response.json()
            print_result(True, "GET /api/transactions - Request successful", 
                       f"Retrieved {len(transactions)} transactions from database")
            
            # Analyze supplier field data
            transactions_with_supplier = []
            transactions_without_supplier = []
            supplier_examples = []
            
            for transaction in transactions:
                supplier_value = transaction.get('supplier')
                if supplier_value and supplier_value.strip():
                    transactions_with_supplier.append(transaction)
                    if len(supplier_examples) < 5:  # Collect up to 5 examples
                        supplier_examples.append({
                            'id': transaction.get('id'),
                            'description': transaction.get('description'),
                            'supplier': supplier_value,
                            'amount': transaction.get('amount'),
                            'date': transaction.get('date') or transaction.get('transactionDate')
                        })
                else:
                    transactions_without_supplier.append(transaction)
            
            # Report findings
            print_result(True, "Supplier field analysis - Database statistics", 
                       f"Total transactions: {len(transactions)}")
            print_result(True, "Supplier field analysis - With supplier data", 
                       f"Transactions with supplier field: {len(transactions_with_supplier)}")
            print_result(True, "Supplier field analysis - Without supplier data", 
                       f"Transactions without supplier field: {len(transactions_without_supplier)}")
            
            # Show supplier examples
            if supplier_examples:
                print("\n📋 SUPPLIER FIELD EXAMPLES FROM DATABASE:")
                for i, example in enumerate(supplier_examples, 1):
                    print(f"   Example {i}:")
                    print(f"     ID: {example['id']}")
                    print(f"     Description: {example['description']}")
                    print(f"     Supplier: '{example['supplier']}'")
                    print(f"     Amount: R$ {example['amount']}")
                    print(f"     Date: {example['date']}")
                    print()
                
                print_result(True, "Supplier field investigation - Supplier data found", 
                           f"Found {len(transactions_with_supplier)} transactions with supplier data populated")
            else:
                print_result(False, "Supplier field investigation - No supplier data", 
                           "No transactions found with supplier field populated")
            
        else:
            print_result(False, f"GET /api/transactions failed - HTTP {response.status_code}", response.text)
            return
    except Exception as e:
        print_result(False, "Supplier field investigation - Database query failed", str(e))
        return
    
    # Test 3: Test a specific transaction structure
    print("\n🎯 TEST 2: TEST SPECIFIC TRANSACTION STRUCTURE")
    try:
        if transactions_with_supplier:
            # Pick the first transaction with supplier data
            test_transaction = transactions_with_supplier[0]
            transaction_id = test_transaction.get('id')
            
            print(f"📋 COMPLETE TRANSACTION STRUCTURE FOR ID: {transaction_id}")
            print("="*60)
            
            # Display all fields in the transaction
            important_fields = ['id', 'description', 'supplier', 'amount', 'type', 'category', 'date', 'transactionDate']
            supplier_related_fields = ['supplier', 'supplierValue', 'supplierUsedMiles', 'supplierMilesQuantity', 
                                     'supplierMilesValue', 'supplierMilesProgram', 'airportTaxes']
            
            print("🔍 IMPORTANT FIELDS:")
            for field in important_fields:
                value = test_transaction.get(field)
                print(f"   {field}: {value}")
            
            print("\n🏢 SUPPLIER-RELATED FIELDS:")
            for field in supplier_related_fields:
                value = test_transaction.get(field)
                if value is not None:
                    print(f"   {field}: {value}")
                else:
                    print(f"   {field}: null/empty")
            
            print("\n📦 ALL TRANSACTION FIELDS:")
            for key, value in test_transaction.items():
                if key not in important_fields + supplier_related_fields:
                    print(f"   {key}: {value}")
            
            # Verify supplier field specifically
            supplier_field_value = test_transaction.get('supplier')
            if supplier_field_value and supplier_field_value.strip():
                print_result(True, "Specific transaction - Supplier field present", 
                           f"Supplier field contains: '{supplier_field_value}'")
            else:
                print_result(False, "Specific transaction - Supplier field missing", 
                           f"Supplier field is: {supplier_field_value}")
            
        else:
            print_result(False, "Specific transaction test - No transactions with supplier", 
                       "Cannot test specific transaction structure - no transactions with supplier data found")
    except Exception as e:
        print_result(False, "Specific transaction structure test failed", str(e))
    
    # Test 4: Test GET /api/transactions endpoint supplier field return
    print("\n🎯 TEST 3: TEST GET /api/transactions ENDPOINT SUPPLIER FIELD RETURN")
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            transactions = response.json()
            
            # Verify the endpoint returns supplier field correctly
            supplier_field_returned = True
            supplier_field_examples = []
            
            for transaction in transactions[:10]:  # Check first 10 transactions
                if 'supplier' in transaction:
                    supplier_value = transaction.get('supplier')
                    if supplier_value and supplier_value.strip():
                        supplier_field_examples.append({
                            'id': transaction.get('id'),
                            'supplier': supplier_value
                        })
                else:
                    supplier_field_returned = False
                    break
            
            if supplier_field_returned:
                print_result(True, "GET /api/transactions - Supplier field structure", 
                           "Supplier field is present in transaction structure")
                
                if supplier_field_examples:
                    print_result(True, "GET /api/transactions - Supplier field data", 
                               f"Found {len(supplier_field_examples)} transactions with supplier data")
                    
                    print("\n📋 SUPPLIER FIELD EXAMPLES FROM API RESPONSE:")
                    for example in supplier_field_examples[:3]:  # Show first 3
                        print(f"   Transaction {example['id']}: supplier = '{example['supplier']}'")
                else:
                    print_result(True, "GET /api/transactions - Supplier field structure (empty)", 
                               "Supplier field is present but no transactions have supplier data")
            else:
                print_result(False, "GET /api/transactions - Supplier field missing", 
                           "Supplier field is not present in transaction structure")
            
        else:
            print_result(False, f"GET /api/transactions endpoint test failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "GET /api/transactions endpoint test failed", str(e))
    
    # Test 5: Create a test transaction with supplier data to verify functionality
    print("\n🎯 TEST 4: CREATE TEST TRANSACTION WITH SUPPLIER DATA")
    try:
        test_supplier_transaction = {
            "type": "entrada",
            "category": "Passagem Aérea",
            "description": "Teste Supplier Field Investigation",
            "amount": 1500.00,
            "paymentMethod": "PIX",
            "supplier": "Fornecedor Teste Investigação",
            "supplierValue": 1200.00,
            "airportTaxes": 100.00,
            "client": "Cliente Teste Supplier",
            "transactionDate": "2025-01-10"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=test_supplier_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                new_transaction_id = data["id"]
                print_result(True, "Test transaction creation - Success", 
                           f"Created test transaction with ID: {new_transaction_id}")
                
                # Verify supplier field was saved
                saved_supplier = data.get('supplier')
                if saved_supplier == "Fornecedor Teste Investigação":
                    print_result(True, "Test transaction - Supplier field saved", 
                               f"Supplier field correctly saved: '{saved_supplier}'")
                else:
                    print_result(False, "Test transaction - Supplier field not saved", 
                               f"Expected: 'Fornecedor Teste Investigação', Got: '{saved_supplier}'")
                
                # Verify other supplier-related fields
                supplier_fields_check = {
                    'supplierValue': 1200.00,
                    'airportTaxes': 100.00
                }
                
                for field, expected_value in supplier_fields_check.items():
                    actual_value = data.get(field)
                    if actual_value == expected_value:
                        print_result(True, f"Test transaction - {field} saved", 
                                   f"{field} correctly saved: {actual_value}")
                    else:
                        print_result(False, f"Test transaction - {field} not saved", 
                                   f"Expected: {expected_value}, Got: {actual_value}")
                
            else:
                print_result(False, "Test transaction creation - No ID returned", str(data))
        else:
            print_result(False, f"Test transaction creation failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Test transaction creation failed", str(e))
    
    # Test 6: Final summary and diagnosis
    print("\n🎯 FINAL DIAGNOSIS: SUPPLIER FIELD ISSUE INVESTIGATION")
    try:
        # Re-check the database after our test
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            final_transactions = response.json()
            final_with_supplier = [t for t in final_transactions if t.get('supplier') and t.get('supplier').strip()]
            
            print_result(True, "Final diagnosis - Database status", 
                       f"Total transactions: {len(final_transactions)}, With supplier: {len(final_with_supplier)}")
            
            if len(final_with_supplier) > 0:
                print_result(True, "🎯 SUPPLIER FIELD DIAGNOSIS - SUPPLIER DATA EXISTS", 
                           f"✅ Database contains {len(final_with_supplier)} transactions with supplier data\n"
                           f"✅ GET /api/transactions endpoint returns supplier field correctly\n"
                           f"✅ Supplier field can be saved and retrieved\n"
                           f"🔍 If supplier is not appearing in passenger control modal, the issue is likely:\n"
                           f"   - Frontend not reading the supplier field from transaction data\n"
                           f"   - Frontend filtering or processing issue\n"
                           f"   - Modal component not displaying the supplier field")
            else:
                print_result(False, "🎯 SUPPLIER FIELD DIAGNOSIS - NO SUPPLIER DATA", 
                           f"❌ No transactions in database have supplier field populated\n"
                           f"❌ This explains why supplier is not appearing in passenger control modal\n"
                           f"🔍 Possible causes:\n"
                           f"   - Transactions were created without supplier information\n"
                           f"   - Supplier field is not being saved during transaction creation\n"
                           f"   - Data migration or import issue")
            
        else:
            print_result(False, "Final diagnosis failed", f"Could not retrieve final transaction data - HTTP {response.status_code}")
    except Exception as e:
        print_result(False, "Final diagnosis failed", str(e))

if __name__ == "__main__":
    print("🚀 Starting Supplier Field Investigation")
    print(f"📍 Backend URL: {BASE_URL}")
    print(f"🔗 API URL: {API_URL}")
    print(f"👤 Test User: {VALID_EMAIL}")
    print("="*80)
    
    # Run supplier field investigation test
    test_supplier_field_investigation()
    
    print("\n" + "="*80)
    print("🏁 Supplier Field Investigation Complete")
    print("="*80)