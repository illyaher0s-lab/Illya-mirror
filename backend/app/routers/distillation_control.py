from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import Distillation

router = APIRouter()


@router.post("/distillations/{distillation_id}/continue", status_code=200)
async def continue_distillation(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Continue to the next layer of distillation.
    
    User clicks "Continue" button after reviewing layer1 or layer2 results.
    This updates current_layer to signal the background worker to proceed.
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    # Update current_layer to continue signal
    if db_distillation.current_layer == "layer1_done":
        db_distillation.current_layer = "layer1_continue"
    elif db_distillation.current_layer == "layer2_done":
        db_distillation.current_layer = "layer2_continue"
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot continue from current_layer={db_distillation.current_layer}"
        )
    
    db.commit()
    db.refresh(db_distillation)
    
    return {"status": "continued", "current_layer": db_distillation.current_layer}


@router.post("/distillations/{distillation_id}/stop", status_code=200)
async def stop_distillation(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Stop the distillation task at current layer.
    
    User clicks "Stop" button. The background worker will detect this and terminate.
    Already completed layers are preserved.
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    db_distillation.current_layer = "stopped"
    db_distillation.status = "stopped"
    db.commit()
    db.refresh(db_distillation)
    
    return {"status": "stopped"}


@router.get("/distillations/{distillation_id}/layer1")
async def get_layer1_result(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get layer1 result (foundational assumptions + paragraph index).
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    if not db_distillation.layer1_result:
        raise HTTPException(status_code=404, detail="Layer1 result not available yet")
    
    return db_distillation.layer1_result


@router.get("/distillations/{distillation_id}/layer2")
async def get_layer2_result(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get layer2 result (reasoning patterns).
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    if not db_distillation.layer2_result:
        raise HTTPException(status_code=404, detail="Layer2 result not available yet")
    
    return db_distillation.layer2_result


@router.get("/distillations/{distillation_id}/layer3")
async def get_layer3_result(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get layer3 result (expression strategies).
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    if not db_distillation.layer3_result:
        raise HTTPException(status_code=404, detail="Layer3 result not available yet")
    
    return db_distillation.layer3_result


@router.get("/distillations/{distillation_id}/status")
async def get_distillation_status(
    distillation_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get real-time status of distillation task for frontend polling.
    
    Returns current_layer, status, and available results.
    """
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    return {
        "id": str(db_distillation.id),
        "name": db_distillation.name,
        "status": db_distillation.status,
        "current_layer": db_distillation.current_layer,
        "error_message": db_distillation.error_message,
        "layer1_available": db_distillation.layer1_result is not None,
        "layer2_available": db_distillation.layer2_result is not None,
        "layer3_available": db_distillation.layer3_result is not None,
        "created_at": db_distillation.created_at,
        "updated_at": db_distillation.updated_at
    }
