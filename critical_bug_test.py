#!/usr/bin/env python3
"""
Critical Bug Fix Test - Transaction Creation with Default Values
Tests the specific bug fix for user's payment issue
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

def test_critical_transaction_creation_bug_fix():
    """Test Critical Transaction Creation Bug Fix - REVIEW REQUEST"""
    print_test_header("🎯 CRITICAL BUG FIX VALIDATION - Transaction Creation with Default Values")
    
    # Test 1: Authenticate first
    try:
        login_data = {
            "email": VALID_EMAIL,
            "password": VALID_PASSWORD
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Authentication for critical bug fix testing", 
                       f"Successfully logged in as {VALID_EMAIL}")
        else:
            print_result(False, f"Authentication failed - HTTP {response.status_code}", response.text)
            return False
    except Exception as e:
        print_result(False, "Authentication for critical bug fix testing failed", str(e))
        return False
    
    # Test 2: USER'S EXACT SCENARIO - SHOULD NOW WORK WITH DEFAULT VALUES
    print("\n🎯 TEST 1: USER'S EXACT SCENARIO - MINIMAL FIELDS WITH DEFAULT VALUES")
    user_scenario_success = False
    try:
        user_minimal_transaction = {
            "description": "Teste salvamento funcionando agora",
            "amount": 750.00,
            "type": "entrada"
            # NO category or paymentMethod - should use defaults
        }
        
        response = requests.post(f"{API_URL}/transactions", json=user_minimal_transaction, timeout=10)
        print(f"🔍 User Scenario Response Status: {response.status_code}")
        print(f"🔍 User Scenario Response Text: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "✅ USER'S EXACT SCENARIO - NOW WORKS", 
                           f"Transaction created with ID: {transaction_id}")
                
                # Verify default values were applied
                category = data.get("category")
                payment_method = data.get("paymentMethod")
                
                if category == "Outros":
                    print_result(True, "✅ Default Category Applied", 
                               f"Category defaulted to 'Outros' as expected: {category}")
                else:
                    print_result(False, "❌ Default Category NOT Applied", 
                               f"Expected 'Outros', got: {category}")
                
                if payment_method == "Dinheiro":
                    print_result(True, "✅ Default Payment Method Applied", 
                               f"Payment method defaulted to 'Dinheiro' as expected: {payment_method}")
                else:
                    print_result(False, "❌ Default Payment Method NOT Applied", 
                               f"Expected 'Dinheiro', got: {payment_method}")
                
                # Verify transaction persists in database
                verify_response = requests.get(f"{API_URL}/transactions", timeout=10)
                if verify_response.status_code == 200:
                    transactions = verify_response.json()
                    found_transaction = None
                    for t in transactions:
                        if t.get("id") == transaction_id:
                            found_transaction = t
                            break
                    
                    if found_transaction:
                        print_result(True, "✅ Database Persistence Verified", 
                                   f"Transaction persists in database with defaults: category='{found_transaction.get('category')}', paymentMethod='{found_transaction.get('paymentMethod')}'")
                        user_scenario_success = True
                    else:
                        print_result(False, "❌ Database Persistence Failed", 
                                   f"Transaction NOT found in database")
                else:
                    print_result(False, "❌ Database Verification Failed", 
                               f"Could not verify database persistence - HTTP {verify_response.status_code}")
                
            else:
                print_result(False, "❌ USER'S EXACT SCENARIO - No ID returned", str(data))
        else:
            print_result(False, f"❌ USER'S EXACT SCENARIO - STILL FAILS - HTTP {response.status_code}", 
                       f"CRITICAL BUG NOT FIXED: {response.text}")
            print("🚨 CRITICAL: User's payment issue is NOT resolved!")
            
    except Exception as e:
        print_result(False, "❌ USER'S EXACT SCENARIO - Exception occurred", str(e))
        print("🚨 CRITICAL: Exception during user's exact scenario test!")
    
    # Test 3: Verify Full Transaction Still Works (No Regression)
    print("\n🎯 TEST 2: FULL TRANSACTION STILL WORKS - NO REGRESSION")
    full_transaction_success = False
    try:
        full_transaction = {
            "description": "Transação completa com todos os campos",
            "amount": 1200.00,
            "type": "entrada",
            "category": "Passagem Aérea",  # Explicitly provided
            "paymentMethod": "PIX",  # Explicitly provided
            "client": "Cliente Teste Completo",
            "supplier": "Fornecedor Teste",
            "transactionDate": "2025-01-25",
            "saleValue": 1200.00,
            "supplierValue": 900.00,
            "commissionValue": 120.00,
            "products": [
                {
                    "name": "Passagem Teste",
                    "cost": 900.00,
                    "clientValue": 1200.00
                }
            ]
        }
        
        response = requests.post(f"{API_URL}/transactions", json=full_transaction, timeout=10)
        print(f"🔍 Full Transaction Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                transaction_id = data["id"]
                print_result(True, "✅ Full Transaction Still Works", 
                           f"Complex transaction created with ID: {transaction_id}")
                
                # Verify explicit values are preserved
                if data.get("category") == "Passagem Aérea" and data.get("paymentMethod") == "PIX":
                    print_result(True, "✅ No Regression - Explicit Values Preserved", 
                               f"Category: {data.get('category')}, Payment: {data.get('paymentMethod')}")
                    full_transaction_success = True
                else:
                    print_result(False, "❌ Regression Detected - Explicit Values Changed", 
                               f"Expected category='Passagem Aérea', paymentMethod='PIX', Got: category='{data.get('category')}', paymentMethod='{data.get('paymentMethod')}'")
                
                # Verify complex fields still work
                products = data.get("products", [])
                if len(products) > 0 and products[0].get("name") == "Passagem Teste":
                    print_result(True, "✅ No Regression - Complex Fields Work", 
                               f"Products array correctly saved: {len(products)} products")
                else:
                    print_result(False, "❌ Regression Detected - Complex Fields Broken", 
                               f"Products not saved correctly: {products}")
                
            else:
                print_result(False, "❌ Full Transaction Failed - No ID returned", str(data))
        else:
            print_result(False, f"❌ Full Transaction Failed - HTTP {response.status_code}", 
                       f"Regression detected: {response.text}")
            
    except Exception as e:
        print_result(False, "❌ Full Transaction Test - Exception occurred", str(e))
    
    # Test 4: Edge Case - Only Some Defaults Needed
    print("\n🎯 TEST 3: EDGE CASE - PARTIAL DEFAULTS")
    partial_defaults_success = False
    try:
        partial_transaction = {
            "description": "Teste com categoria mas sem método de pagamento",
            "amount": 300.00,
            "type": "entrada",
            "category": "Hotel/Hospedagem"  # Provided
            # paymentMethod missing - should default to "Dinheiro"
        }
        
        response = requests.post(f"{API_URL}/transactions", json=partial_transaction, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                print_result(True, "✅ Partial Defaults Work", 
                           f"Transaction created with partial defaults")
                
                # Verify provided category is preserved and missing payment method gets default
                if data.get("category") == "Hotel/Hospedagem" and data.get("paymentMethod") == "Dinheiro":
                    print_result(True, "✅ Partial Defaults Applied Correctly", 
                               f"Category preserved: '{data.get('category')}', Payment defaulted: '{data.get('paymentMethod')}'")
                    partial_defaults_success = True
                else:
                    print_result(False, "❌ Partial Defaults Failed", 
                               f"Expected category='Hotel/Hospedagem', paymentMethod='Dinheiro', Got: category='{data.get('category')}', paymentMethod='{data.get('paymentMethod')}'")
            else:
                print_result(False, "❌ Partial Defaults - No ID returned", str(data))
        else:
            print_result(False, f"❌ Partial Defaults Failed - HTTP {response.status_code}", response.text)
            
    except Exception as e:
        print_result(False, "❌ Partial Defaults Test - Exception occurred", str(e))
    
    # Final Summary
    print("\n" + "="*80)
    print("🎯 CRITICAL BUG FIX VALIDATION SUMMARY")
    print("="*80)
    
    if user_scenario_success:
        print("✅ USER'S EXACT SCENARIO: FIXED - User can now create transactions with minimal fields")
        print("   └─ Default values (category='Outros', paymentMethod='Dinheiro') are applied automatically")
    else:
        print("❌ USER'S EXACT SCENARIO: NOT FIXED - User still cannot create simple transactions")
        print("   └─ This is the critical bug that needs to be resolved")
    
    if full_transaction_success:
        print("✅ NO REGRESSION: Complex transactions still work correctly")
    else:
        print("❌ REGRESSION DETECTED: Complex transactions are now broken")
    
    if partial_defaults_success:
        print("✅ PARTIAL DEFAULTS: Work correctly when only some fields are missing")
    else:
        print("❌ PARTIAL DEFAULTS: Not working correctly")
    
    overall_success = user_scenario_success and full_transaction_success and partial_defaults_success
    
    if overall_success:
        print("\n🎉 CRITICAL BUG FIX: COMPLETELY SUCCESSFUL")
        print("   └─ User's payment issue has been resolved!")
    else:
        print("\n🚨 CRITICAL BUG FIX: INCOMPLETE OR FAILED")
        print("   └─ User's payment issue is NOT fully resolved!")
    
    return overall_success

if __name__ == "__main__":
    success = test_critical_transaction_creation_bug_fix()
    sys.exit(0 if success else 1)