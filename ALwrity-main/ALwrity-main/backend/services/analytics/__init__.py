"""
Analytics Package

Modular analytics system for retrieving and processing data from connected platforms.
"""

from .models import AnalyticsData, PlatformType, AnalyticsStatus, PlatformConnectionStatus
from .handlers import (
    BaseAnalyticsHandler,
    GSCAnalyticsHandler,
    BingAnalyticsHandler,
    WordPressAnalyticsHandler,
    WixAnalyticsHandler
)
from .connection_manager import PlatformConnectionManager
from .summary_generator import AnalyticsSummaryGenerator
from .cache_manager import AnalyticsCacheManager
from .platform_analytics_service import PlatformAnalyticsService

__all__ = [
    # Models
    'AnalyticsData',
    'PlatformType',
    'AnalyticsStatus', 
    'PlatformConnectionStatus',
    
    # Handlers
    'BaseAnalyticsHandler',
    'GSCAnalyticsHandler',
    'BingAnalyticsHandler',
    'WordPressAnalyticsHandler',
    'WixAnalyticsHandler',
    
    # Managers
    'PlatformConnectionManager',
    'AnalyticsSummaryGenerator',
    'AnalyticsCacheManager',
    
    # Main Service
    'PlatformAnalyticsService'
]
