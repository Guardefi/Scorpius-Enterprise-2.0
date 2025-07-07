"""
AI Threat Predictor API endpoints.

This module provides REST API endpoints for AI-powered threat prediction,
anomaly detection, and security intelligence.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ...core.logging import get_logger
from ...core.profiling import profile_function
from ..cbom_engine.models import CBOMReport
from .models import ThreatPrediction, CryptoAnomaly
from .predictor import QuantumThreatPredictor

logger = get_logger(__name__)
router = APIRouter(prefix="/ai-threat-predictor", tags=["AI Threat Prediction"])

# Global predictor instance
predictor = QuantumThreatPredictor()


@router.post("/predict", response_model=List[ThreatPrediction])
@profile_function(name="api.ai_predictor.predict")
async def predict_threats(
    cbom_report: CBOMReport,
    background_tasks: BackgroundTasks,
) -> List[ThreatPrediction]:
    """
    Predict quantum threats from CBOM report using AI models.
    
    This endpoint analyzes cryptographic components and generates
    AI-powered threat predictions with confidence scores and timelines.
    """
    try:
        logger.info(
            "Starting AI threat prediction",
            report_id=cbom_report.id,
            component_count=len(cbom_report.entries)
        )
        
        # Generate predictions
        predictions = await predictor.predict_threats(cbom_report)
        
        # Schedule model training update in background
        background_tasks.add_task(
            _update_models_background,
            cbom_report
        )
        
        logger.info(
            "AI threat prediction completed",
            report_id=cbom_report.id,
            predictions_count=len(predictions)
        )
        
        return predictions
        
    except Exception as e:
        logger.error(f"AI threat prediction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Threat prediction failed: {str(e)}"
        )


@router.post("/anomalies", response_model=List[CryptoAnomaly])
@profile_function(name="api.ai_predictor.detect_anomalies")
async def detect_anomalies(
    cbom_report: CBOMReport
) -> List[CryptoAnomaly]:
    """
    Detect cryptographic anomalies in CBOM report.
    
    This endpoint uses machine learning and rule-based approaches
    to identify unusual cryptographic patterns and configurations.
    """
    try:
        logger.info(
            "Starting anomaly detection",
            report_id=cbom_report.id,
            component_count=len(cbom_report.entries)
        )
        
        anomalies = await predictor.detect_anomalies(cbom_report)
        
        logger.info(
            "Anomaly detection completed",
            report_id=cbom_report.id,
            anomalies_found=len(anomalies)
        )
        
        return anomalies
        
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Anomaly detection failed: {str(e)}"
        )


@router.get("/predictions/{prediction_id}", response_model=ThreatPrediction)
async def get_prediction(prediction_id: str) -> ThreatPrediction:
    """Get details of a specific threat prediction."""
    # In a real implementation, this would fetch from a database
    raise HTTPException(
        status_code=501,
        detail="Prediction retrieval not yet implemented"
    )


@router.get("/model/info")
async def get_model_info():
    """Get information about loaded AI models."""
    try:
        info = await predictor.get_model_info()
        return {
            "success": True,
            "data": info
        }
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )


@router.post("/model/train")
async def trigger_model_training(
    background_tasks: BackgroundTasks,
    force: bool = Query(False, description="Force retraining even if recently trained")
):
    """
    Trigger ML model training/retraining.
    
    This endpoint schedules model training in the background using
    available historical data.
    """
    try:
        background_tasks.add_task(_train_models_background, force)
        
        return {
            "success": True,
            "message": "Model training scheduled in background"
        }
        
    except Exception as e:
        logger.error(f"Failed to schedule model training: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule training: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Check AI predictor service health."""
    try:
        model_info = await predictor.get_model_info()
        
        return {
            "status": "healthy",
            "sklearn_available": model_info["sklearn_available"],
            "models_loaded": {
                "threat_classifier": model_info.get("threat_classifier_trained", False),
                "anomaly_detector": model_info.get("anomaly_detector_trained", False)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/patterns")
async def get_threat_patterns():
    """Get known threat patterns used by the AI predictor."""
    try:
        return {
            "success": True,
            "data": {
                "patterns": predictor.threat_patterns,
                "count": len(predictor.threat_patterns)
            }
        }
    except Exception as e:
        logger.error(f"Failed to get threat patterns: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get patterns: {str(e)}"
        )


async def _update_models_background(cbom_report: CBOMReport):
    """Background task to update models with new data."""
    try:
        logger.info("Updating AI models with new CBOM data")
        
        # Extract features for model updating
        features = predictor.feature_extractor.extract_features_from_cbom(cbom_report)
        
        if features:
            # In a real implementation, this would update models with new data
            # For now, we just log the activity
            logger.info(f"Extracted {len(features)} features for model updating")
            
        # Save models periodically
        await predictor.save_models()
        
    except Exception as e:
        logger.error(f"Background model update failed: {e}")


async def _train_models_background(force: bool = False):
    """Background task to train ML models."""
    try:
        logger.info("Starting background model training", force_retrain=force)
        
        # In a real implementation, this would:
        # 1. Collect historical CBOM reports
        # 2. Extract features and labels
        # 3. Train/retrain the models
        # 4. Validate model performance
        # 5. Save updated models
        
        # For demo purposes, we'll just log
        logger.info("Model training completed (demo mode)")
        
    except Exception as e:
        logger.error(f"Background model training failed: {e}")


# Additional utility endpoints

@router.get("/stats")
async def get_predictor_stats():
    """Get AI predictor usage statistics."""
    try:
        # In a real implementation, track prediction counts, accuracy, etc.
        return {
            "success": True,
            "data": {
                "predictions_made": 0,  # Would track actual counts
                "anomalies_detected": 0,
                "model_accuracy": 0.85,  # Would track actual accuracy
                "last_training": None,
                "uptime_hours": 0
            }
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get statistics: {str(e)}"
        )
