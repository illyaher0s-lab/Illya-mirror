"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# Distillation Schemas
class DistillationCreate(BaseModel):
    """Schema for creating a new distillation task"""
    name: str = Field(..., min_length=1, max_length=255, description="Name of the distillation task")
    raw_text: str = Field(..., min_length=1, description="Raw text content to be distilled")
    compressed_text: Optional[str] = Field(None, description="Optional pre-compressed text (if already processed by Gemini)")


class DistillationResponse(BaseModel):
    """Schema for distillation task response"""
    id: UUID
    name: str
    status: str
    current_layer: Optional[str] = None
    quality_score: Optional[str] = None
    error_message: Optional[str] = None
    layer1_result: Optional[dict] = None
    layer2_result: Optional[dict] = None
    layer3_result: Optional[dict] = None
    cognitive_profile: Optional[dict] = None
    quality_report: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DistillationList(BaseModel):
    """Schema for paginated distillation list response"""
    total: int
    items: List[DistillationResponse]
    skip: int
    limit: int


# Content Schemas
class ContentResponse(BaseModel):
    """Schema for content response"""
    id: UUID
    distillation_id: UUID
    raw_text: str
    compressed_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Cognitive Profile Schemas
class CognitiveProfileResponse(BaseModel):
    """Schema for cognitive profile response"""
    id: UUID
    distillation_id: UUID
    profile_json: dict
    created_at: datetime

    class Config:
        from_attributes = True


# Quality Report Schemas
class QualityReportResponse(BaseModel):
    """Schema for quality report response"""
    id: UUID
    distillation_id: UUID
    report_json: dict
    report_markdown: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
