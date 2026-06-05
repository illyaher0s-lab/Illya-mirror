"""
Distillation API endpoints - CRUD operations for distillation tasks.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import chardet

from app.database import get_db
from app.models import Distillation, Content
from app.schemas import (
    DistillationCreate,
    DistillationResponse,
    DistillationList
)
from app.services.distillation_engine import run_distillation

router = APIRouter()


@router.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a text file and auto-detect encoding.
    Returns decoded text content.
    """
    try:
        # Read file content as bytes
        content_bytes = await file.read()
        
        # Detect encoding
        detected = chardet.detect(content_bytes)
        encoding = detected['encoding']
        confidence = detected['confidence']
        
        # Fallback to utf-8 if detection confidence is too low
        if confidence < 0.7:
            encoding = 'utf-8'
        
        # Decode text
        try:
            text = content_bytes.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            # If detected encoding fails, try common Chinese encodings
            for fallback_encoding in ['gbk', 'gb2312', 'gb18030', 'utf-8']:
                try:
                    text = content_bytes.decode(fallback_encoding)
                    encoding = fallback_encoding
                    break
                except (UnicodeDecodeError, LookupError):
                    continue
            else:
                raise HTTPException(status_code=400, detail="无法识别文件编码")
        
        return {
            "text": text,
            "encoding": encoding,
            "confidence": confidence,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件处理失败: {str(e)}")


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
    from app.models import QualityReport, CognitiveProfile
    
    db_distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    
    if not db_distillation:
        raise HTTPException(status_code=404, detail=f"Distillation task {distillation_id} not found")
    
    # Fetch quality report if exists
    quality_report = db.query(QualityReport).filter(QualityReport.distillation_id == distillation_id).first()
    
    # Fetch cognitive profile if exists
    cognitive_profile = db.query(CognitiveProfile).filter(CognitiveProfile.distillation_id == distillation_id).first()
    
    # Transform quality report to frontend format
    transformed_quality_report = None
    if quality_report and quality_report.report_json:
        report_data = quality_report.report_json
        
        # Calculate total paragraphs and covered paragraphs from coverage_analysis
        coverage = report_data.get("coverage_analysis", {})
        total_paragraphs = 0
        covered_paragraphs = 0
        
        for layer_key in ["cognitive_layer", "expression_layer", "interaction_layer"]:
            layer_data = coverage.get(layer_key, {})
            threshold = layer_data.get("threshold", 0)
            count = layer_data.get("count", 0)
            total_paragraphs += threshold
            covered_paragraphs += min(count, threshold)
        
        coverage_rate = round((covered_paragraphs / total_paragraphs * 100) if total_paragraphs > 0 else 0, 1)
        
        # Extract confidence score from confidence_analysis
        confidence_analysis = report_data.get("confidence_analysis", {})
        confidence_breakdown = confidence_analysis.get("breakdown", {})
        confidence_score = round(confidence_breakdown.get("confidence", 0))
        
        transformed_quality_report = {
            "overall_score": report_data.get("overall_score", 0),
            "confidence_score": confidence_score,
            "bad_cases": report_data.get("bad_cases", []),
            "coverage_analysis": {
                "total_paragraphs": total_paragraphs,
                "covered_paragraphs": covered_paragraphs,
                "coverage_rate": coverage_rate
            }
        }
    
    # Build response dict
    response_data = {
        "id": db_distillation.id,
        "name": db_distillation.name,
        "status": db_distillation.status,
        "current_layer": db_distillation.current_layer,
        "quality_score": db_distillation.quality_score,
        "error_message": db_distillation.error_message,
        "layer1_result": db_distillation.layer1_result,
        "layer2_result": db_distillation.layer2_result,
        "layer3_result": db_distillation.layer3_result,
        "layer4_result": db_distillation.layer4_result,
        "cognitive_profile": cognitive_profile.profile_json if cognitive_profile else db_distillation.layer4_result,  # Backward compatibility
        "created_at": db_distillation.created_at,
        "updated_at": db_distillation.updated_at,
        "quality_report": transformed_quality_report
    }
    
    return response_data


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
    Export Layer 4 (cognitive profile) results in various formats.
    
    - **distillation_id**: UUID of the distillation task
    - **format**: Export format (json, yaml, markdown)
    """
    distillation = db.query(Distillation).filter(Distillation.id == distillation_id).first()
    if not distillation:
        raise HTTPException(status_code=404, detail="Distillation not found")
    
    if not distillation.layer4_result:
        raise HTTPException(status_code=404, detail="Layer 4 result not found")
    
    if format == "json":
        from fastapi.responses import JSONResponse
        data = {
            "name": distillation.name,
            "created_at": distillation.created_at.isoformat(),
            "layer4": distillation.layer4_result
        }
        return JSONResponse(content=data)
    
    elif format == "yaml":
        import yaml
        from fastapi.responses import Response
        data = {
            "name": distillation.name,
            "created_at": distillation.created_at.isoformat(),
            "layer4": distillation.layer4_result
        }
        yaml_content = yaml.dump(data, allow_unicode=True, default_flow_style=False)
        return Response(content=yaml_content, media_type="text/yaml")
    
    elif format == "markdown":
        from fastapi.responses import Response
        import json
        
        # Convert layer4 JSON to readable markdown
        layer4 = distillation.layer4_result
        markdown_lines = [
            f"# {distillation.name} - Layer 4 认知画像",
            f"\n**创建时间**: {distillation.created_at.isoformat()}\n",
            "---\n"
        ]
        
        # Identity section
        if layer4.get("identity"):
            identity = layer4["identity"]
            markdown_lines.append("## 身份信息\n")
            markdown_lines.append(f"- **模拟对象**: {identity.get('subject', 'N/A')}")
            markdown_lines.append(f"- **覆盖范围**: {identity.get('simulation_scope', 'N/A')}\n")
            
            if identity.get("known_blind_spots"):
                markdown_lines.append("### 已知盲点\n")
                for spot in identity["known_blind_spots"]:
                    markdown_lines.append(f"- {spot}")
                markdown_lines.append("")
        
        # Core assumptions
        if layer4.get("core_assumptions"):
            markdown_lines.append("## 核心假设\n")
            for i, assumption in enumerate(layer4["core_assumptions"], 1):
                markdown_lines.append(f"### {i}. {assumption.get('id', 'N/A')}")
                markdown_lines.append(f"\n**陈述**: {assumption.get('statement', 'N/A')}")
                markdown_lines.append(f"\n**置信度**: {assumption.get('confidence', 'N/A')}\n")
        
        # Reasoning engine
        if layer4.get("reasoning_engine"):
            reasoning_engine = layer4["reasoning_engine"]
            markdown_lines.append("## 推理引擎\n")
            if reasoning_engine.get("description"):
                markdown_lines.append(f"**整体风格**: {reasoning_engine['description']}\n")
            
            if reasoning_engine.get("patterns"):
                markdown_lines.append("### 推理规则\n")
                for pattern in reasoning_engine["patterns"]:
                    markdown_lines.append(f"#### {pattern.get('id', 'N/A')}: {pattern.get('name', 'N/A')}")
                    markdown_lines.append(f"\n**触发条件**: {pattern.get('trigger', 'N/A')}")
                    markdown_lines.append(f"\n**置信度**: {pattern.get('confidence', 'N/A')}")
                    if pattern.get("steps"):
                        markdown_lines.append("\n**推理步骤**:")
                        for step in pattern["steps"]:
                            markdown_lines.append(f"- {step}")
                    if pattern.get("depends_on"):
                        markdown_lines.append(f"\n**依赖假设**: {', '.join(pattern['depends_on'])}")
                    markdown_lines.append("")
        
        # Expression engine
        if layer4.get("expression_engine"):
            expression_engine = layer4["expression_engine"]
            markdown_lines.append("## 表达引擎\n")
            if expression_engine.get("description"):
                markdown_lines.append(f"**整体风格**: {expression_engine['description']}\n")
            
            if expression_engine.get("strategies"):
                markdown_lines.append("### 表达策略\n")
                for strategy in expression_engine["strategies"]:
                    markdown_lines.append(f"#### {strategy.get('id', 'N/A')}: {strategy.get('name', 'N/A')}")
                    markdown_lines.append(f"\n**使用场景**: {strategy.get('when_to_use', 'N/A')}")
                    markdown_lines.append(f"\n**具体做法**: {strategy.get('how', 'N/A')}")
                    markdown_lines.append(f"\n**置信度**: {strategy.get('confidence', 'N/A')}\n")
            
            if expression_engine.get("silence_rules"):
                markdown_lines.append("### 沉默策略\n")
                for rule in expression_engine["silence_rules"]:
                    markdown_lines.append(f"- **回避**: {rule.get('avoid', 'N/A')}")
                    markdown_lines.append(f"  - **原因**: {rule.get('reason', 'N/A')}")
                    markdown_lines.append(f"  - **置信度**: {rule.get('confidence', 'N/A')}\n")
            
            if expression_engine.get("signature_phrases"):
                markdown_lines.append("### 标志性表达\n")
                for phrase in expression_engine["signature_phrases"]:
                    markdown_lines.append(f"- **{phrase.get('phrase', 'N/A')}**: {phrase.get('use_when', 'N/A')}")
                markdown_lines.append("")
        
        # Usage instructions
        if layer4.get("usage_instructions"):
            markdown_lines.append("## 使用说明\n")
            instructions = layer4["usage_instructions"]
            if instructions.get("for_new_question"):
                markdown_lines.append("### 处理新问题\n")
                markdown_lines.append(instructions["for_new_question"] + "\n")
            if instructions.get("for_opinion_judgment"):
                markdown_lines.append("### 判断观点\n")
                markdown_lines.append(instructions["for_opinion_judgment"] + "\n")
            if instructions.get("for_expression_task"):
                markdown_lines.append("### 生成表达\n")
                markdown_lines.append(instructions["for_expression_task"] + "\n")
            if instructions.get("default"):
                markdown_lines.append("### 默认处理\n")
                markdown_lines.append(instructions["default"] + "\n")
        
        markdown_content = "\n".join(markdown_lines)
        return Response(content=markdown_content, media_type="text/markdown")
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use json, yaml, or markdown")

