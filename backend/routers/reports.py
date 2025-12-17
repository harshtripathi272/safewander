from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db, Report
from schemas import ReportCreate, ReportResponse
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
async def get_reports(db: AsyncSession = Depends(get_db)):
    """Get all reports"""
    result = await db.execute(select(Report))
    reports = result.scalars().all()
    return reports

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific report"""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: AsyncSession = Depends(get_db)):
    """Generate a new report"""
    db_report = Report(
        id=str(uuid.uuid4()),
        **report.model_dump()
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report

@router.delete("/{report_id}")
async def delete_report(report_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a report"""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await db.delete(report)
    await db.commit()
    return {"message": "Report deleted successfully"}
