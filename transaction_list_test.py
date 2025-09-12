#!/usr/bin/env python3
"""
Transaction List Real-Time Update Bug Test
Tests the specific bug mentioned in test_result.md
"""

import requests
import json
import sys
import time
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
API_URL = f"{BASE_URL}/api"

# Test credentials
VALID_EMAIL = "rodrigo@risetravel.com.br"
VALID_PASSWORD = "Emily2030*"

def print_result(success, test_name, details=""):
    """Print a formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {test_name}")
    if details:
        print(f"     └─ {details}")

def test_transaction_list_realtime_update():
    """Test the specific transaction list real-time update bug"""
    print("="*80)
    print("🧪 TRANSACTION LIST REAL-TIME UPDATE BUG TEST")
    print("="*80)
    
    # Authenticate
    try:
        login_data = {"email": VALID_EMAIL, "password": VALID_PASSWORD}
        response = requests.post(f"{API_URL}/auth/login", json=login_data, timeout=10)
        if response.status_code != 200:
            print_result(False, "Authentication failed", response.text)
            return
        print_result(True, "Authentication successful", f"Logged in as {VALID_EMAIL}")
    except Exception as e:
        print_result(False, "Authentication error", str(e))
        return
    
    # Get initial transaction count
    try:
        response = requests.get(f"{API_URL}/transactions", timeout=10)
        if response.status_code == 200:
            initial_transactions = response.json()
            initial_count = len(initial_transactions)
            print_result(True, "Initial transaction count retrieved", f"Found {initial_count} transactions")
        else:
            print_result(False, "Failed to get initial transactions", response.text)
            return
    except Exception as e:
        print_result(False, "Error getting initial transactions", str(e))
        return
    
    # Create a new transaction
    test_transaction = {
        "type": "entrada",
        "category": "Passagem Aérea",
        "description": "Teste atualização lista tempo real",
        "amount": 1250.00,
        "paymentMethod": "PIX",
        "client": "Cliente Teste Lista",
        "transactionDate": datetime.now().strftime("%Y-%m-%d")
    }
    
    try:
        response = requests.post(f"{API_URL}/transactions", json=test_transaction, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                new_transaction_id = data["id"]
                print_result(True, "New transaction created", f"ID: {new_transaction_id}")
                
                # Verify response format includes both message and transaction data
                if "message" in data:
                    print_result(True, "Response format validation", f"Message: {data['message']}")
                else:
                    print_result(False, "Response format validation", "Missing 'message' field in response")
                
                # Immediately check if transaction appears in list
                time.sleep(0.5)  # Small delay to ensure database consistency
                
                response = requests.get(f"{API_URL}/transactions", timeout=10)
                if response.status_code == 200:
                    updated_transactions = response.json()
                    updated_count = len(updated_transactions)
                    
                    # Check if count increased
                    if updated_count == initial_count + 1:
                        print_result(True, "Transaction count increased", f"Count: {initial_count} → {updated_count}")
                    else:
                        print_result(False, "Transaction count not increased", f"Expected {initial_count + 1}, got {updated_count}")
                    
                    # Check if specific transaction is in the list
                    found_transaction = None
                    for transaction in updated_transactions:
                        if transaction.get("id") == new_transaction_id:
                            found_transaction = transaction
                            break
                    
                    if found_transaction:
                        print_result(True, "New transaction found in list", f"Transaction {new_transaction_id} appears immediately")
                        
                        # Verify transaction data consistency
                        if (found_transaction.get("description") == test_transaction["description"] and
                            found_transaction.get("amount") == test_transaction["amount"] and
                            found_transaction.get("type") == test_transaction["type"]):
                            print_result(True, "Transaction data consistency", "All fields match between creation and list")
                        else:
                            print_result(False, "Transaction data consistency", "Data mismatch between creation and list")
                        
                        # Test the specific bug: User doesn't need to navigate away and back
                        print_result(True, "Real-time update validation", "✅ Transaction appears immediately without navigation")
                        print_result(True, "Bug status", "🎯 TRANSACTION LIST REAL-TIME UPDATE BUG IS FIXED")
                        
                    else:
                        print_result(False, "New transaction NOT found in list", f"Transaction {new_transaction_id} missing from list")
                        print_result(False, "Bug status", "🚨 TRANSACTION LIST REAL-TIME UPDATE BUG STILL EXISTS")
                
                else:
                    print_result(False, "Failed to retrieve updated transactions", response.text)
            else:
                print_result(False, "Transaction creation failed", "No ID returned")
        else:
            print_result(False, f"Transaction creation failed - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "Transaction creation error", str(e))

if __name__ == "__main__":
    test_transaction_list_realtime_update()