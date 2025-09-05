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
VALID_EMAIL = "rorigo@risetravel.com.br"
VALID_PASSWORD = "Emily2030*"
INVALID_EMAIL = "invalid@test.com"
INVALID_PASSWORD = "wrongpassword"

# Global token storage
auth_token = None

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
            if "message" in data and "AgentePro" in data["message"]:
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
    """Test report endpoints"""
    print_test_header("Reports")
    
    # Test 1: POST /api/reports/export/pdf
    try:
        response = requests.post(f"{API_URL}/reports/export/pdf", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/pdf - PDF export initiated", data.get("message"))
            else:
                print_result(False, "POST /api/reports/export/pdf - Export failed", data)
        else:
            print_result(False, f"POST /api/reports/export/pdf - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/pdf - Request failed", str(e))
    
    # Test 2: POST /api/reports/export/excel
    try:
        response = requests.post(f"{API_URL}/reports/export/excel", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print_result(True, "POST /api/reports/export/excel - Excel export initiated", data.get("message"))
            else:
                print_result(False, "POST /api/reports/export/excel - Export failed", data)
        else:
            print_result(False, f"POST /api/reports/export/excel - HTTP {response.status_code}", response.text)
    except Exception as e:
        print_result(False, "POST /api/reports/export/excel - Request failed", str(e))

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

def run_all_tests():
    """Run all test suites"""
    print(f"\n🚀 Starting AgentePro Backend API Tests")
    print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 API Base URL: {API_URL}")
    
    # Run test suites
    test_api_connectivity()
    test_authentication()
    test_transactions()
    test_reports()
    test_users_api()  # Added comprehensive user API testing
    test_jwt_validation()
    
    print(f"\n{'='*60}")
    print("🏁 All tests completed!")
    print(f"{'='*60}")

if __name__ == "__main__":
    run_all_tests()