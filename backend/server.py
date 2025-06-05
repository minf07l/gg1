from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import base64
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Create uploads directory if it doesn't exist
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Define Models
class DatePair(BaseModel):
    text: str
    date: str

class DynamicFeature(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # 'text', 'img', 'number', etc.
    default_value: Any = None

class Olimpiad(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    level: str
    status: str  # 'upcoming', 'register_opened', 'ongoing', 'completed'
    avatar: str = ""  # URL or base64
    dates: List[DatePair] = []
    dynamic_features: Dict[str, Any] = {}  # feature_id -> value
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OlimpiadCreate(BaseModel):
    name: str
    subject: str
    level: str
    status: str
    avatar: str = ""
    dates: List[DatePair] = []

class OlimpiadUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = None
    avatar: Optional[str] = None
    dates: Optional[List[DatePair]] = None
    dynamic_features: Optional[Dict[str, Any]] = None

class DynamicFeatureCreate(BaseModel):
    name: str
    type: str

# Default black square image (1x1 pixel base64)
DEFAULT_BLACK_SQUARE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

# Routes for Dynamic Features Management
@api_router.get("/features", response_model=List[DynamicFeature])
async def get_dynamic_features():
    """Get all dynamic features"""
    features = await db.dynamic_features.find().to_list(1000)
    return [DynamicFeature(**feature) for feature in features]

@api_router.post("/features", response_model=DynamicFeature)
async def create_dynamic_feature(feature_data: DynamicFeatureCreate):
    """Create a new dynamic feature and add it to all existing olimpiads"""
    # Create the feature
    feature = DynamicFeature(
        name=feature_data.name,
        type=feature_data.type,
        default_value="none" if feature_data.type == "text" else DEFAULT_BLACK_SQUARE if feature_data.type == "img" else None
    )
    
    # Insert the feature
    await db.dynamic_features.insert_one(feature.dict())
    
    # Add this feature to all existing olimpiads with default value
    default_value = feature.default_value
    await db.olimpiads.update_many(
        {},
        {"$set": {f"dynamic_features.{feature.id}": default_value}}
    )
    
    return feature

@api_router.delete("/features/{feature_id}")
async def delete_dynamic_feature(feature_id: str):
    """Delete a dynamic feature and remove it from all olimpiads"""
    # Check if feature exists
    feature = await db.dynamic_features.find_one({"id": feature_id})
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    
    # Remove from all olimpiads
    await db.olimpiads.update_many(
        {},
        {"$unset": {f"dynamic_features.{feature_id}": ""}}
    )
    
    # Delete the feature
    await db.dynamic_features.delete_one({"id": feature_id})
    
    return {"message": "Feature deleted successfully"}

# Routes for Olimpiads
@api_router.get("/olimpiads", response_model=List[Olimpiad])
async def get_olimpiads(status: Optional[str] = None, search: Optional[str] = None):
    """Get all olimpiads with optional filtering"""
    query = {}
    
    # Filter by status if provided
    if status:
        query["status"] = status
    
    # Search by name or subject if provided
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}}
        ]
    
    olimpiads = await db.olimpiads.find(query).sort("created_at", -1).to_list(1000)
    return [Olimpiad(**olimpiad) for olimpiad in olimpiads]

@api_router.get("/olimpiads/{olimpiad_id}", response_model=Olimpiad)
async def get_olimpiad(olimpiad_id: str):
    """Get a specific olimpiad"""
    olimpiad = await db.olimpiads.find_one({"id": olimpiad_id})
    if not olimpiad:
        raise HTTPException(status_code=404, detail="Olimpiad not found")
    return Olimpiad(**olimpiad)

@api_router.post("/olimpiads", response_model=Olimpiad)
async def create_olimpiad(olimpiad_data: OlimpiadCreate):
    """Create a new olimpiad"""
    # Get all existing dynamic features
    features = await db.dynamic_features.find().to_list(1000)
    
    # Initialize dynamic_features with default values
    dynamic_features = {}
    for feature in features:
        default_value = "none" if feature["type"] == "text" else DEFAULT_BLACK_SQUARE if feature["type"] == "img" else None
        dynamic_features[feature["id"]] = default_value
    
    olimpiad = Olimpiad(
        **olimpiad_data.dict(),
        dynamic_features=dynamic_features
    )
    
    await db.olimpiads.insert_one(olimpiad.dict())
    return olimpiad

@api_router.put("/olimpiads/{olimpiad_id}", response_model=Olimpiad)
async def update_olimpiad(olimpiad_id: str, update_data: OlimpiadUpdate):
    """Update an olimpiad"""
    olimpiad = await db.olimpiads.find_one({"id": olimpiad_id})
    if not olimpiad:
        raise HTTPException(status_code=404, detail="Olimpiad not found")
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    # Update the olimpiad
    await db.olimpiads.update_one(
        {"id": olimpiad_id},
        {"$set": update_dict}
    )
    
    # Get updated olimpiad
    updated_olimpiad = await db.olimpiads.find_one({"id": olimpiad_id})
    return Olimpiad(**updated_olimpiad)

@api_router.delete("/olimpiads/{olimpiad_id}")
async def delete_olimpiad(olimpiad_id: str):
    """Delete an olimpiad"""
    result = await db.olimpiads.delete_one({"id": olimpiad_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Olimpiad not found")
    return {"message": "Olimpiad deleted successfully"}

@api_router.get("/olimpiads/by-status/{status}", response_model=List[Olimpiad])
async def get_olimpiads_by_status(status: str):
    """Get olimpiads by status"""
    valid_statuses = ['upcoming', 'register_opened', 'ongoing', 'completed']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    olimpiads = await db.olimpiads.find({"status": status}).sort("created_at", -1).to_list(1000)
    return [Olimpiad(**olimpiad) for olimpiad in olimpiads]

@api_router.post("/olimpiads/{olimpiad_id}/dates")
async def add_date_pair(olimpiad_id: str, date_pair: DatePair):
    """Add a date pair to a specific olimpiad"""
    olimpiad = await db.olimpiads.find_one({"id": olimpiad_id})
    if not olimpiad:
        raise HTTPException(status_code=404, detail="Olimpiad not found")
    
    # Add the new date pair
    await db.olimpiads.update_one(
        {"id": olimpiad_id},
        {"$push": {"dates": date_pair.dict()}}
    )
    
    return {"message": "Date pair added successfully"}

@api_router.put("/olimpiads/{olimpiad_id}/dynamic-feature/{feature_id}")
async def update_olimpiad_feature_value(olimpiad_id: str, feature_id: str, value: Dict[str, Any]):
    """Update a specific dynamic feature value for an olimpiad"""
    olimpiad = await db.olimpiads.find_one({"id": olimpiad_id})
    if not olimpiad:
        raise HTTPException(status_code=404, detail="Olimpiad not found")
    
    # Update the feature value
    await db.olimpiads.update_one(
        {"id": olimpiad_id},
        {"$set": {f"dynamic_features.{feature_id}": value["value"]}}
    )
    
    return {"message": "Feature value updated successfully"}

# Health check routes
@api_router.get("/")
async def root():
    return {"message": "Olimpiad Management API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
