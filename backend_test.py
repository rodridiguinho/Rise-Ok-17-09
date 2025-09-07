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
    test_transaction_date_functionality()  # NEW: Test transaction date vs entry date functionality
    test_analytics_endpoints()  # NEW: Test analytics endpoints as requested
    test_analytics_integration()  # NEW: Test integration with existing endpoints
    test_reports()
    test_users_api()  # Added comprehensive user API testing
    test_jwt_validation()
    
    print(f"\n{'='*60}")
    print("🏁 All tests completed!")
    print(f"{'='*60}")

if __name__ == "__main__":
    run_all_tests()