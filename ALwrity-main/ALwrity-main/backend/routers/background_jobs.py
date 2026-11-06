"""
Background Jobs API Routes

Provides endpoints for managing background jobs like comprehensive Bing insights generation.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger
from pydantic import BaseModel

from services.background_jobs import background_job_service
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/background-jobs", tags=["Background Jobs"])


class JobRequest(BaseModel):
    """Request model for creating a job"""
    job_type: str
    data: Dict[str, Any]


class JobResponse(BaseModel):
    """Response model for job operations"""
    success: bool
    job_id: Optional[str] = None
    message: str
    data: Optional[Dict[str, Any]] = None


@router.post("/create")
async def create_background_job(
    request: JobRequest,
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Create a new background job
    
    Args:
        request: Job creation request
        current_user: Current authenticated user
        
    Returns:
        Job creation result
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Validate job type
        valid_job_types = ['bing_comprehensive_insights', 'bing_data_collection', 'analytics_refresh']
        if request.job_type not in valid_job_types:
            raise HTTPException(status_code=400, detail=f"Invalid job type. Valid types: {valid_job_types}")
        
        # Create the job
        job_id = background_job_service.create_job(
            job_type=request.job_type,
            user_id=user_id,
            data=request.data
        )
        
        logger.info(f"Created background job {job_id} for user {user_id}")
        
        return JobResponse(
            success=True,
            job_id=job_id,
            message=f"Background job created successfully",
            data={'job_id': job_id}
        )
        
    except Exception as e:
        logger.error(f"Error creating background job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Get the status of a background job
    
    Args:
        job_id: Job ID to check
        current_user: Current authenticated user
        
    Returns:
        Job status information
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        job_status = background_job_service.get_job_status(job_id)
        
        if not job_status:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Verify the job belongs to the user
        if job_status['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return JobResponse(
            success=True,
            message="Job status retrieved successfully",
            data=job_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user-jobs")
async def get_user_jobs(
    limit: int = Query(10, description="Maximum number of jobs to return"),
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Get recent jobs for the current user
    
    Args:
        limit: Maximum number of jobs to return
        current_user: Current authenticated user
        
    Returns:
        List of user's jobs
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        jobs = background_job_service.get_user_jobs(user_id, limit)
        
        return JobResponse(
            success=True,
            message=f"Retrieved {len(jobs)} jobs for user",
            data={'jobs': jobs}
        )
        
    except Exception as e:
        logger.error(f"Error getting user jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel/{job_id}")
async def cancel_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Cancel a pending background job
    
    Args:
        job_id: Job ID to cancel
        current_user: Current authenticated user
        
    Returns:
        Cancellation result
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Check if job exists and belongs to user
        job_status = background_job_service.get_job_status(job_id)
        if not job_status:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job_status['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Cancel the job
        success = background_job_service.cancel_job(job_id)
        
        if success:
            return JobResponse(
                success=True,
                message="Job cancelled successfully",
                data={'job_id': job_id}
            )
        else:
            return JobResponse(
                success=False,
                message="Job cannot be cancelled (may be running or completed)",
                data={'job_id': job_id}
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bing/comprehensive-insights")
async def create_bing_comprehensive_insights_job(
    site_url: str = Query(..., description="Site URL to analyze"),
    days: int = Query(30, description="Number of days to analyze"),
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Create a background job to generate comprehensive Bing insights
    
    Args:
        site_url: Site URL to analyze
        days: Number of days to analyze
        current_user: Current authenticated user
        
    Returns:
        Job creation result
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Create the job
        job_id = background_job_service.create_job(
            job_type='bing_comprehensive_insights',
            user_id=user_id,
            data={
                'site_url': site_url,
                'days': days
            }
        )
        
        logger.info(f"Created Bing comprehensive insights job {job_id} for user {user_id}")
        
        return JobResponse(
            success=True,
            job_id=job_id,
            message="Bing comprehensive insights job created successfully. Check status for progress.",
            data={
                'job_id': job_id,
                'site_url': site_url,
                'days': days,
                'estimated_time': '2-5 minutes'
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating Bing comprehensive insights job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bing/data-collection")
async def create_bing_data_collection_job(
    site_url: str = Query(..., description="Site URL to collect data for"),
    days_back: int = Query(30, description="Number of days back to collect"),
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Create a background job to collect fresh Bing data from API
    
    Args:
        site_url: Site URL to collect data for
        days_back: Number of days back to collect
        current_user: Current authenticated user
        
    Returns:
        Job creation result
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Create the job
        job_id = background_job_service.create_job(
            job_type='bing_data_collection',
            user_id=user_id,
            data={
                'site_url': site_url,
                'days_back': days_back
            }
        )
        
        logger.info(f"Created Bing data collection job {job_id} for user {user_id}")
        
        return JobResponse(
            success=True,
            job_id=job_id,
            message="Bing data collection job created successfully. This will collect fresh data from Bing API.",
            data={
                'job_id': job_id,
                'site_url': site_url,
                'days_back': days_back,
                'estimated_time': '3-7 minutes'
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating Bing data collection job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/refresh")
async def create_analytics_refresh_job(
    platforms: str = Query("bing,gsc", description="Comma-separated list of platforms to refresh"),
    current_user: dict = Depends(get_current_user)
) -> JobResponse:
    """
    Create a background job to refresh analytics data for all platforms
    
    Args:
        platforms: Comma-separated list of platforms to refresh
        current_user: Current authenticated user
        
    Returns:
        Job creation result
    """
    try:
        user_id = current_user.get('id')
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        platform_list = [p.strip() for p in platforms.split(',')]
        
        # Create the job
        job_id = background_job_service.create_job(
            job_type='analytics_refresh',
            user_id=user_id,
            data={
                'platforms': platform_list
            }
        )
        
        logger.info(f"Created analytics refresh job {job_id} for user {user_id}")
        
        return JobResponse(
            success=True,
            job_id=job_id,
            message="Analytics refresh job created successfully. This will refresh data for all connected platforms.",
            data={
                'job_id': job_id,
                'platforms': platform_list,
                'estimated_time': '1-3 minutes'
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating analytics refresh job: {e}")
        raise HTTPException(status_code=500, detail=str(e))
