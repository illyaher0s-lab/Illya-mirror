"""
Distillation engine with staged delivery and caching.
"""
import threading
import time
from sqlalchemy.orm import Session
from app.models import Distillation
from app.database import SessionLocal
from app.services.claude_distiller import compress_text, extract_layer1, extract_layer2, extract_layer3, extract_layer4


def run_distillation(distillation_id: str):
    """
    Start distillation task in background thread.
    
    Args:
        distillation_id: UUID of the distillation task
    """
    thread = threading.Thread(target=_distillation_worker, args=(distillation_id,))
    thread.daemon = True
    thread.start()


def _distillation_worker(distillation_id: str):
    """
    Background worker for text compression and three-layer distillation with staged delivery.
    
    Flow:
    0. Compress raw text using Claude
    1. Extract layer1 (foundational assumptions + paragraph index)
    2. Wait for user confirmation (current_layer = "layer1_done")
    3. Extract layer2 (reasoning patterns)
    4. Wait for user confirmation (current_layer = "layer2_done")
    5. Extract layer3 (expression strategies)
    6. Mark as completed
    
    User can stop at any layer by setting current_layer = "stopped"
    """
    db = SessionLocal()
    
    try:
        distillation = db.query(Distillation).filter_by(id=distillation_id).first()
        
        if not distillation:
            return
        
        # Get raw text from contents
        if not distillation.contents:
            distillation.status = "failed"
            distillation.error_message = "No content found"
            db.commit()
            return
        
        raw_text = distillation.contents[0].raw_text
        
        if not raw_text:
            distillation.status = "failed"
            distillation.error_message = "No raw text found"
            db.commit()
            return
        
        # ===== Step 0: Compress Text =====
        distillation.current_layer = "compressing"
        distillation.status = "processing"
        db.commit()
        
        try:
            compressed_text = compress_text(raw_text)
            
            # Save compressed text to content record
            distillation.contents[0].compressed_text = compressed_text
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Compression failed: {str(e)}"
            distillation.current_layer = "compression_failed"
            db.commit()
            return
        
        # ===== Layer 1: Foundational Assumptions =====
        distillation.current_layer = "layer1_running"
        db.commit()
        
        try:
            layer1_result = extract_layer1(compressed_text)
            
            distillation.layer1_result = layer1_result
            distillation.current_layer = "layer1_done"
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Layer 1 failed: {str(e)}"
            distillation.current_layer = "layer1_failed"
            db.commit()
            return
        
        # ===== Layer 2: Reasoning Patterns =====
        distillation.current_layer = "layer2_running"
        db.commit()
        
        try:
            layer2_result = extract_layer2(layer1_result)
            
            distillation.layer2_result = layer2_result
            distillation.current_layer = "layer2_done"
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Layer 2 failed: {str(e)}"
            distillation.current_layer = "layer2_failed"
            db.commit()
            return
        
        # ===== Layer 3: Expression Strategies =====
        distillation.current_layer = "layer3_running"
        db.commit()
        
        try:
            layer3_result = extract_layer3(layer1_result, layer2_result)
            
            distillation.layer3_result = layer3_result
            distillation.current_layer = "layer3_done"
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Layer 3 failed: {str(e)}"
            distillation.current_layer = "layer3_failed"
            db.commit()
            return
        
        # ===== Layer 4: Cognitive Operating System =====
        distillation.current_layer = "layer4_running"
        db.commit()
        
        try:
            layer4_result = extract_layer4(layer1_result, layer2_result, layer3_result)
            
            # Save to distillations.layer4_result
            distillation.layer4_result = layer4_result
            distillation.current_layer = "layer4_done"
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Layer 4 failed: {str(e)}"
            distillation.current_layer = "layer4_failed"
            db.commit()
            return
        
        # ===== Generate Quality Report =====
        distillation.current_layer = "generating_report"
        db.commit()
        
        try:
            _generate_quality_report(db, distillation)
            
            distillation.current_layer = "completed"
            distillation.status = "completed"
            db.commit()
        except Exception as e:
            distillation.status = "failed"
            distillation.error_message = f"Quality report generation failed: {str(e)}"
            distillation.current_layer = "report_failed"
            db.commit()
            return
        
    except Exception as e:
        distillation.status = "failed"
        distillation.error_message = f"Unexpected error: {str(e)}"
        db.commit()
    finally:
        db.close()


def _generate_quality_report(db: Session, distillation: Distillation):
    """
    Generate quality report after layer3 completion.
    """
    from app.services.quality_evaluator import QualityEvaluator
    from app.services.report_generator import ReportGenerator
    from app.models import QualityReport
    import asyncio
    
    evaluator = QualityEvaluator()
    generator = ReportGenerator()
    
    layer1 = distillation.layer1_result or {}
    layer2 = distillation.layer2_result or {}
    layer3 = distillation.layer3_result or {}
    
    # Coverage analysis
    coverage = evaluator.analyze_coverage(layer1, layer2, layer3)
    
    # Bad case detection (async call)
    bad_cases = asyncio.run(evaluator.detect_bad_cases(layer1, layer2))
    
    # Overall score
    overall_score = evaluator.calculate_overall_score(
        layer1, layer2, layer3, coverage, bad_cases
    )
    
    # Iteration suggestions
    suggestions = evaluator.generate_iteration_suggestions(
        coverage, bad_cases, overall_score
    )
    
    # Generate markdown report
    markdown_report = generator.generate_markdown_report(
        distillation.name,
        layer1, layer2, layer3,
        overall_score, coverage, bad_cases, suggestions
    )
    
    # Save to database
    report_data = {
        "overall_score": overall_score["score"],
        "rating": overall_score["rating"],
        "coverage_analysis": coverage,
        "confidence_analysis": {
            "breakdown": overall_score["breakdown"]
        },
        "bad_cases": bad_cases,
        "iteration_suggestions": suggestions
    }
    quality_report = QualityReport(
        distillation_id=distillation.id,
        report_json=report_data,
        report_markdown=markdown_report
    )
    db.add(quality_report)
    db.commit()
    print(f"[{distillation.id}] Quality report generated and saved")
