"""
SQLAlchemy models for Mirror application.
"""
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class Distillation(Base):
    """蒸馏任务表"""
    __tablename__ = "distillations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    quality_score = Column(String(10), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Layer results for staged delivery
    layer1_result = Column(JSONB, nullable=True)
    layer2_result = Column(JSONB, nullable=True)
    layer3_result = Column(JSONB, nullable=True)
    layer4_result = Column(JSONB, nullable=True)
    current_layer = Column(String(20), nullable=True)
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    contents = relationship("Content", back_populates="distillation", cascade="all, delete-orphan")
    cognitive_profiles = relationship("CognitiveProfile", back_populates="distillation", cascade="all, delete-orphan")
    quality_reports = relationship("QualityReport", back_populates="distillation", cascade="all, delete-orphan")


class Content(Base):
    """原始内容表"""
    __tablename__ = "contents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    distillation_id = Column(UUID(as_uuid=True), ForeignKey("distillations.id", ondelete="CASCADE"), nullable=False)
    raw_text = Column(Text, nullable=False)
    compressed_text = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    distillation = relationship("Distillation", back_populates="contents")


class CognitiveProfile(Base):
    """认知档案表"""
    __tablename__ = "cognitive_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    distillation_id = Column(UUID(as_uuid=True), ForeignKey("distillations.id", ondelete="CASCADE"), nullable=False)
    profile_json = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    distillation = relationship("Distillation", back_populates="cognitive_profiles")


class QualityReport(Base):
    """质量报告表"""
    __tablename__ = "quality_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    distillation_id = Column(UUID(as_uuid=True), ForeignKey("distillations.id", ondelete="CASCADE"), nullable=False)
    report_json = Column(JSONB, nullable=False)
    report_markdown = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    distillation = relationship("Distillation", back_populates="quality_reports")
