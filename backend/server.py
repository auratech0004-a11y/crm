from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = "ar_hrms_secret_key_2024"
security = HTTPBearer(auto_error=False)

app = FastAPI(title="CRM A.R HR System API")
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class EmployeeBase(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: str
    salary: float = 0
    role: str = "EMPLOYEE"
    status: str = "active"
    joining_date: Optional[str] = None
    profile_pic: Optional[str] = None
    employee_id: Optional[str] = None
    lead_id: Optional[str] = None
    allowed_modules: Optional[List[str]] = None

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    salary: Optional[float] = None
    role: Optional[str] = None
    status: Optional[str] = None
    profile_pic: Optional[str] = None
    employee_id: Optional[str] = None
    lead_id: Optional[str] = None
    allowed_modules: Optional[List[str]] = None

class Employee(EmployeeBase):
    id: str
    created_at: str

class LoginRequest(BaseModel):
    username: str
    password: str

class AttendanceBase(BaseModel):
    employee_id: str
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str = "Present"
    method: str = "Manual"
    location: Optional[dict] = None
    working_hours: Optional[float] = None
    is_late: bool = False
    is_early_out: bool = False

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: str

class LeaveBase(BaseModel):
    employee_id: str
    employee_name: str
    type: str
    start_date: str
    end_date: str
    reason: str
    status: str = "Pending"
    request_date: Optional[str] = None

class LeaveCreate(LeaveBase):
    pass

class Leave(LeaveBase):
    id: str

class FineBase(BaseModel):
    employee_id: str
    amount: float
    reason: str
    date: str
    status: str = "Unpaid"

class FineCreate(FineBase):
    pass

class Fine(FineBase):
    id: str

class AppealBase(BaseModel):
    employee_id: str
    employee_name: str
    type: str
    reason: str
    message: str
    status: str = "Pending"
    date: str
    appeal_date: str
    related_id: Optional[str] = None

class AppealCreate(AppealBase):
    pass

class Appeal(AppealBase):
    id: str

class PayrollStatus(BaseModel):
    employee_id: str
    status: str
    month: str
    year: str
    base_salary: float = 0
    deductions: float = 0
    net_salary: float = 0

class SettingsBase(BaseModel):
    office_start_time: str = "09:00"
    office_end_time: str = "18:00"
    late_fine_amount: float = 100
    half_day_hours: float = 4
    leave_policy: dict = {}
    salary_settings: dict = {}

class LeadPermissions(BaseModel):
    lead_id: str
    modules: List[str]

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user = await db.employees.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== INIT DEFAULT DATA ==============

async def init_default_data():
    # Check if admin exists
    admin = await db.employees.find_one({"username": "admin"})
    if not admin:
        default_admin = {
            "id": str(uuid.uuid4()),
            "name": "A.R HR Admin",
            "username": "admin",
            "password": hash_password("123"),
            "email": "admin@arhr.com",
            "phone": "",
            "department": "Administration",
            "designation": "Super Admin",
            "salary": 0,
            "role": "ADMIN",
            "status": "active",
            "joining_date": "2023-01-01",
            "profile_pic": None,
            "employee_id": "ADMIN-001",
            "lead_id": None,
            "allowed_modules": ["dashboard", "employees", "attendance", "leave", "fines", "payroll", "settings", "lead", "appeals"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.employees.insert_one(default_admin)
        
        # Add sample employees
        sample_employees = [
            {
                "id": str(uuid.uuid4()),
                "name": "Babar Azam",
                "username": "babar",
                "password": hash_password("12345678"),
                "email": "babar@arhr.com",
                "phone": "0300-1234567",
                "department": "Design",
                "designation": "Graphic Designer",
                "salary": 45000,
                "role": "EMPLOYEE",
                "status": "active",
                "joining_date": "2024-01-15",
                "profile_pic": None,
                "employee_id": "EMP-001",
                "lead_id": None,
                "allowed_modules": ["dashboard", "attendance", "leave", "fines", "salary"],
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Sara Ahmed",
                "username": "sara",
                "password": hash_password("12345678"),
                "email": "sara@arhr.com",
                "phone": "0301-2345678",
                "department": "Design",
                "designation": "UI/UX Designer",
                "salary": 55000,
                "role": "EMPLOYEE",
                "status": "active",
                "joining_date": "2024-02-01",
                "profile_pic": None,
                "employee_id": "EMP-002",
                "lead_id": None,
                "allowed_modules": ["dashboard", "attendance", "leave", "fines", "salary"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        for emp in sample_employees:
            await db.employees.insert_one(emp)
        
        # Initialize settings
        default_settings = {
            "id": "settings",
            "office_start_time": "09:00",
            "office_end_time": "18:00",
            "late_fine_amount": 100,
            "half_day_hours": 4,
            "leave_policy": {
                "annual": 12,
                "sick": 10,
                "bereavement": 5,
                "wedding": 7
            },
            "salary_settings": {}
        }
        await db.settings.insert_one(default_settings)

# ============== AUTH ROUTES ==============

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    user = await db.employees.find_one({"username": request.username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user["password"] != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["role"])
    user_response = {k: v for k, v in user.items() if k != "password"}
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}

@api_router.post("/auth/change-password")
async def change_password(data: dict, current_user: dict = Depends(get_current_user)):
    new_password = data.get("new_password")
    if not new_password or len(new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    await db.employees.update_one(
        {"id": current_user["id"]},
        {"$set": {"password": hash_password(new_password)}}
    )
    return {"message": "Password changed successfully"}

# ============== EMPLOYEE ROUTES ==============

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(current_user: dict = Depends(get_current_user)):
    employees = await db.employees.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return employees

@api_router.get("/employees/{employee_id}")
async def get_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0, "password": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can create employees")
    
    existing = await db.employees.find_one({"username": employee.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    emp_dict = employee.model_dump()
    emp_dict["id"] = str(uuid.uuid4())
    emp_dict["password"] = hash_password(emp_dict["password"])
    emp_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    emp_dict["joining_date"] = emp_dict.get("joining_date") or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    await db.employees.insert_one(emp_dict)
    del emp_dict["password"]
    return emp_dict

@api_router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, update: EmployeeUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN" and current_user["id"] != employee_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update.model_dump().items() if v is not None}
    if "password" in update_dict:
        update_dict["password"] = hash_password(update_dict["password"])
    
    if update_dict:
        await db.employees.update_one({"id": employee_id}, {"$set": update_dict})
    
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0, "password": 0})
    return employee

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can delete employees")
    
    result = await db.employees.delete_one({"id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

# ============== ATTENDANCE ROUTES ==============

@api_router.get("/attendance")
async def get_attendance(
    employee_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if date:
        query["date"] = date
    
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    attendance = await db.attendance.find(query, {"_id": 0}).to_list(1000)
    return attendance

@api_router.post("/attendance")
async def create_attendance(attendance: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    att_dict = attendance.model_dump()
    att_dict["id"] = str(uuid.uuid4())
    
    # Check if already checked in today
    existing = await db.attendance.find_one({
        "employee_id": att_dict["employee_id"],
        "date": att_dict["date"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    await db.attendance.insert_one(att_dict)
    return {k: v for k, v in att_dict.items() if k != "_id"}

@api_router.put("/attendance/{attendance_id}")
async def update_attendance(attendance_id: str, update: dict, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.items() if v is not None and k != "id"}
    
    if update_data:
        await db.attendance.update_one({"id": attendance_id}, {"$set": update_data})
    
    attendance = await db.attendance.find_one({"id": attendance_id}, {"_id": 0})
    return attendance

@api_router.post("/attendance/check-in")
async def check_in(data: dict, current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now = datetime.now(timezone.utc).strftime("%H:%M")
    
    existing = await db.attendance.find_one({
        "employee_id": current_user["id"],
        "date": today
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    settings = await db.settings.find_one({"id": "settings"})
    office_start = settings.get("office_start_time", "09:00") if settings else "09:00"
    is_late = now > office_start
    
    att_dict = {
        "id": str(uuid.uuid4()),
        "employee_id": current_user["id"],
        "date": today,
        "check_in": now,
        "check_out": None,
        "status": "Late" if is_late else "Present",
        "method": data.get("method", "Manual"),
        "location": data.get("location"),
        "is_late": is_late,
        "is_early_out": False,
        "working_hours": None
    }
    
    await db.attendance.insert_one(att_dict)
    return {k: v for k, v in att_dict.items() if k != "_id"}

@api_router.post("/attendance/check-out")
async def check_out(data: dict, current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now = datetime.now(timezone.utc).strftime("%H:%M")
    
    attendance = await db.attendance.find_one({
        "employee_id": current_user["id"],
        "date": today
    })
    if not attendance:
        raise HTTPException(status_code=400, detail="No check-in record found")
    if attendance.get("check_out"):
        raise HTTPException(status_code=400, detail="Already checked out")
    
    # Calculate working hours
    check_in_time = attendance["check_in"]
    check_in_parts = check_in_time.split(":")
    check_out_parts = now.split(":")
    hours_worked = (int(check_out_parts[0]) - int(check_in_parts[0])) + (int(check_out_parts[1]) - int(check_in_parts[1])) / 60
    
    settings = await db.settings.find_one({"id": "settings"})
    office_end = settings.get("office_end_time", "18:00") if settings else "18:00"
    is_early = now < office_end
    
    await db.attendance.update_one(
        {"id": attendance["id"]},
        {"$set": {
            "check_out": now,
            "working_hours": round(hours_worked, 2),
            "is_early_out": is_early
        }}
    )
    
    updated = await db.attendance.find_one({"id": attendance["id"]}, {"_id": 0})
    return updated

# ============== LEAVE ROUTES ==============

@api_router.get("/leaves")
async def get_leaves(
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if status:
        query["status"] = status
    
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    leaves = await db.leaves.find(query, {"_id": 0}).to_list(1000)
    return leaves

@api_router.post("/leaves")
async def create_leave(leave: LeaveCreate, current_user: dict = Depends(get_current_user)):
    leave_dict = leave.model_dump()
    leave_dict["id"] = str(uuid.uuid4())
    leave_dict["request_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    await db.leaves.insert_one(leave_dict)
    return {k: v for k, v in leave_dict.items() if k != "_id"}

@api_router.put("/leaves/{leave_id}")
async def update_leave(leave_id: str, update: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN" and current_user["role"] != "LEAD":
        # Employees can only cancel pending leaves
        leave = await db.leaves.find_one({"id": leave_id})
        if leave["employee_id"] != current_user["id"] or leave["status"] != "Pending":
            raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.items() if v is not None}
    await db.leaves.update_one({"id": leave_id}, {"$set": update_data})
    
    leave = await db.leaves.find_one({"id": leave_id}, {"_id": 0})
    return leave

@api_router.delete("/leaves/{leave_id}")
async def delete_leave(leave_id: str, current_user: dict = Depends(get_current_user)):
    leave = await db.leaves.find_one({"id": leave_id})
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    if current_user["role"] != "ADMIN":
        if leave["employee_id"] != current_user["id"] or leave["status"] != "Pending":
            raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.leaves.delete_one({"id": leave_id})
    return {"message": "Leave deleted"}

# ============== FINE ROUTES ==============

@api_router.get("/fines")
async def get_fines(
    employee_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    fines = await db.fines.find(query, {"_id": 0}).to_list(1000)
    return fines

@api_router.post("/fines")
async def create_fine(fine: FineCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can create fines")
    
    fine_dict = fine.model_dump()
    fine_dict["id"] = str(uuid.uuid4())
    
    await db.fines.insert_one(fine_dict)
    return {k: v for k, v in fine_dict.items() if k != "_id"}

@api_router.put("/fines/{fine_id}")
async def update_fine(fine_id: str, update: dict, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in update.items() if v is not None}
    await db.fines.update_one({"id": fine_id}, {"$set": update_data})
    
    fine = await db.fines.find_one({"id": fine_id}, {"_id": 0})
    return fine

@api_router.delete("/fines/{fine_id}")
async def delete_fine(fine_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can delete fines")
    
    await db.fines.delete_one({"id": fine_id})
    return {"message": "Fine deleted"}

# ============== APPEAL ROUTES ==============

@api_router.get("/appeals")
async def get_appeals(
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if status:
        query["status"] = status
    
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    appeals = await db.appeals.find(query, {"_id": 0}).to_list(1000)
    return appeals

@api_router.post("/appeals")
async def create_appeal(appeal: AppealCreate, current_user: dict = Depends(get_current_user)):
    appeal_dict = appeal.model_dump()
    appeal_dict["id"] = str(uuid.uuid4())
    
    await db.appeals.insert_one(appeal_dict)
    return {k: v for k, v in appeal_dict.items() if k != "_id"}

@api_router.put("/appeals/{appeal_id}")
async def update_appeal(appeal_id: str, update: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN" and current_user["role"] != "LEAD":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in update.items() if v is not None}
    await db.appeals.update_one({"id": appeal_id}, {"$set": update_data})
    
    appeal = await db.appeals.find_one({"id": appeal_id}, {"_id": 0})
    return appeal

# ============== PAYROLL ROUTES ==============

@api_router.get("/payroll")
async def get_payroll(
    month: Optional[str] = None,
    year: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if month:
        query["month"] = month
    if year:
        query["year"] = year
    
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    payroll = await db.payroll.find(query, {"_id": 0}).to_list(1000)
    return payroll

@api_router.post("/payroll/process")
async def process_payroll(data: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can process payroll")
    
    month = data.get("month", datetime.now(timezone.utc).strftime("%m"))
    year = data.get("year", datetime.now(timezone.utc).strftime("%Y"))
    
    employees = await db.employees.find({"role": "EMPLOYEE"}, {"_id": 0}).to_list(1000)
    
    for emp in employees:
        # Get fines for this employee
        fines = await db.fines.find({
            "employee_id": emp["id"],
            "status": "Unpaid"
        }, {"_id": 0}).to_list(100)
        total_fines = sum(f["amount"] for f in fines)
        
        # Get leave deductions
        leaves = await db.leaves.find({
            "employee_id": emp["id"],
            "status": "Approved"
        }, {"_id": 0}).to_list(100)
        
        base_salary = emp.get("salary", 0)
        deductions = total_fines
        net_salary = base_salary - deductions
        
        payroll_record = {
            "id": str(uuid.uuid4()),
            "employee_id": emp["id"],
            "month": month,
            "year": year,
            "base_salary": base_salary,
            "deductions": deductions,
            "net_salary": net_salary,
            "status": "Paid"
        }
        
        # Update or insert payroll record
        await db.payroll.update_one(
            {"employee_id": emp["id"], "month": month, "year": year},
            {"$set": payroll_record},
            upsert=True
        )
        
        # Mark fines as paid
        await db.fines.update_many(
            {"employee_id": emp["id"], "status": "Unpaid"},
            {"$set": {"status": "Paid"}}
        )
    
    return {"message": "Payroll processed successfully"}

@api_router.get("/payroll/status")
async def get_payroll_status(current_user: dict = Depends(get_current_user)):
    month = datetime.now(timezone.utc).strftime("%m")
    year = datetime.now(timezone.utc).strftime("%Y")
    
    query = {"month": month, "year": year}
    if current_user["role"] == "EMPLOYEE":
        query["employee_id"] = current_user["id"]
    
    payroll = await db.payroll.find(query, {"_id": 0}).to_list(1000)
    status_dict = {p["employee_id"]: p["status"] for p in payroll}
    return status_dict

# ============== SETTINGS ROUTES ==============

@api_router.get("/settings")
async def get_settings(current_user: dict = Depends(get_current_user)):
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return settings or {}

@api_router.put("/settings")
async def update_settings(update: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can update settings")
    
    update_data = {k: v for k, v in update.items() if v is not None}
    await db.settings.update_one({"id": "settings"}, {"$set": update_data}, upsert=True)
    
    settings = await db.settings.find_one({"id": "settings"}, {"_id": 0})
    return settings

# ============== LEAD ROUTES ==============

@api_router.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    leads = await db.employees.find({"role": "LEAD"}, {"_id": 0, "password": 0}).to_list(100)
    return leads

@api_router.get("/lead-permissions/{lead_id}")
async def get_lead_permissions(lead_id: str, current_user: dict = Depends(get_current_user)):
    permissions = await db.lead_permissions.find_one({"lead_id": lead_id}, {"_id": 0})
    return permissions or {"lead_id": lead_id, "modules": []}

@api_router.put("/lead-permissions/{lead_id}")
async def update_lead_permissions(lead_id: str, update: dict, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Only admin can update lead permissions")
    
    await db.lead_permissions.update_one(
        {"lead_id": lead_id},
        {"$set": {"lead_id": lead_id, "modules": update.get("modules", [])}},
        upsert=True
    )
    
    permissions = await db.lead_permissions.find_one({"lead_id": lead_id}, {"_id": 0})
    return permissions

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Total employees
    total_employees = await db.employees.count_documents({"role": "EMPLOYEE"})
    
    # Present today
    present_today = await db.attendance.count_documents({"date": today, "status": {"$in": ["Present", "Late"]}})
    
    # Absent today
    absent_today = total_employees - present_today
    
    # Pending leaves
    pending_leaves = await db.leaves.count_documents({"status": "Pending"})
    
    # On leave today
    on_leave = await db.leaves.count_documents({
        "status": "Approved",
        "start_date": {"$lte": today},
        "end_date": {"$gte": today}
    })
    
    # Total fines
    fines_cursor = await db.fines.find({"status": "Unpaid"}, {"_id": 0}).to_list(1000)
    total_fines = sum(f["amount"] for f in fines_cursor)
    
    # Monthly payroll
    employees = await db.employees.find({"role": "EMPLOYEE"}, {"_id": 0}).to_list(1000)
    monthly_payroll = sum(e.get("salary", 0) for e in employees)
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "pending_leaves": pending_leaves,
        "on_leave": on_leave,
        "total_fines": total_fines,
        "monthly_payroll": monthly_payroll
    }

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "CRM A.R HR System API", "version": "1.0.0"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_default_data()
    logger.info("CRM A.R HR System API started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
