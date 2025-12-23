from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI(title="VitalSync AI - Healthcare Portal")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    created_at: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None

class DoctorResponse(BaseModel):
    id: str
    name: str
    specialty: str
    experience_years: int
    rating: float
    image_url: str
    available_days: List[str]
    consultation_fee: float
    bio: str

class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time: str
    reason: str
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    doctor_name: str
    doctor_specialty: str
    date: str
    time: str
    reason: str
    notes: Optional[str] = None
    status: str
    created_at: str

class MedicalRecordCreate(BaseModel):
    title: str
    record_type: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    date: str

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    title: str
    record_type: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    date: str
    created_at: str

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ============== AUTH HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============== SEED DATA ==============

DOCTORS = [
    {
        "id": "doc-001",
        "name": "Dr. Sarah Mitchell",
        "specialty": "General Medicine",
        "experience_years": 12,
        "rating": 4.9,
        "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
        "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "consultation_fee": 75.00,
        "bio": "Board-certified physician with expertise in preventive care and chronic disease management."
    },
    {
        "id": "doc-002",
        "name": "Dr. James Chen",
        "specialty": "Cardiology",
        "experience_years": 15,
        "rating": 4.8,
        "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
        "available_days": ["Monday", "Wednesday", "Friday"],
        "consultation_fee": 150.00,
        "bio": "Leading cardiologist specializing in heart health, prevention, and advanced cardiac care."
    },
    {
        "id": "doc-003",
        "name": "Dr. Emily Rodriguez",
        "specialty": "Dermatology",
        "experience_years": 8,
        "rating": 4.7,
        "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
        "available_days": ["Tuesday", "Thursday", "Saturday"],
        "consultation_fee": 120.00,
        "bio": "Specialist in skin conditions, cosmetic dermatology, and preventive skin care."
    },
    {
        "id": "doc-004",
        "name": "Dr. Michael Thompson",
        "specialty": "Orthopedics",
        "experience_years": 18,
        "rating": 4.9,
        "image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
        "available_days": ["Monday", "Tuesday", "Thursday", "Friday"],
        "consultation_fee": 140.00,
        "bio": "Expert orthopedic surgeon specializing in sports injuries and joint replacement."
    },
    {
        "id": "doc-005",
        "name": "Dr. Lisa Patel",
        "specialty": "Pediatrics",
        "experience_years": 10,
        "rating": 4.8,
        "image_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400",
        "available_days": ["Monday", "Wednesday", "Thursday", "Saturday"],
        "consultation_fee": 85.00,
        "bio": "Compassionate pediatrician dedicated to children's health from infancy through adolescence."
    },
    {
        "id": "doc-006",
        "name": "Dr. Robert Kim",
        "specialty": "Neurology",
        "experience_years": 14,
        "rating": 4.7,
        "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400",
        "available_days": ["Tuesday", "Wednesday", "Friday"],
        "consultation_fee": 175.00,
        "bio": "Neurologist with expertise in brain disorders, headaches, and neurological conditions."
    }
]

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "date_of_birth": user_data.date_of_birth,
        "gender": user_data.gender,
        "address": user_data.address,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        date_of_birth=user_data.date_of_birth,
        gender=user_data.gender,
        address=user_data.address,
        created_at=user_doc["created_at"]
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        date_of_birth=user.get("date_of_birth"),
        gender=user.get("gender"),
        address=user.get("address"),
        created_at=user["created_at"]
    )
    
    return TokenResponse(access_token=token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
    return UserResponse(**updated_user)

# ============== DOCTORS ROUTES ==============

@api_router.get("/doctors", response_model=List[DoctorResponse])
async def get_doctors(specialty: Optional[str] = None):
    doctors = DOCTORS
    if specialty:
        doctors = [d for d in doctors if d["specialty"].lower() == specialty.lower()]
    return [DoctorResponse(**d) for d in doctors]

@api_router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(doctor_id: str):
    doctor = next((d for d in DOCTORS if d["id"] == doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return DoctorResponse(**doctor)

# ============== APPOINTMENTS ROUTES ==============

@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate, 
    current_user: dict = Depends(get_current_user)
):
    doctor = next((d for d in DOCTORS if d["id"] == appointment_data.doctor_id), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    appointment_id = str(uuid.uuid4())
    appointment_doc = {
        "id": appointment_id,
        "patient_id": current_user["id"],
        "doctor_id": appointment_data.doctor_id,
        "doctor_name": doctor["name"],
        "doctor_specialty": doctor["specialty"],
        "date": appointment_data.date,
        "time": appointment_data.time,
        "reason": appointment_data.reason,
        "notes": appointment_data.notes,
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.appointments.insert_one(appointment_doc)
    return AppointmentResponse(**appointment_doc)

@api_router.get("/appointments", response_model=List[AppointmentResponse])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    appointments = await db.appointments.find(
        {"patient_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("date", -1).to_list(100)
    return [AppointmentResponse(**a) for a in appointments]

@api_router.delete("/appointments/{appointment_id}")
async def cancel_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.appointments.update_one(
        {"id": appointment_id, "patient_id": current_user["id"]},
        {"$set": {"status": "cancelled"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment cancelled successfully"}

# ============== MEDICAL RECORDS ROUTES ==============

@api_router.post("/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    current_user: dict = Depends(get_current_user)
):
    record_id = str(uuid.uuid4())
    record_doc = {
        "id": record_id,
        "patient_id": current_user["id"],
        "title": record_data.title,
        "record_type": record_data.record_type,
        "description": record_data.description,
        "file_url": record_data.file_url,
        "date": record_data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.medical_records.insert_one(record_doc)
    return MedicalRecordResponse(**record_doc)

@api_router.get("/medical-records", response_model=List[MedicalRecordResponse])
async def get_medical_records(current_user: dict = Depends(get_current_user)):
    records = await db.medical_records.find(
        {"patient_id": current_user["id"]},
        {"_id": 0}
    ).sort("date", -1).to_list(100)
    return [MedicalRecordResponse(**r) for r in records]

@api_router.delete("/medical-records/{record_id}")
async def delete_medical_record(record_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.medical_records.delete_one(
        {"id": record_id, "patient_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted successfully"}

# ============== AI HEALTH ASSISTANT ROUTES ==============

@api_router.post("/ai/chat", response_model=ChatResponse)
async def ai_health_chat(
    chat_message: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        session_id = f"health-chat-{current_user['id']}"
        
        system_message = """You are VitalSync AI, a helpful healthcare assistant. You provide general health information, wellness tips, and guidance. 

IMPORTANT GUIDELINES:
1. Always recommend consulting a healthcare professional for medical advice
2. Never diagnose conditions or prescribe treatments
3. Provide evidence-based health information
4. Be empathetic and supportive
5. Encourage healthy lifestyle choices
6. If the user describes emergency symptoms, advise them to seek immediate medical attention

You can help with:
- General health questions
- Wellness and lifestyle tips
- Understanding symptoms (without diagnosis)
- Medication reminders and tips
- Mental health support and resources
- Nutrition and exercise guidance"""

        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=chat_message.message)
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_doc = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "user_message": chat_message.message,
            "ai_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_doc)
        
        return ChatResponse(
            response=response,
            timestamp=chat_doc["timestamp"]
        )
    except Exception as e:
        logger.error(f"AI Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@api_router.get("/ai/chat-history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    history = await db.chat_history.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    return history

# ============== DASHBOARD STATS ==============

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Count appointments
    total_appointments = await db.appointments.count_documents({"patient_id": current_user["id"]})
    upcoming_appointments = await db.appointments.count_documents({
        "patient_id": current_user["id"],
        "status": "scheduled"
    })
    
    # Count records
    total_records = await db.medical_records.count_documents({"patient_id": current_user["id"]})
    
    # Get recent appointments
    recent_appointments = await db.appointments.find(
        {"patient_id": current_user["id"]},
        {"_id": 0}
    ).sort("date", -1).to_list(5)
    
    return {
        "total_appointments": total_appointments,
        "upcoming_appointments": upcoming_appointments,
        "total_records": total_records,
        "recent_appointments": recent_appointments
    }

# ============== ROOT ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "VitalSync AI Healthcare Portal API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
