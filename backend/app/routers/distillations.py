"""
Distillation API endpoints - CRUD operations for distillation tasks.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import Distillation, Content
from app.schemas import (
    DistillationCreate,
    DistillationResponse,
    DistillationList
)
from app.services.distillation_engine import run_distillation

router = APIRouter()


@router.post("/distillations", response_model=DistillationResponse, status_code=201)
async def create_distillation(
    distillation: DistillationCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new distillation task and start background processing.
    
    - **name**: Name of the distillation task
    - **raw_text**: Raw text content to be distilled
    - **compressed_text**: Optional pre-compressed text (if already processed by Gemini)
    
    The task is created with status='pending' and immediately starts layer1 extraction in background.
    """
    # Create distillation task with pending status
    db_distillation = Distillation(
        name=distillation.name,
        status="pending",
        current_layer="pending"
    )
    db.add(db_distillation)
    db.flush()  # Flush to get the ID before creating content
    
    # Create associated content record
    db_content = Content(
        distillation_id=db_distillation.id,
        raw_text=distillation.raw_text,
        compressed_text=distillation.compressed_text
    )
    db.add(db_content)
    
    # Commit both records
    db.commit()
    db.refresh(db_distillation)
    
    # Start background distillation task
    run_distillation(str(db_distillation.id))
    
    return db_distillation


@router.get("/distillations", response_model=DistillationList)
async def list_distillations(
    status: Optional[str] = Query(None, description="Filter by status (pending, processing, completed, failed)"),
    skip: int = Query(0, ge=0, description="Number of records to skip for pagination"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """
    List all distillation tasks with optional filtering and pagination.
    
    - **status**: Optional filter by task status
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (1-100)
    """
    # Build query
    query = db.query(Distillation)
    
    # Apply status filter if provided
    if status:
        query = query.filter(Distillation.status == status)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and order by created_at descending
    items = query.order_by(Distillation.created_at.desc()).offset(skip).limit(limit).all()
    
    return DistillationList(
        total=total,
        items=items,
        skip=skip,
        limit=limit
    )


@router.get("/distillations/{distillation_id}", response_model=DistillationResponse)
async def get_distillation(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific distillation task by ID.
    
    - **distillation_id**: UUID of the distillation task
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    return db_distillation


@router.delete("/distillations/{distillation_id}", status_code=204)
async def delete_distillation(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a distillation task by ID.
    
    - **distillation_id**: UUID of the distillation task to delete
    
    Due to CASCADE delete constraints, all related contents, cognitive_profiles, 
    and quality_reports will be automatically deleted.
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    db.delete(db_distillation)
    db.commit()
    
    return None


@router.get("/distillations/{distillation_id}/quality")
async def get_quality_report(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get quality report for a distillation task.
    
    - **distillation_id**: UUID of the distillation task
    """
    from app.models import QualityReport
    
    report = db.query(QualityReport).filter(QualityReport.distillation_id == distillation_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Quality report not found")
    
    return report


@router.get("/distillations/{distillation_id}/export")
async def export_distillation(
    distillation_id: UUID,
    format: str = Query("json", description="Export format: json, yaml, or markdown"),
    db: Session = Depends(get_db)
):
    """
    Export distillation results in various formats.
    
    - **distillation_id**: UUID of the distillation task
    - **format**: Export format (json, yaml, markdown)
    """
    distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    if not distillation:
        raise HTTPException(status_code=404, detail="Distillation not found")
    
    if format == "json":
        from fastapi.responses import JSONResponse
        data = {
            "name": distillation.name,
            "created_at": distillation.created_at.isoformat(),
            "layer1": distillation.layer1_result,
            "layer2": distillation.layer2_result,
            "layer3": distillation.layer3_result
        }
        return JSONResponse(content=data)
    
    elif format == "yaml":
        import yaml
        from fastapi.responses import Response
        data = {
            "name": distillation.name,
            "created_at": distillation.created_at.isoformat(),
            "layer1": distillation.layer1_result,
            "layer2": distillation.layer2_result,
            "layer3": distillation.layer3_result
        }
        yaml_content = yaml.dump(data, allow_unicode=True, default_flow_style=False)
        return Response(content=yaml_content, media_type="text/yaml")
    
    elif format == "markdown":
        from fastapi.responses import Response
        from app.models import QualityReport
        
        report = db.query(QualityReport).filter(QualityReport.distillation_id == distillation_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Quality report not found")
        
        return Response(content=report.markdown_report, media_type="text/markdown")
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use json, yaml, or markdown")

