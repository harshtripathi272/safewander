from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from database import get_db, Settings
from schemas import SettingCreate, SettingResponse

router = APIRouter()

@router.get("/", response_model=List[SettingResponse])
async def get_settings(category: str = None, db: AsyncSession = Depends(get_db)):
    """Get all settings or settings for a specific category"""
    query = select(Settings)
    
    if category:
        query = query.where(Settings.category == category)
    
    result = await db.execute(query)
    settings = result.scalars().all()
    return settings

@router.get("/{category}/{key}")
async def get_setting(category: str, key: str, db: AsyncSession = Depends(get_db)):
    """Get a specific setting"""
    result = await db.execute(
        select(Settings)
        .where(Settings.category == category)
        .where(Settings.key == key)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    return setting

@router.post("/", response_model=SettingResponse)
async def create_or_update_setting(setting: SettingCreate, db: AsyncSession = Depends(get_db)):
    """Create or update a setting"""
    # Check if setting exists
    result = await db.execute(
        select(Settings)
        .where(Settings.category == setting.category)
        .where(Settings.key == setting.key)
    )
    db_setting = result.scalar_one_or_none()
    
    if db_setting:
        # Update existing setting
        db_setting.value = setting.value
    else:
        # Create new setting
        db_setting = Settings(**setting.model_dump())
        db.add(db_setting)
    
    await db.commit()
    await db.refresh(db_setting)
    return db_setting

@router.delete("/{category}/{key}")
async def delete_setting(category: str, key: str, db: AsyncSession = Depends(get_db)):
    """Delete a setting"""
    result = await db.execute(
        select(Settings)
        .where(Settings.category == category)
        .where(Settings.key == key)
    )
    setting = result.scalar_one_or_none()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    await db.delete(setting)
    await db.commit()
    return {"message": "Setting deleted successfully"}
