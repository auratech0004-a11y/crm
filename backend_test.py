import requests
import sys
from datetime import datetime
import json

class CRMHRSystemTester:
    def __init__(self, base_url="https://teamhq-manage.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.employee_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_employee_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_employee_login(self):
        """Test employee login"""
        success, response = self.run_test(
            "Employee Login",
            "POST", 
            "auth/login",
            200,
            data={"username": "auratech0001@gmail.com", "password": "123456"}
        )
        if success and 'token' in response:
            self.employee_token = response['token']
            return True
        return False

    def test_get_employees(self):
        """Test getting all employees"""
        success, response = self.run_test(
            "Get All Employees",
            "GET",
            "employees",
            200,
            token=self.admin_token
        )
        return success

    def test_create_employee(self):
        """Test creating a new employee with joining date"""
        employee_data = {
            "name": "Test Employee",
            "username": f"test_emp_{datetime.now().strftime('%H%M%S')}",
            "password": "testpass123",
            "email": "test@example.com",
            "phone": "0300-1234567",
            "department": "IT",
            "designation": "Software Developer",
            "salary": 50000,
            "role": "EMPLOYEE",
            "joining_date": "2024-01-15"
        }
        
        success, response = self.run_test(
            "Create Employee with Joining Date",
            "POST",
            "employees",
            200,
            data=employee_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            self.created_employee_id = response['id']
            # Verify joining date was saved
            if response.get('joining_date') == "2024-01-15":
                self.log_test("Joining Date Field Saved", True)
            else:
                self.log_test("Joining Date Field Saved", False, "Joining date not saved correctly")
        
        return success

    def test_get_fines(self):
        """Test getting fines"""
        success, response = self.run_test(
            "Get Fines",
            "GET",
            "fines",
            200,
            token=self.admin_token
        )
        return success

    def test_create_fine(self):
        """Test creating a fine"""
        if not self.created_employee_id:
            self.log_test("Create Fine", False, "No employee ID available")
            return False
            
        fine_data = {
            "employee_id": self.created_employee_id,
            "amount": 500,
            "reason": "Late arrival",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "status": "Unpaid"
        }
        
        success, response = self.run_test(
            "Create Fine",
            "POST",
            "fines",
            200,
            data=fine_data,
            token=self.admin_token
        )
        return success

    def test_get_attendance(self):
        """Test getting attendance records"""
        success, response = self.run_test(
            "Get Attendance",
            "GET",
            "attendance",
            200,
            token=self.admin_token
        )
        return success

    def test_check_in(self):
        """Test employee check-in"""
        success, response = self.run_test(
            "Employee Check-in",
            "POST",
            "attendance/check-in",
            200,
            data={"method": "Manual", "location": {"address": "Test Location"}},
            token=self.employee_token
        )
        return success

    def test_get_leaves(self):
        """Test getting leave requests"""
        success, response = self.run_test(
            "Get Leave Requests",
            "GET",
            "leaves",
            200,
            token=self.admin_token
        )
        return success

    def test_create_leave(self):
        """Test creating a leave request"""
        if not self.created_employee_id:
            self.log_test("Create Leave Request", False, "No employee ID available")
            return False
            
        leave_data = {
            "employee_id": self.created_employee_id,
            "employee_name": "Test Employee",
            "type": "Annual",
            "start_date": "2024-12-25",
            "end_date": "2024-12-26",
            "reason": "Christmas holidays",
            "status": "Pending"
        }
        
        success, response = self.run_test(
            "Create Leave Request",
            "POST",
            "leaves",
            200,
            data=leave_data,
            token=self.admin_token
        )
        return success

    def test_get_appeals(self):
        """Test getting appeals"""
        success, response = self.run_test(
            "Get Appeals",
            "GET",
            "appeals",
            200,
            token=self.admin_token
        )
        return success

    def test_get_payroll(self):
        """Test getting payroll data"""
        success, response = self.run_test(
            "Get Payroll",
            "GET",
            "payroll",
            200,
            token=self.admin_token
        )
        return success

    def test_process_payroll(self):
        """Test payroll processing"""
        success, response = self.run_test(
            "Process Payroll",
            "POST",
            "payroll/process",
            200,
            data={"month": "12", "year": "2024"},
            token=self.admin_token
        )
        return success

    def test_get_leads(self):
        """Test getting leads"""
        success, response = self.run_test(
            "Get Leads",
            "GET",
            "leads",
            200,
            token=self.admin_token
        )
        return success

    def test_lead_permissions(self):
        """Test lead permissions"""
        if not self.created_employee_id:
            self.log_test("Test Lead Permissions", False, "No employee ID available")
            return False
            
        # First get permissions
        success1, response1 = self.run_test(
            "Get Lead Permissions",
            "GET",
            f"lead-permissions/{self.created_employee_id}",
            200,
            token=self.admin_token
        )
        
        # Then update permissions
        success2, response2 = self.run_test(
            "Update Lead Permissions",
            "PUT",
            f"lead-permissions/{self.created_employee_id}",
            200,
            data={"modules": ["dashboard", "attendance", "leave"]},
            token=self.admin_token
        )
        
        return success1 and success2

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )
        return success

    def test_settings(self):
        """Test settings endpoints"""
        # Get settings
        success1, response1 = self.run_test(
            "Get Settings",
            "GET",
            "settings",
            200,
            token=self.admin_token
        )
        
        # Update settings
        success2, response2 = self.run_test(
            "Update Settings",
            "PUT",
            "settings",
            200,
            data={"office_start_time": "09:00", "late_fine_amount": 150},
            token=self.admin_token
        )
        
        return success1 and success2

def main():
    print("🚀 Starting CRM HR System Backend API Testing...")
    print("=" * 60)
    
    tester = CRMHRSystemTester()
    
    # Test authentication first
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    if not tester.test_employee_login():
        print("⚠️ Employee login failed, continuing with admin tests only")
    
    # Test employee management
    print("\n👥 EMPLOYEE MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_get_employees()
    tester.test_create_employee()
    
    # Test fines management
    print("\n💰 FINES MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_get_fines()
    tester.test_create_fine()
    
    # Test attendance
    print("\n⏰ ATTENDANCE TESTS")
    print("-" * 30)
    tester.test_get_attendance()
    if tester.employee_token:
        tester.test_check_in()
    
    # Test leave management
    print("\n🏖️ LEAVE MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_get_leaves()
    tester.test_create_leave()
    
    # Test appeals
    print("\n📝 APPEALS TESTS")
    print("-" * 30)
    tester.test_get_appeals()
    
    # Test payroll
    print("\n💵 PAYROLL TESTS")
    print("-" * 30)
    tester.test_get_payroll()
    tester.test_process_payroll()
    
    # Test lead management
    print("\n👑 LEAD MANAGEMENT TESTS")
    print("-" * 30)
    tester.test_get_leads()
    tester.test_lead_permissions()
    
    # Test dashboard and settings
    print("\n📊 DASHBOARD & SETTINGS TESTS")
    print("-" * 30)
    tester.test_dashboard_stats()
    tester.test_settings()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100,
            "test_details": tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())