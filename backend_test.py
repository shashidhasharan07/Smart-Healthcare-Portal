#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class VitalSyncAPITester:
    def __init__(self, base_url="https://patientportal-30.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name, success, details="", endpoint=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": details
            })
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "endpoint": endpoint,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            
            success = response.status_code == expected_status
            return success, response
            
        except requests.exceptions.RequestException as e:
            return False, str(e)

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        success, response = self.make_request('GET', '', expected_status=200)
        if success:
            try:
                data = response.json()
                self.log_test("Root endpoint", True, f"Message: {data.get('message', 'N/A')}", "/")
            except:
                self.log_test("Root endpoint", False, "Invalid JSON response", "/")
        else:
            self.log_test("Root endpoint", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}", "/")

        # Test health endpoint
        success, response = self.make_request('GET', 'health', expected_status=200)
        if success:
            try:
                data = response.json()
                self.log_test("Health check", True, f"Status: {data.get('status', 'N/A')}", "/health")
            except:
                self.log_test("Health check", False, "Invalid JSON response", "/health")
        else:
            self.log_test("Health check", False, f"Status: {response.status_code if hasattr(response, 'status_code') else response}", "/health")

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        # Generate unique test user
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        test_user_data = {
            "email": f"test_user_{timestamp}@vitalsync.com",
            "password": "testpass123",
            "full_name": f"Test User {timestamp}",
            "phone": "+1234567890",
            "gender": "other"
        }

        success, response = self.make_request('POST', 'auth/register', test_user_data, expected_status=200)
        if success:
            try:
                data = response.json()
                self.token = data.get('access_token')
                self.user_id = data.get('user', {}).get('id')
                self.test_user_email = test_user_data['email']
                self.test_user_password = test_user_data['password']
                self.log_test("User registration", True, f"User ID: {self.user_id}", "/auth/register")
            except Exception as e:
                self.log_test("User registration", False, f"JSON parse error: {str(e)}", "/auth/register")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("User registration", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/auth/register")

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not hasattr(self, 'test_user_email'):
            self.log_test("User login", False, "No test user available", "/auth/login")
            return

        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }

        success, response = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        if success:
            try:
                data = response.json()
                self.token = data.get('access_token')  # Update token
                self.log_test("User login", True, f"Token received", "/auth/login")
            except Exception as e:
                self.log_test("User login", False, f"JSON parse error: {str(e)}", "/auth/login")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("User login", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/auth/login")

    def test_get_current_user(self):
        """Test get current user info"""
        print("\n🔍 Testing Get Current User...")
        
        if not self.token:
            self.log_test("Get current user", False, "No auth token available", "/auth/me")
            return

        success, response = self.make_request('GET', 'auth/me', expected_status=200)
        if success:
            try:
                data = response.json()
                self.log_test("Get current user", True, f"User: {data.get('full_name', 'N/A')}", "/auth/me")
            except Exception as e:
                self.log_test("Get current user", False, f"JSON parse error: {str(e)}", "/auth/me")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Get current user", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/auth/me")

    def test_doctors_endpoints(self):
        """Test doctors endpoints"""
        print("\n🔍 Testing Doctors Endpoints...")
        
        # Get all doctors
        success, response = self.make_request('GET', 'doctors', expected_status=200)
        if success:
            try:
                doctors = response.json()
                self.doctors_list = doctors
                self.log_test("Get all doctors", True, f"Found {len(doctors)} doctors", "/doctors")
                
                # Test get specific doctor
                if doctors:
                    doctor_id = doctors[0]['id']
                    success, response = self.make_request('GET', f'doctors/{doctor_id}', expected_status=200)
                    if success:
                        doctor_data = response.json()
                        self.log_test("Get specific doctor", True, f"Doctor: {doctor_data.get('name', 'N/A')}", f"/doctors/{doctor_id}")
                    else:
                        error_msg = response.text if hasattr(response, 'text') else str(response)
                        self.log_test("Get specific doctor", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", f"/doctors/{doctor_id}")
                
            except Exception as e:
                self.log_test("Get all doctors", False, f"JSON parse error: {str(e)}", "/doctors")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Get all doctors", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/doctors")

        # Test specialty filter
        success, response = self.make_request('GET', 'doctors?specialty=Cardiology', expected_status=200)
        if success:
            try:
                filtered_doctors = response.json()
                self.log_test("Filter doctors by specialty", True, f"Found {len(filtered_doctors)} cardiologists", "/doctors?specialty=Cardiology")
            except Exception as e:
                self.log_test("Filter doctors by specialty", False, f"JSON parse error: {str(e)}", "/doctors?specialty=Cardiology")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Filter doctors by specialty", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", "/doctors?specialty=Cardiology")

    def test_appointments_endpoints(self):
        """Test appointments endpoints"""
        print("\n🔍 Testing Appointments Endpoints...")
        
        if not self.token:
            self.log_test("Appointments test", False, "No auth token available", "/appointments")
            return

        # Get appointments (should be empty initially)
        success, response = self.make_request('GET', 'appointments', expected_status=200)
        if success:
            try:
                appointments = response.json()
                self.log_test("Get appointments", True, f"Found {len(appointments)} appointments", "/appointments")
            except Exception as e:
                self.log_test("Get appointments", False, f"JSON parse error: {str(e)}", "/appointments")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Get appointments", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", "/appointments")

        # Create appointment
        if hasattr(self, 'doctors_list') and self.doctors_list:
            doctor_id = self.doctors_list[0]['id']
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            appointment_data = {
                "doctor_id": doctor_id,
                "date": tomorrow,
                "time": "10:00 AM",
                "reason": "Test appointment",
                "notes": "This is a test appointment"
            }

            success, response = self.make_request('POST', 'appointments', appointment_data, expected_status=200)
            if success:
                try:
                    appointment = response.json()
                    self.test_appointment_id = appointment.get('id')
                    self.log_test("Create appointment", True, f"Appointment ID: {self.test_appointment_id}", "/appointments")
                except Exception as e:
                    self.log_test("Create appointment", False, f"JSON parse error: {str(e)}", "/appointments")
            else:
                error_msg = response.text if hasattr(response, 'text') else str(response)
                self.log_test("Create appointment", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/appointments")

    def test_medical_records_endpoints(self):
        """Test medical records endpoints"""
        print("\n🔍 Testing Medical Records Endpoints...")
        
        if not self.token:
            self.log_test("Medical records test", False, "No auth token available", "/medical-records")
            return

        # Get medical records (should be empty initially)
        success, response = self.make_request('GET', 'medical-records', expected_status=200)
        if success:
            try:
                records = response.json()
                self.log_test("Get medical records", True, f"Found {len(records)} records", "/medical-records")
            except Exception as e:
                self.log_test("Get medical records", False, f"JSON parse error: {str(e)}", "/medical-records")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Get medical records", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", "/medical-records")

        # Create medical record
        record_data = {
            "title": "Test Blood Work",
            "record_type": "lab_result",
            "description": "Test lab results for API testing",
            "date": datetime.now().strftime('%Y-%m-%d')
        }

        success, response = self.make_request('POST', 'medical-records', record_data, expected_status=200)
        if success:
            try:
                record = response.json()
                self.test_record_id = record.get('id')
                self.log_test("Create medical record", True, f"Record ID: {self.test_record_id}", "/medical-records")
            except Exception as e:
                self.log_test("Create medical record", False, f"JSON parse error: {str(e)}", "/medical-records")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Create medical record", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/medical-records")

    def test_ai_chat_endpoint(self):
        """Test AI chat endpoint"""
        print("\n🔍 Testing AI Chat Endpoint...")
        
        if not self.token:
            self.log_test("AI chat test", False, "No auth token available", "/ai/chat")
            return

        chat_data = {
            "message": "Hello, can you give me a simple health tip?"
        }

        success, response = self.make_request('POST', 'ai/chat', chat_data, expected_status=200)
        if success:
            try:
                chat_response = response.json()
                ai_response = chat_response.get('response', '')
                if ai_response and len(ai_response) > 10:  # Basic validation
                    self.log_test("AI chat", True, f"Response length: {len(ai_response)} chars", "/ai/chat")
                else:
                    self.log_test("AI chat", False, "Empty or too short AI response", "/ai/chat")
            except Exception as e:
                self.log_test("AI chat", False, f"JSON parse error: {str(e)}", "/ai/chat")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("AI chat", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/ai/chat")

        # Test chat history
        success, response = self.make_request('GET', 'ai/chat-history', expected_status=200)
        if success:
            try:
                history = response.json()
                self.log_test("Get chat history", True, f"Found {len(history)} messages", "/ai/chat-history")
            except Exception as e:
                self.log_test("Get chat history", False, f"JSON parse error: {str(e)}", "/ai/chat-history")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Get chat history", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", "/ai/chat-history")

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        print("\n🔍 Testing Dashboard Stats...")
        
        if not self.token:
            self.log_test("Dashboard stats test", False, "No auth token available", "/dashboard/stats")
            return

        success, response = self.make_request('GET', 'dashboard/stats', expected_status=200)
        if success:
            try:
                stats = response.json()
                required_fields = ['total_appointments', 'upcoming_appointments', 'total_records']
                missing_fields = [field for field in required_fields if field not in stats]
                
                if not missing_fields:
                    self.log_test("Dashboard stats", True, f"Stats: {stats}", "/dashboard/stats")
                else:
                    self.log_test("Dashboard stats", False, f"Missing fields: {missing_fields}", "/dashboard/stats")
            except Exception as e:
                self.log_test("Dashboard stats", False, f"JSON parse error: {str(e)}", "/dashboard/stats")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Dashboard stats", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'}", "/dashboard/stats")

    def test_profile_update(self):
        """Test profile update"""
        print("\n🔍 Testing Profile Update...")
        
        if not self.token:
            self.log_test("Profile update test", False, "No auth token available", "/auth/profile")
            return

        update_data = {
            "phone": "+1987654321",
            "address": "123 Test Street, Test City"
        }

        success, response = self.make_request('PUT', 'auth/profile', update_data, expected_status=200)
        if success:
            try:
                updated_user = response.json()
                self.log_test("Profile update", True, f"Updated phone: {updated_user.get('phone', 'N/A')}", "/auth/profile")
            except Exception as e:
                self.log_test("Profile update", False, f"JSON parse error: {str(e)}", "/auth/profile")
        else:
            error_msg = response.text if hasattr(response, 'text') else str(response)
            self.log_test("Profile update", False, f"Status: {response.status_code if hasattr(response, 'status_code') else 'Request failed'} - {error_msg}", "/auth/profile")

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Cancel test appointment if created
        if hasattr(self, 'test_appointment_id') and self.test_appointment_id:
            success, response = self.make_request('DELETE', f'appointments/{self.test_appointment_id}', expected_status=200)
            if success:
                self.log_test("Cancel test appointment", True, "", f"/appointments/{self.test_appointment_id}")
            else:
                self.log_test("Cancel test appointment", False, "Failed to cancel", f"/appointments/{self.test_appointment_id}")

        # Delete test medical record if created
        if hasattr(self, 'test_record_id') and self.test_record_id:
            success, response = self.make_request('DELETE', f'medical-records/{self.test_record_id}', expected_status=200)
            if success:
                self.log_test("Delete test record", True, "", f"/medical-records/{self.test_record_id}")
            else:
                self.log_test("Delete test record", False, "Failed to delete", f"/medical-records/{self.test_record_id}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting VitalSync API Tests...")
        print(f"🎯 Testing against: {self.base_url}")
        
        # Run tests in order
        self.test_health_check()
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_doctors_endpoints()
        self.test_appointments_endpoints()
        self.test_medical_records_endpoints()
        self.test_ai_chat_endpoint()
        self.test_dashboard_stats()
        self.test_profile_update()
        self.cleanup_test_data()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  • {test['test']} ({test['endpoint']}): {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.failed_tests,
            "success_rate": success_rate,
            "test_results": self.test_results
        }

def main():
    tester = VitalSyncAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["success_rate"] >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())