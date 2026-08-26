from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend_app.core.database import get_db

router = APIRouter(tags=["Common & Platform Infrastructure"])

@router.get("/health", summary="System Health Check")
def health_check():
    return {"status": "ok", "service": "HiCore Slotify API Backend", "version": "1.0.0"}

@router.get("/system/status", summary="System Information")
def system_status():
    return {
        "status": "online",
        "supported_industries": ["doctor_appointment", "ecommerce"],
        "modules": {
            "doctor_appointment": "active",
            "ecommerce": "active"
        }
    }
