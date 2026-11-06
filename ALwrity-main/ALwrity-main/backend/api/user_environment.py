"""
User Environment API endpoints
Handles user-specific environment setup and management.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from loguru import logger

from services.progressive_setup_service import ProgressiveSetupService
from services.database import get_db_session
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/user-environment", tags=["user-environment"])

@router.post("/initialize")
async def initialize_user_environment(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Initialize user environment based on onboarding progress."""
    try:
        user_id = str(current_user.get('id'))
        db_session = get_db_session()
        
        if not db_session:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        setup_service = ProgressiveSetupService(db_session)
        result = setup_service.initialize_user_environment(user_id)
        
        return {
            "message": "User environment initialized successfully",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error initializing user environment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing user environment: {str(e)}")
    finally:
        if db_session:
            db_session.close()

@router.get("/status")
async def get_user_environment_status(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user environment status."""
    try:
        user_id = str(current_user.get('id'))
        db_session = get_db_session()
        
        if not db_session:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        setup_service = ProgressiveSetupService(db_session)
        status = setup_service.get_user_environment_status(user_id)
        
        return status
        
    except Exception as e:
        logger.error(f"Error getting user environment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting user environment status: {str(e)}")
    finally:
        if db_session:
            db_session.close()

@router.post("/upgrade")
async def upgrade_user_environment(
    new_step: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upgrade user environment when progressing in onboarding."""
    try:
        user_id = str(current_user.get('id'))
        db_session = get_db_session()
        
        if not db_session:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        setup_service = ProgressiveSetupService(db_session)
        result = setup_service.upgrade_user_environment(user_id, new_step)
        
        return {
            "message": "User environment upgraded successfully",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error upgrading user environment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error upgrading user environment: {str(e)}")
    finally:
        if db_session:
            db_session.close()

@router.delete("/cleanup")
async def cleanup_user_environment(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Clean up user environment (for account deletion)."""
    try:
        user_id = str(current_user.get('id'))
        db_session = get_db_session()
        
        if not db_session:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        setup_service = ProgressiveSetupService(db_session)
        success = setup_service.cleanup_user_environment(user_id)
        
        if success:
            return {"message": "User environment cleaned up successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to cleanup user environment")
        
    except Exception as e:
        logger.error(f"Error cleaning up user environment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cleaning up user environment: {str(e)}")
    finally:
        if db_session:
            db_session.close()

@router.get("/workspace")
async def get_user_workspace_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user workspace information."""
    try:
        user_id = str(current_user.get('id'))
        db_session = get_db_session()
        
        if not db_session:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        setup_service = ProgressiveSetupService(db_session)
        workspace_manager = setup_service.workspace_manager
        workspace = workspace_manager.get_user_workspace(user_id)
        
        if not workspace:
            raise HTTPException(status_code=404, detail="User workspace not found")
        
        return workspace
        
    except Exception as e:
        logger.error(f"Error getting user workspace: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting user workspace: {str(e)}")
    finally:
        if db_session:
            db_session.close()
