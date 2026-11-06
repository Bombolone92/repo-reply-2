"""
Error Logging Router
Provides endpoints for frontend error reporting
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ErrorLogRequest(BaseModel):
    error_message: str
    error_stack: Optional[str] = None
    component_stack: Optional[str] = None
    user_id: Optional[str] = None
    url: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: Optional[str] = None
    additional_info: Optional[dict] = None

@router.post("/log-error")
async def log_frontend_error(error_log: ErrorLogRequest):
    """
    Log errors from the frontend for monitoring and debugging
    """
    try:
        # Log the error with all details
        logger.error(
            f"Frontend Error: {error_log.error_message}",
            extra={
                "error_stack": error_log.error_stack,
                "component_stack": error_log.component_stack,
                "user_id": error_log.user_id,
                "url": error_log.url,
                "user_agent": error_log.user_agent,
                "timestamp": error_log.timestamp,
                "additional_info": error_log.additional_info
            }
        )
        
        return {
            "status": "success",
            "message": "Error logged successfully"
        }
    except Exception as e:
        logger.error(f"Failed to log frontend error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to log error")

